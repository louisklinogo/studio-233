import type { Edge, Node } from "@xyflow/react";
import {
	createPluginExecutionContext,
	type ExtendedPluginExecutionContext,
} from "./execution-context";
import { executePlugin, getPluginForNode } from "./plugins";
import type {
	MediaFile,
	PluginConfig,
	ProcessingProgress,
} from "./plugins/types";

export interface WorkflowExecutionOptions {
	workflowId: string;
	userId: string;
	projectId: string;
	trpcClient: any; // TRPC client
	inputFiles?: MediaFile[]; // Initial input files for the workflow
	onProgress?: (nodeId: string, progress: ProcessingProgress) => void;
	onLog?: (
		nodeId: string,
		message: string,
		level?: "info" | "warn" | "error",
	) => void;
	onNodeComplete?: (nodeId: string, result: any) => void;
	onNodeError?: (nodeId: string, error: string) => void;
	signal?: AbortSignal;
}

export interface WorkflowExecutionResult {
	success: boolean;
	completedNodes: string[];
	failedNodes: string[];
	results: Record<string, any>;
	errors: Record<string, string>;
	totalTime: number;
}

/**
 * Executes a workflow by running nodes in topological order
 */
export class WorkflowExecutionEngine {
	private options: WorkflowExecutionOptions;
	private nodeResults: Map<string, MediaFile[]> = new Map();
	private nodeStatus: Map<
		string,
		"pending" | "running" | "completed" | "failed"
	> = new Map();

	constructor(options: WorkflowExecutionOptions) {
		this.options = options;

		// If initial input files are provided, store them for input nodes
		if (options.inputFiles && options.inputFiles.length > 0) {
			this.nodeResults.set("__initial_input__", options.inputFiles);
		}
	}

	/**
	 * Execute the entire workflow
	 */
	async executeWorkflow(
		nodes: Node[],
		edges: Edge[],
	): Promise<WorkflowExecutionResult> {
		const startTime = Date.now();
		const completedNodes: string[] = [];
		const failedNodes: string[] = [];
		const results: Record<string, any> = {};
		const errors: Record<string, string> = {};

		try {
			// Build execution order using topological sort
			const executionOrder = this.getExecutionOrder(nodes, edges);

			this.options.onLog?.(
				"workflow",
				`Starting workflow execution with ${nodes.length} nodes`,
			);

			// Execute nodes in order
			for (const nodeId of executionOrder) {
				// Check for cancellation
				if (this.options.signal?.aborted) {
					throw new Error("Workflow execution was cancelled");
				}

				const node = nodes.find((n) => n.id === nodeId);
				if (!node) {
					const error = `Node ${nodeId} not found`;
					errors[nodeId] = error;
					failedNodes.push(nodeId);
					continue;
				}

				try {
					this.nodeStatus.set(nodeId, "running");
					this.options.onLog?.(
						nodeId,
						`Starting execution of node: ${node.data?.label || nodeId}`,
					);

					const result = await this.executeNode(node, edges, nodes);

					this.nodeStatus.set(nodeId, "completed");
					this.nodeResults.set(nodeId, result.outputFiles);
					results[nodeId] = result;
					completedNodes.push(nodeId);

					this.options.onNodeComplete?.(nodeId, result);
					this.options.onLog?.(
						nodeId,
						`Node completed successfully with ${result.outputFiles.length} output files`,
					);
				} catch (error) {
					const errorMessage =
						error instanceof Error ? error.message : "Unknown error";
					this.nodeStatus.set(nodeId, "failed");
					errors[nodeId] = errorMessage;
					failedNodes.push(nodeId);

					this.options.onNodeError?.(nodeId, errorMessage);
					this.options.onLog?.(nodeId, `Node failed: ${errorMessage}`, "error");

					// For now, continue with other nodes instead of stopping the entire workflow
					// In production, you might want to make this configurable
				}
			}

			const totalTime = Date.now() - startTime;
			const success = failedNodes.length === 0;

			this.options.onLog?.(
				"workflow",
				`Workflow ${success ? "completed successfully" : "completed with errors"} in ${totalTime}ms`,
			);

			return {
				success,
				completedNodes,
				failedNodes,
				results,
				errors,
				totalTime,
			};
		} catch (error) {
			const totalTime = Date.now() - startTime;
			const errorMessage =
				error instanceof Error ? error.message : "Workflow execution failed";

			this.options.onLog?.(
				"workflow",
				`Workflow failed: ${errorMessage}`,
				"error",
			);

			return {
				success: false,
				completedNodes,
				failedNodes: nodes.map((n) => n.id),
				results,
				errors: { workflow: errorMessage },
				totalTime,
			};
		}
	}

