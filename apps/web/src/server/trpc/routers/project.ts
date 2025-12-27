import { getSessionWithRetry } from "@studio233/auth/lib/session";
import { Prisma, prisma } from "@studio233/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../init";

export const projectRouter = router({
	create: publicProcedure
		.input(
			z.object({
				name: z.string().optional(),
				description: z.string().optional(),
				workspaceId: z.string().optional(),
				type: z.enum(["CANVAS", "STUDIO"]).optional().default("CANVAS"),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const headers = new Headers(ctx.req?.headers);
			const session = await getSessionWithRetry(headers);

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
						workspaceId: input.workspaceId,
						type: input.type,
					},
				});

				// Only create default canvas for CANVAS type projects
				if (input.type === "CANVAS") {
					await tx.canvas.create({
						data: {
							name: "Main Canvas",
							projectId: newProject.id,
							data: {}, // Empty canvas data
						},
					});
				}

				// Create a default workflow definition for STUDIO projects
				if (input.type === "STUDIO") {
					await tx.workflowDefinition.create({
						data: {
							name: "Main Workflow",
							description: "",
							projectId: newProject.id,
							userId: session.user.id,
							nodes: [],
							edges: [],
						},
					});
				}

				return newProject;
			});

			return project;
		}),

	update: publicProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().optional(),
				description: z.string().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const headers = new Headers(ctx.req?.headers);
			const session = await getSessionWithRetry(headers);

			if (!session) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "You must be logged in to update a project",
				});
			}

			// Verify ownership
			const project = await prisma.project.findUnique({
				where: { id: input.id },
			});

			if (!project || project.userId !== session.user.id) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found or unauthorized",
				});
			}

			return await prisma.project.update({
				where: { id: input.id },
				data: {
					name: input.name,
					description: input.description,
				},
			});
		}),

	delete: publicProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const headers = new Headers(ctx.req?.headers);
			const session = await getSessionWithRetry(headers);

			if (!session) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "You must be logged in to delete a project",
				});
			}

			// Verify ownership
			const project = await prisma.project.findUnique({
				where: { id: input.id },
			});

			if (!project || project.userId !== session.user.id) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found or unauthorized",
				});
			}

			return await prisma.project.delete({
				where: { id: input.id },
			});
		}),

	duplicate: publicProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const headers = new Headers(ctx.req?.headers);
			const session = await getSessionWithRetry(headers);

			if (!session) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "You must be logged in to duplicate a project",
				});
			}

			// Fetch original project with full canvas structure (and workflow definitions)
			const originalProject = await prisma.project.findUnique({
				where: { id: input.id },
				include: {
					workflowDefinitions: true,
					canvases: {
						include: {
							elements: true,
						},
					},
				},
			});

			if (!originalProject || originalProject.userId !== session.user.id) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found or unauthorized",
				});
			}

			// Perform duplication in transaction
			return await prisma.$transaction(async (tx) => {
				// 1. Create new Project
				const newProject = await tx.project.create({
					data: {
						name: `${originalProject.name} (Copy)`,
						description: originalProject.description,
						thumbnail: originalProject.thumbnail,
						userId: session.user.id,
						workspaceId: originalProject.workspaceId,
						type: originalProject.type,
					},
				});

				if (originalProject.type === "CANVAS") {
					// 2. Duplicate Canvases and Elements
					for (const canvas of originalProject.canvases) {
						const newCanvas = await tx.canvas.create({
							data: {
								name: canvas.name,
								width: canvas.width,
								height: canvas.height,
								data: canvas.data ?? {},
								projectId: newProject.id,
							},
						});

						// Bulk create elements for this canvas
						if (canvas.elements.length > 0) {
							await tx.canvasElement.createMany({
								data: canvas.elements.map((el) => ({
									canvasId: newCanvas.id,
									kind: el.kind,
									data: el.data ?? {},
									zIndex: el.zIndex,
								})),
							});
						}
					}
				} else {
					// 2. Duplicate Workflow Definitions
					for (const workflow of originalProject.workflowDefinitions) {
						await tx.workflowDefinition.create({
							data: {
								name: workflow.name,
								description: workflow.description,
								userId: session.user.id,
								projectId: newProject.id,
								nodes: (workflow.nodes ?? []) as Prisma.InputJsonValue,
								edges: (workflow.edges ?? []) as Prisma.InputJsonValue,
							},
						});
					}
				}

				return newProject;
			});
		}),
	getById: publicProcedure
		.input(
			z.object({
				id: z.string(),
			}),
		)
		.query(async ({ input, ctx }) => {
			const headers = new Headers(ctx.req?.headers);
			const session = await getSessionWithRetry(headers);

			if (!session) {
				return null;
			}

			const project = await prisma.project.findFirst({
				where: {
					id: input.id,
					userId: session.user.id,
				},
				select: {
					id: true,
					name: true,
					description: true,
					thumbnail: true,
					workspaceId: true,
					createdAt: true,
					updatedAt: true,
				},
			});

			return project;
		}),
	getRecent: publicProcedure.query(async ({ ctx }) => {
		const headers = new Headers(ctx.req?.headers);
		const session = await getSessionWithRetry(headers);

		if (!session) {
			return [];
		}

		return await prisma.project.findMany({
			where: {
				userId: session.user.id,
			},
			orderBy: {
				updatedAt: "desc",
			},
			take: 3,
			select: {
				id: true,
				name: true,
				updatedAt: true,
			},
		});
	}),
});
