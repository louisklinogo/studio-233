import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useRef, useState } from "react";
import { useTRPCClient } from "@/trpc/client";
import {
	edgesAtom,
	inputFilesAtom,
	nodesAtom,
	outputFilesAtom,
	projectIdAtom,
	setOutputFilesAtom,
	updateNodeStatusAtom,
	workflowIdAtom,
} from "./enhanced-store";
import {
	WorkflowExecutionEngine,
	type WorkflowExecutionResult,
} from "./execution-engine";
import type { ProcessingProgress } from "./plugins/types";

export interface ExecutionState {
	isRunning: boolean;
	currentNode?: string;
	progress: Record<string, ProcessingProgress>;
	logs: Array<{
		nodeId: string;
		message: string;
		level: "info" | "warn" | "error";
		timestamp: Date;
	}>;
	results?: WorkflowExecutionResult;
}

export function useWorkflowExecution() {
	const nodes = useAtomValue(nodesAtom);
	const edges = useAtomValue(edgesAtom);
	const workflowId = useAtomValue(workflowIdAtom);
	const projectId = useAtomValue(projectIdAtom);
	const inputFiles = useAtomValue(inputFilesAtom);
	const trpcClient = useTRPCClient();
	const updateNodeStatus = useSetAtom(updateNodeStatusAtom);
	const setOutputFiles = useSetAtom(setOutputFilesAtom);

	const [executionState, setExecutionState] = useState<ExecutionState>({
		isRunning: false,
		progress: {},
		logs: [],
	});

	const abortControllerRef = useRef<AbortController | null>(null);

	// Execute the workflow
	const executeWorkflow = useCallback(async () => {
		if (!projectId) {
			throw new Error("No project ID available");
		}

		if (inputFiles.length === 0) {
			throw new Error("No input files selected. Please upload files first.");
		}

		if (executionState.isRunning) {
			throw new Error("Workflow is already running");
		}

		// Create abort controller for cancellation
		const abortController = new AbortController();
		abortControllerRef.current = abortController;

		// Reset execution state
		setExecutionState({
			isRunning: true,
			progress: {},
			logs: [],
		});

		try {
			const effectiveWorkflowId = workflowId ?? "unsaved-workflow";

			// Create execution engine
			const engine = new WorkflowExecutionEngine({
				workflowId: effectiveWorkflowId,
				userId: "current-user", // TODO: Get from session
				projectId,
				trpcClient,
				inputFiles, // Pass input files to execution engine
				signal: abortController.signal,

				onProgress: (nodeId, progress) => {
					setExecutionState((prev) => ({
						...prev,
						currentNode: nodeId,
						progress: {
							...prev.progress,
							[nodeId]: progress,
						},
					}));
					updateNodeStatus({ nodeId, status: "running" });
				},

				onLog: (nodeId, message, level = "info") => {
					setExecutionState((prev) => ({
						...prev,
						logs: [
							...prev.logs,
							{
								nodeId,
								message,
								level,
								timestamp: new Date(),
							},
						],
					}));
				},

				onNodeComplete: (nodeId, result) => {
					updateNodeStatus({ nodeId, status: "success" });
				},

				onNodeError: (nodeId, error) => {
					updateNodeStatus({ nodeId, status: "error" });
				},
			});

			// Execute the workflow
			const result = await engine.executeWorkflow(nodes, edges);

			// Extract output files from the last completed node
			const outputNodeId = nodes.find((n) => n.data?.type === "output")?.id;
			if (outputNodeId && result.results[outputNodeId]) {
				const outputResult = result.results[outputNodeId];
				if (outputResult.outputFiles) {
					setOutputFiles(outputResult.outputFiles);
				}
			}

			// Update final state
			setExecutionState((prev) => ({
				...prev,
				isRunning: false,
				currentNode: undefined,
				results: result,
			}));

			return result;
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Workflow execution failed";

			setExecutionState((prev) => ({
				...prev,
				isRunning: false,
				currentNode: undefined,
				logs: [
					...prev.logs,
					{
						nodeId: "workflow",
						message: errorMessage,
						level: "error",
						timestamp: new Date(),
					},
				],
			}));

			throw error;
		} finally {
			abortControllerRef.current = null;
		}
	}, [
		workflowId,
		projectId,
		nodes,
		edges,
		inputFiles,
		trpcClient,
		executionState.isRunning,
		updateNodeStatus,
	]);

	// Cancel workflow execution
	const cancelExecution = useCallback(() => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();

			setExecutionState((prev) => ({
				...prev,
				isRunning: false,
				currentNode: undefined,
				logs: [
					...prev.logs,
					{
						nodeId: "workflow",
						message: "Workflow execution cancelled by user",
						level: "warn",
						timestamp: new Date(),
					},
				],
			}));
		}
	}, []);

	// Clear execution state
	const clearExecution = useCallback(() => {
		setExecutionState({
			isRunning: false,
			progress: {},
			logs: [],
		});
	}, []);

	// Get execution summary
	const getExecutionSummary = useCallback(() => {
		const { results, logs } = executionState;

		if (!results) {
			return null;
		}

		const errorLogs = logs.filter((log) => log.level === "error");
		const warningLogs = logs.filter((log) => log.level === "warn");

		return {
			success: results.success,
			totalNodes: results.completedNodes.length + results.failedNodes.length,
			completedNodes: results.completedNodes.length,
			failedNodes: results.failedNodes.length,
			totalTime: results.totalTime,
			errorCount: errorLogs.length,
			warningCount: warningLogs.length,
		};
	}, [executionState]);

	return {
		// State
		executionState,
		isRunning: executionState.isRunning,
		currentNode: executionState.currentNode,
		progress: executionState.progress,
		logs: executionState.logs,
		results: executionState.results,

		// Actions
		executeWorkflow,
		cancelExecution,
		clearExecution,

		// Computed
		summary: getExecutionSummary(),
	};
}