	/**
	 * Execute a single node
	 */
	private async executeNode(
		node: Node,
		edges: Edge[],
		nodes: Node[],
	): Promise<any> {
		const pluginId = node.data?.pluginId;
		if (!pluginId) {
			throw new Error(`Node ${node.id} has no plugin ID`);
		}

		// Get input files from connected nodes
		const inputFiles = this.getInputFiles(node.id, edges, nodes);

		// Get node configuration
		const config: PluginConfig = (node.data?.config as PluginConfig) || {};

		// Create execution context
		const context = createPluginExecutionContext(
			this.options.workflowId,
			node.id,
			this.options.userId,
			this.options.projectId,
			this.options.trpcClient,
			(progress) => this.options.onProgress?.(node.id, progress),
			(message, level) => this.options.onLog?.(node.id, message, level),
			this.options.signal,
		);

		// Execute the plugin
		return await (executePlugin as any)(
			pluginId,
			inputFiles,
			config as any,
			context as any,
		);
	}

	/**
	 * Get input files for a node from its connected predecessors
	 */
	private getInputFiles(
		nodeId: string,
		edges: Edge[],
		nodes: Node[],
	): MediaFile[] {
		const inputFiles: MediaFile[] = [];

		// Find all edges that target this node
		const incomingEdges = edges.filter((edge) => edge.target === nodeId);

		// If this is an input node (no incoming edges), use initial input files
		if (incomingEdges.length === 0) {
			const initialInputs = this.nodeResults.get("__initial_input__");
			if (initialInputs) {
				return initialInputs;
			}
		}

		for (const edge of incomingEdges) {
			const sourceResults = this.nodeResults.get(edge.source);
			if (sourceResults) {
				inputFiles.push(...sourceResults);
			}
		}

		return inputFiles;
	}

	/**
	 * Get execution order using topological sort
	 */
	private getExecutionOrder(nodes: Node[], edges: Edge[]): string[] {
		const nodeIds = nodes.map((n) => n.id);
		const inDegree = new Map<string, number>();
		const adjacencyList = new Map<string, string[]>();

		// Initialize
		for (const nodeId of nodeIds) {
			inDegree.set(nodeId, 0);
			adjacencyList.set(nodeId, []);
		}

		// Build graph
		for (const edge of edges) {
			const from = edge.source;
			const to = edge.target;

			adjacencyList.get(from)?.push(to);
			inDegree.set(to, (inDegree.get(to) || 0) + 1);
		}

		// Topological sort
		const queue: string[] = [];
		const result: string[] = [];

		// Start with nodes that have no dependencies
		for (const [nodeId, degree] of inDegree.entries()) {
			if (degree === 0) {
				queue.push(nodeId);
			}
		}

		while (queue.length > 0) {
			const current = queue.shift()!;
			result.push(current);

			// Process neighbors
			const neighbors = adjacencyList.get(current) || [];
			for (const neighbor of neighbors) {
				const newDegree = (inDegree.get(neighbor) || 0) - 1;
				inDegree.set(neighbor, newDegree);

				if (newDegree === 0) {
					queue.push(neighbor);
				}
			}
		}

		// Check for cycles
		if (result.length !== nodeIds.length) {
			throw new Error("Workflow contains cycles and cannot be executed");
		}

		return result;
	}
}
