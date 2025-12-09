import { getSessionWithRetry } from "@studio233/auth/lib/session";
import { Prisma, prisma } from "@studio233/db";
import { TRPCError } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { nanoid } from "nanoid";
import { z } from "zod";
import { inngest } from "@/inngest/client";
import { workflowRequestedEvent } from "@/inngest/events";
import { kv } from "@/lib/kv";
import { publicProcedure, router } from "../init";

const nodeSchema = z
	.object({
		id: z.string(),
		type: z.string().optional(),
		position: z.object({ x: z.number(), y: z.number() }),
		data: z.record(z.string(), z.any()).optional(),
	})
	.passthrough();

const edgeSchema = z
	.object({
		id: z.string().optional(),
		source: z.string(),
		target: z.string(),
		animated: z.boolean().optional(),
		markerEnd: z.record(z.string(), z.any()).optional(),
	})
	.passthrough();

const definitionSchema = z.object({
	projectId: z.string(),
	name: z.string().min(1),
	description: z.string().optional(),
	nodes: z.array(nodeSchema),
	edges: z.array(edgeSchema),
});

type WorkflowDefinition = z.infer<typeof definitionSchema> & {
	id: string;
	userId: string;
	updatedAt: number;
};

const listKey = (userId: string, projectId: string) =>
	`workflow:list:${userId}:${projectId}`;
const defKey = (userId: string, projectId: string, id: string) =>
	`workflow:def:${userId}:${projectId}:${id}`;

async function assertProjectAccess(userId: string, projectId: string) {
	const project = await prisma.project.findFirst({
		where: { id: projectId, userId },
		select: { id: true },
	});
	if (!project) {
		throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
	}
}

