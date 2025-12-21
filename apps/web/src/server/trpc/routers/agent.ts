import { getSessionWithRetry } from "@studio233/auth/lib/session";
import type { Prisma } from "@studio233/db";
import { prisma } from "@studio233/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../init";

export const agentRouter = router({
	// Get all threads for the current user (optionally filtered by project)
	getThreads: publicProcedure
		.input(
			z.object({
				projectId: z.string().optional(),
				limit: z.number().min(1).max(50).default(20),
				cursor: z.string().nullish(),
			}),
		)
		.query(async ({ input, ctx }) => {
			const headers = new Headers(ctx.req?.headers);
			const session = await getSessionWithRetry(headers);

			if (!session) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "You must be logged in to view chat history",
				});
			}

			const { projectId, limit, cursor } = input;

			const items = await prisma.agentThread.findMany({
				take: limit + 1, // get an extra item at the end which we'll use as next cursor
				where: {
					userId: session.user.id,
					...(projectId ? { projectId } : {}),
				},
				cursor: cursor ? { id: cursor } : undefined,
				orderBy: {
					updatedAt: "desc",
				},
				include: {
					_count: {
						select: { messages: true },
					},
				},
			});

			let nextCursor: typeof cursor | undefined = undefined;
			if (items.length > limit) {
				const nextItem = items.pop();
				nextCursor = nextItem!.id;
			}

			return {
				items,
				nextCursor,
			};
		}),

	// Get a specific thread with messages
	getThread: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input, ctx }) => {
			const headers = new Headers(ctx.req?.headers);
			const session = await getSessionWithRetry(headers);

			if (!session) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "You must be logged in to view a thread",
				});
			}

			const thread = await prisma.agentThread.findUnique({
				where: { id: input.id },
				include: {
					messages: {
						orderBy: { createdAt: "asc" },
					},
				},
			});

			if (!thread || (thread.userId && thread.userId !== session.user.id)) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Thread not found or unauthorized",
				});
			}

			return thread;
		}),

	// Create a new thread
	createThread: publicProcedure
		.input(
			z.object({
				title: z.string().optional(),
				projectId: z.string().optional(),
				metadata: z.record(z.string(), z.unknown()).optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const headers = new Headers(ctx.req?.headers);
			const session = await getSessionWithRetry(headers);

			if (!session) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "You must be logged in to create a thread",
				});
			}

			return await prisma.agentThread.create({
				data: {
					userId: session.user.id,
					title: input.title || "New Conversation",
					projectId: input.projectId,
					metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
				},
			});
		}),

	// Delete a thread
	deleteThread: publicProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const headers = new Headers(ctx.req?.headers);
			const session = await getSessionWithRetry(headers);

			if (!session) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "You must be logged in to delete a thread",
				});
			}

			const thread = await prisma.agentThread.findUnique({
				where: { id: input.id },
			});

			if (!thread || (thread.userId && thread.userId !== session.user.id)) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Thread not found or unauthorized",
				});
			}

			return await prisma.agentThread.delete({
				where: { id: input.id },
			});
		}),

	// Update thread title
	updateThread: publicProcedure
		.input(
			z.object({
				id: z.string(),
				title: z.string(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const headers = new Headers(ctx.req?.headers);
			const session = await getSessionWithRetry(headers);

			if (!session) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "You must be logged in to update a thread",
				});
			}

			const thread = await prisma.agentThread.findUnique({
				where: { id: input.id },
			});

			if (!thread || (thread.userId && thread.userId !== session.user.id)) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Thread not found or unauthorized",
				});
			}

			return await prisma.agentThread.update({
				where: { id: input.id },
				data: { title: input.title },
			});
		}),
});
