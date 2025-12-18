import { getSessionWithRetry } from "@studio233/auth/lib/session";
import { Prisma, prisma } from "@studio233/db";
import { TRPCError } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { z } from "zod";
import { inngest } from "@/inngest/client";
import { workflowRequestedEvent } from "@/inngest/events";
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

type SerializableNode = z.infer<typeof nodeSchema>;
type SerializableEdge = z.infer<typeof edgeSchema>;

function getExecutionOrder(
	nodes: SerializableNode[],
	edges: SerializableEdge[],
) {
	const nodeIds = nodes.map((n) => n.id);
	const inDegree = new Map<string, number>();
	const adjacencyList = new Map<string, string[]>();

	for (const nodeId of nodeIds) {
		inDegree.set(nodeId, 0);
		adjacencyList.set(nodeId, []);
	}

	for (const edge of edges) {
		if (!adjacencyList.has(edge.source)) {
			adjacencyList.set(edge.source, []);
		}
		adjacencyList.get(edge.source)?.push(edge.target);
		inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
	}

	const queue = nodeIds.filter((id) => (inDegree.get(id) ?? 0) === 0);
	const result: string[] = [];

	while (queue.length > 0) {
		const current = queue.shift();
		if (!current) break;
		result.push(current);

		const neighbors = adjacencyList.get(current) ?? [];
		for (const neighbor of neighbors) {
			const nextDegree = (inDegree.get(neighbor) ?? 0) - 1;
			inDegree.set(neighbor, nextDegree);
			if (nextDegree === 0) {
				queue.push(neighbor);
			}
		}
	}

	if (result.length !== nodeIds.length) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Workflow contains a cycle or disconnected references",
		});
	}

	return result;
}

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

			return prisma.workflowDefinition.findMany({
				where: {
					projectId: input.projectId,
					userId: session.user.id,
				},
				orderBy: { updatedAt: "desc" },
			});
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

			const def = await prisma.workflowDefinition.findFirst({
				where: {
					id: input.id,
					projectId: input.projectId,
					userId: session.user.id,
				},
			});
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

			return prisma.workflowDefinition.create({
				data: {
					name: input.name,
					description: input.description,
					projectId: input.projectId,
					userId: session.user.id,
					nodes: input.nodes as Prisma.InputJsonValue,
					edges: input.edges as Prisma.InputJsonValue,
				},
			});
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

			const existing = await prisma.workflowDefinition.findFirst({
				where: {
					id: input.id,
					projectId: input.projectId!,
					userId: session.user.id,
				},
				select: { id: true },
			});
			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Workflow not found",
				});
			}

			return prisma.workflowDefinition.update({
				where: { id: input.id },
				data: {
					name: input.name,
					description: input.description,
					nodes: input.nodes as Prisma.InputJsonValue | undefined,
					edges: input.edges as Prisma.InputJsonValue | undefined,
				},
			});
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

			const existing = await prisma.workflowDefinition.findFirst({
				where: {
					id: input.id,
					projectId: input.projectId,
					userId: session.user.id,
				},
				select: { id: true },
			});
			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Workflow not found",
				});
			}

			await prisma.workflowDefinition.delete({ where: { id: input.id } });
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

			const def = await prisma.workflowDefinition.findFirst({
				where: {
					id: input.workflowId,
					projectId: input.projectId,
					userId: session.user.id,
				},
			});
			if (!def) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Workflow not found",
				});
			}

			const nodes = (def.nodes ?? []) as unknown as SerializableNode[];
			const edges = (def.edges ?? []) as unknown as SerializableEdge[];
			const executionOrder = getExecutionOrder(nodes, edges);

			const run = await prisma.workflowRun.create({
				data: {
					workflowDefinitionId: def.id,
					workflow: def.id,
					projectId: input.projectId,
					userId: session.user.id,
					input: (input.payload ?? Prisma.JsonNull) as Prisma.InputJsonValue,
					state: "PENDING",
					output: {
						definitionSnapshot: {
							id: def.id,
							name: def.name,
							description: def.description,
							nodes,
							edges,
						},
					} as Prisma.InputJsonValue,
				},
				select: {
					id: true,
					state: true,
					createdAt: true,
				},
			});

			if (nodes.length) {
				await prisma.workflowStep.createMany({
					data: executionOrder.map((nodeId, index) => {
						const node = nodes.find((n) => n.id === nodeId);
						const data =
							(node?.data as Record<string, unknown> | undefined) ?? {};
						const pluginId =
							typeof data.pluginId === "string" ? data.pluginId : undefined;
						return {
							runId: run.id,
							name:
								typeof data.label === "string"
									? data.label
									: (node?.id ?? nodeId),
							order: index,
							toolName: pluginId ?? node?.type ?? undefined,
							state: "PENDING",
							input: data as Prisma.InputJsonValue,
						};
					}),
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
						nodes,
						edges,
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