export const workflowRouter = router({
	listRuns: publicProcedure
		.input(
			z.object({
				projectId: z.string(),
				limit: z.number().int().positive().max(100).optional().default(20),
			}),
		)
		.query(async ({ input, ctx }) => {
			const headers = new Headers(ctx.req?.headers);
			const session = await getSessionWithRetry(headers);
			if (!session) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}
			await assertProjectAccess(session.user.id, input.projectId);

			return prisma.workflowRun.findMany({
				where: { projectId: input.projectId, userId: session.user.id },
				select: {
					id: true,
					state: true,
					createdAt: true,
					finishedAt: true,
				},
				orderBy: { createdAt: "desc" },
				take: input.limit,
			});
		}),

	runEvents: publicProcedure
		.input(z.object({ runId: z.string() }))
		.query(async ({ input, ctx }) => {
			const headers = new Headers(ctx.req?.headers);
			const session = await getSessionWithRetry(headers);
			if (!session) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}

			const run = await prisma.workflowRun.findFirst({
				where: { id: input.runId, userId: session.user.id },
				select: {
					id: true,
					steps: {
						select: {
							id: true,
							name: true,
							order: true,
							state: true,
							toolName: true,
							startedAt: true,
							finishedAt: true,
							error: true,
							output: true,
						},
						orderBy: { order: "asc" },
					},
				},
			});

			if (!run) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			return run.steps;
		}),

	list: publicProcedure
		.input(z.object({ projectId: z.string() }))
		.query(async ({ input, ctx }) => {
			const headers = new Headers(ctx.req?.headers);
			const session = await getSessionWithRetry(headers);
			if (!session) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}
			await assertProjectAccess(session.user.id, input.projectId);
			const items =
				(await kv.get<WorkflowDefinition[]>(
					listKey(session.user.id, input.projectId),
				)) || [];
			return items;
		}),

	get: publicProcedure
		.input(z.object({ projectId: z.string(), id: z.string() }))
		.query(async ({ input, ctx }) => {
			const headers = new Headers(ctx.req?.headers);
			const session = await getSessionWithRetry(headers);
			if (!session) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}
			await assertProjectAccess(session.user.id, input.projectId);
			const def = await kv.get<WorkflowDefinition>(
				defKey(session.user.id, input.projectId, input.id),
			);
			if (!def) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Workflow not found",
				});
			}
			return def;
		}),

	create: publicProcedure
		.input(definitionSchema)
		.mutation(async ({ input, ctx }) => {
			const headers = new Headers(ctx.req?.headers);
			const session = await getSessionWithRetry(headers);
			if (!session) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}
			await assertProjectAccess(session.user.id, input.projectId);

			try {
				const id = nanoid();
				const now = Date.now();
				const definition: WorkflowDefinition = {
					...input,
					id,
					userId: session.user.id,
					updatedAt: now,
				};

				const list =
					(await kv.get<WorkflowDefinition[]>(
						listKey(session.user.id, input.projectId),
					)) || [];
				await kv.set(defKey(session.user.id, input.projectId, id), definition);
				await kv.set(listKey(session.user.id, input.projectId), [
					...list.filter((item) => item.id !== id),
					definition,
				]);

				return definition;
			} catch (error) {
				console.error("workflow.create failed", error);
				throw error;
			}
		}),

	update: publicProcedure
		.input(
			definitionSchema.extend({ id: z.string() }).partial({
				name: true,
				description: true,
				nodes: true,
				edges: true,
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const headers = new Headers(ctx.req?.headers);
			const session = await getSessionWithRetry(headers);
			if (!session) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}
			if (!input.id) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Missing workflow id",
				});
			}
			await assertProjectAccess(session.user.id, input.projectId!);

			const existing = await kv.get<WorkflowDefinition>(
				defKey(session.user.id, input.projectId!, input.id),
			);
			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Workflow not found",
				});
			}

			const updated: WorkflowDefinition = {
				...existing,
				...input,
				updatedAt: Date.now(),
			};

			const list =
				(await kv.get<WorkflowDefinition[]>(
					listKey(session.user.id, input.projectId!),
				)) || [];
			await kv.set(
				defKey(session.user.id, input.projectId!, input.id),
				updated,
			);
			await kv.set(
				listKey(session.user.id, input.projectId!),
				list.map((item) => (item.id === input.id ? updated : item)),
			);

			return updated;
		}),

	delete: publicProcedure
		.input(z.object({ projectId: z.string(), id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const headers = new Headers(ctx.req?.headers);
			const session = await getSessionWithRetry(headers);
			if (!session) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}
			await assertProjectAccess(session.user.id, input.projectId);

			const list =
				(await kv.get<WorkflowDefinition[]>(
					listKey(session.user.id, input.projectId),
				)) || [];
			await kv.del(defKey(session.user.id, input.projectId, input.id));
			await kv.set(
				listKey(session.user.id, input.projectId),
				list.filter((item) => item.id !== input.id),
			);

			return { success: true } as const;
		}),

	startRun: publicProcedure
		.input(
			z.object({
				projectId: z.string(),
				workflowId: z.string(),
				payload: z.record(z.string(), z.any()).optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const headers = new Headers(ctx.req?.headers);
			const session = await getSessionWithRetry(headers);
			if (!session) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}
			await assertProjectAccess(session.user.id, input.projectId);

			const def = await kv.get<WorkflowDefinition>(
				defKey(session.user.id, input.projectId, input.workflowId),
			);
			if (!def) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Workflow not found",
				});
			}

			const run = await prisma.workflowRun.create({
				data: {
					workflow: def.id,
					projectId: input.projectId,
					userId: session.user.id,
					input: (input.payload ?? Prisma.JsonNull) as Prisma.InputJsonValue,
					state: "PENDING",
					output: { definition: def } as Prisma.InputJsonValue,
				},
				select: {
					id: true,
					state: true,
					createdAt: true,
				},
			});

			if (def.nodes?.length) {
				await prisma.workflowStep.createMany({
					data: def.nodes.map((node, index) => ({
						runId: run.id,
						name: (node.data as any)?.label ?? node.id,
						order: index,
						toolName: node.type ?? undefined,
						state: "PENDING",
						input: (node.data as any) ?? {},
					})),
				});
			}

			const enqueue = async () => {
				await inngest.send({
					name: workflowRequestedEvent,
					id: run.id,
					data: {
						runId: run.id,
						workflowId: def.id,
						projectId: input.projectId,
						userId: session.user.id,
						nodes: def.nodes,
						edges: def.edges,
						input: input.payload ?? {},
						idempotencyKey: run.id,
					},
				});
			};

			try {
				await enqueue();
			} catch (firstError) {
				await new Promise((resolve) => setTimeout(resolve, 150));
				try {
					await enqueue();
				} catch (error) {
					await prisma.workflowRun.update({
						where: { id: run.id },
						data: { state: "FAILED", error: { message: String(error) } },
					});
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to enqueue workflow run",
					});
				}
			}

			return run;
		}),

	runStatus: publicProcedure
		.input(z.object({ runId: z.string() }))
		.query(async ({ input, ctx }) => {
			const headers = new Headers(ctx.req?.headers);
			const session = await getSessionWithRetry(headers);
			if (!session) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}

			const run = await prisma.workflowRun.findFirst({
				where: { id: input.runId, userId: session.user.id },
				select: {
					id: true,
					state: true,
					createdAt: true,
					finishedAt: true,
					error: true,
					output: true,
					steps: {
						select: {
							id: true,
							name: true,
							order: true,
							state: true,
							toolName: true,
							startedAt: true,
							finishedAt: true,
							error: true,
							output: true,
						},
						orderBy: { order: "asc" },
					},
				},
			});

			if (!run) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			return run;
		}),

	runStream: publicProcedure
		.input(
			z.object({
				runId: z.string(),
				intervalMs: z
					.number()
					.int()
					.min(500)
					.max(5000)
					.optional()
					.default(1500),
			}),
		)
		.subscription(({ input, ctx }) => {
			return observable<{ type: "update"; data: any } | { type: "done" }>(
				(emit) => {
					let active = true;
					const headers = new Headers(ctx.req?.headers);
					const userPromise = getSessionWithRetry(headers);

					const tick = async () => {
						const session = await userPromise;
						if (!session) {
							emit.error(new TRPCError({ code: "UNAUTHORIZED" }));
							return;
						}
						const run = await prisma.workflowRun.findFirst({
							where: { id: input.runId, userId: session.user.id },
							select: {
								id: true,
								state: true,
								createdAt: true,
								finishedAt: true,
								error: true,
								output: true,
								steps: {
									select: {
										id: true,
										name: true,
										order: true,
										state: true,
										toolName: true,
										startedAt: true,
										finishedAt: true,
										error: true,
										output: true,
									},
									orderBy: { order: "asc" },
								},
							},
						});

						if (!run) {
							emit.error(new TRPCError({ code: "NOT_FOUND" }));
							return;
						}

						emit.next({ type: "update", data: run });
						if (
							run.state === "COMPLETED" ||
							run.state === "FAILED" ||
							run.state === "CANCELED"
						) {
							emit.next({ type: "done" });
							return;
						}
					};

					const interval = setInterval(() => {
						if (active) void tick();
					}, input.intervalMs);
					void tick();

					return () => {
						active = false;
						clearInterval(interval);
					};
				},
			);
		}),
});
