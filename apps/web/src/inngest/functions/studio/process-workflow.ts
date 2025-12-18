import { Prisma, prisma } from "@studio233/db";
import { inngest } from "@/inngest/client";
import {
	workflowRequestedEvent,
	workflowRequestedSchema,
} from "@/inngest/events";
import type { MediaFile } from "@/lib/studio-workflow/plugins/types";
import {
	coerceMediaFile,
	getStudioPlugin,
	validateStudioPluginConfig,
} from "@/server/studio-workflow/plugin-registry";

type WorkflowNode = typeof workflowRequestedSchema extends { _output: any }
	? (typeof workflowRequestedSchema)["_output"]["nodes"][number]
	: never;

type WorkflowEdge = typeof workflowRequestedSchema extends { _output: any }
	? (typeof workflowRequestedSchema)["_output"]["edges"][number]
	: never;

function getExecutionOrder(nodes: WorkflowNode[], edges: WorkflowEdge[]) {
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
		throw new Error("Workflow graph contains a cycle or unresolved references");
	}

	return result;
}

function getInputFilesForNode(
	nodeId: string,
	edges: WorkflowEdge[],
	resultsByNodeId: Map<string, MediaFile[]>,
	initialInput: MediaFile[],
): MediaFile[] {
	const incoming = edges.filter((edge) => edge.target === nodeId);
	if (incoming.length === 0) return initialInput;
	const combined: MediaFile[] = [];
	for (const edge of incoming) {
		const sourceFiles = resultsByNodeId.get(edge.source);
		if (sourceFiles) combined.push(...sourceFiles);
	}
	return combined;
}

function inferPluginId(node: WorkflowNode): string | null {
	const explicit =
		node.data && typeof node.data.pluginId === "string"
			? node.data.pluginId
			: null;
	if (explicit) return explicit;

	const label =
		node.data && typeof node.data.label === "string"
			? node.data.label.toLowerCase()
			: "";
	const category =
		node.data && typeof (node.data as any).category === "string"
			? String((node.data as any).category).toLowerCase()
			: "";

	if (node.type === "trigger" || category === "input") return "media-input";
	if (label.includes("remove bg") || label.includes("remove background")) {
		return "background-removal";
	}
	if (label.includes("resize") || label.includes("crop")) return "image-resize";
	if (label.includes("convert") || label.includes("format"))
		return "format-conversion";
	return null;
}

function parseInitialInputFiles(input: unknown): MediaFile[] {
	if (!input || typeof input !== "object") return [];
	const record = input as Record<string, unknown>;
	const files = record.files;
	if (!Array.isArray(files)) return [];
	const parsed: MediaFile[] = [];
	for (const file of files) {
		const coerced = coerceMediaFile(file);
		if (coerced) parsed.push(coerced);
	}
	return parsed;
}

export const processStudioWorkflow = inngest.createFunction(
	{ id: "process-studio-workflow", concurrency: 8 },
	{ event: workflowRequestedEvent },
	async ({ event, step }) => {
		const payload = workflowRequestedSchema.parse(event.data);
		const run = await prisma.workflowRun.findUnique({
			where: { id: payload.runId },
		});
		if (!run) {
			return { status: "ignored", reason: "run missing" } as const;
		}
		if (run.state === "COMPLETED" || run.state === "FAILED") {
			return { status: "ignored", reason: "already finished" } as const;
		}

		await step.run("mark-running", async () => {
			await prisma.workflowRun.update({
				where: { id: payload.runId },
				data: {
					state: "RUNNING",
					startedAt: new Date(),
					error: Prisma.JsonNull,
				},
			});
		});

		try {
			const resultsByNodeId = new Map<string, MediaFile[]>();
			const executionOrder = getExecutionOrder(payload.nodes, payload.edges);
			const initialInput = parseInitialInputFiles(payload.input);
			resultsByNodeId.set("__initial__", initialInput);

			for (const [index, nodeId] of executionOrder.entries()) {
				const node = payload.nodes.find((n) => n.id === nodeId);
				if (!node) {
					throw new Error(`Node missing from payload: ${nodeId}`);
				}

				await step.run(`step-${node.id}-start`, async () => {
					await prisma.workflowStep.updateMany({
						where: { runId: payload.runId, order: index },
						data: { state: "RUNNING", startedAt: new Date() },
					});
				});

				const pluginId = inferPluginId(node);
				if (!pluginId) {
					throw new Error(
						`Node "${node.data?.label ?? node.id}" is missing pluginId. Assign a module implementation before running.`,
					);
				}

				const configRaw: Record<string, unknown> =
					node.data && typeof node.data.config === "object" && node.data.config
						? (node.data.config as Record<string, unknown>)
						: {};
				const config = validateStudioPluginConfig(
					pluginId,
					configRaw,
				) as Record<string, unknown>;

				const inputFiles = getInputFilesForNode(
					node.id,
					payload.edges,
					resultsByNodeId,
					initialInput,
				);
				const plugin = getStudioPlugin(pluginId);

				const result = await step.run(`step-${node.id}-execute`, async () => {
					return plugin.run(inputFiles, config, {
						runId: payload.runId,
						workflowId: payload.workflowId,
						nodeId: node.id,
						projectId: payload.projectId,
						userId: payload.userId,
					});
				});

				resultsByNodeId.set(node.id, result.outputFiles);

				await step.run(`step-${node.id}-complete`, async () => {
					const stepOutput = {
						nodeId: node.id,
						pluginId,
						config: config as unknown,
						inputs: inputFiles as unknown,
						outputs: result.outputFiles as unknown,
						metadata: (result.metadata ?? {}) as unknown,
						completedAt: new Date().toISOString(),
					} as unknown as Prisma.InputJsonValue;

					await prisma.workflowStep.updateMany({
						where: { runId: payload.runId, order: index },
						data: {
							state: "COMPLETED",
							finishedAt: new Date(),
							output: stepOutput,
						},
					});
				});
			}

			const outgoing = new Set(payload.edges.map((e) => e.source));
			const sinkNodeIds = payload.nodes
				.map((n) => n.id)
				.filter((id) => !outgoing.has(id));
			const finalOutputs = sinkNodeIds.flatMap(
				(id) => resultsByNodeId.get(id) ?? [],
			);
			const existingOutput =
				run.output && typeof run.output === "object"
					? (run.output as Record<string, unknown>)
					: {};

			await step.run("mark-completed", async () => {
				const runOutput = {
					...existingOutput,
					status: "completed",
					steps: executionOrder.length,
					sinkNodeIds,
					finalOutputs: finalOutputs as unknown,
				} as unknown as Prisma.InputJsonValue;

				await prisma.workflowRun.update({
					where: { id: payload.runId },
					data: {
						state: "COMPLETED",
						finishedAt: new Date(),
						output: runOutput,
					},
				});
			});

			return { status: "completed", runId: payload.runId } as const;
		} catch (error) {
			const message = error instanceof Error ? error.message : "unknown";
			await step.run("mark-failed", async () => {
				await prisma.workflowRun.update({
					where: { id: payload.runId },
					data: {
						state: "FAILED",
						finishedAt: new Date(),
						error: { message },
					},
				});
			});
			throw error;
		}
	},
);
