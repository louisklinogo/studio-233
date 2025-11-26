import { auth } from "@studio233/auth";
import { prisma } from "@studio233/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../init";

export const projectRouter = router({
	create: publicProcedure
		.input(
			z.object({
				name: z.string().optional(),
				description: z.string().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const headers = new Headers(ctx.req?.headers);
			const session = await auth.api.getSession({
				headers,
			});

			if (!session) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "You must be logged in to create a project",
				});
			}

			const name = input.name || "Untitled Project";

			// Create Project and Default Canvas transactionally
			const project = await prisma.$transaction(async (tx) => {
				const newProject = await tx.project.create({
					data: {
						name,
						description: input.description,
						userId: session.user.id,
					},
				});

				// Create default canvas
				await tx.canvas.create({
					data: {
						name: "Main Canvas",
						projectId: newProject.id,
						data: {}, // Empty canvas data
					},
				});

				return newProject;
			});

			return project;
		}),
});
