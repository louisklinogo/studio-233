import {
	applyEdgeChanges,
	applyNodeChanges,
	type Connection,
	type Edge,
	type EdgeChange,
	type Node,
	type NodeChange,
} from "@xyflow/react";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import {
	deserializeWorkflow,
	serializeWorkflow,
	type WorkflowDefinition,
} from "./types";

export type WorkflowNodeData = {
	label?: string;
	description?: string;
	status?: "idle" | "running" | "success" | "error";
	config?: Record<string, unknown>;
	icon?: string;
	type?: string;
	enabled?: boolean;
	pluginId?: string;

	// Plugin execution results
	lastResult?: any; // MediaProcessingResult
	lastExecuted?: Date;
	executionTime?: number; // milliseconds

	// UI state
	expanded?: boolean;
	showPreview?: boolean;
};

// WorkflowDefinition type is now imported from ./types
import type { MediaFile } from "./plugins/types";

// Core workflow state atoms
export const workflowIdAtom = atom<string | null>(null);
export const projectIdAtom = atom<string | null>(null);
export const nodesAtom = atom<Node<WorkflowNodeData>[]>([]);
export const edgesAtom = atom<Edge[]>([]);

// UI state atoms
export const selectedNodeIdAtom = atom<string | null>(null);
export const selectedEdgeIdAtom = atom<string | null>(null);
export const panelWidthAtom = atomWithStorage<number>(
	"studio-workflow-panel-width",
	32,
);
export const panelCollapsedAtom = atomWithStorage<boolean>(
	"studio-workflow-panel-collapsed",
	false,
);
export const showMinimapAtom = atomWithStorage<boolean>(
	"studio-workflow-minimap",
	true,
);

// Workflow state management
export const isLoadingAtom = atom<boolean>(false);
export const isSavingAtom = atom<boolean>(false);
export const hasUnsavedChangesAtom = atom<boolean>(false);
export const lastSavedAtom = atom<Date | null>(null);

// Input files for the workflow (files to be processed)
export const inputFilesAtom = atom<MediaFile[]>([]);

// Output files from the workflow (after processing)
export const outputFilesAtom = atom<MediaFile[]>([]);

// Add input files
export const addInputFilesAtom = atom(null, (get, set, files: MediaFile[]) => {
	const currentFiles = get(inputFilesAtom);
	set(inputFilesAtom, [...currentFiles, ...files]);
});

// Remove input file
export const removeInputFileAtom = atom(null, (get, set, fileId: string) => {
	const currentFiles = get(inputFilesAtom);
	set(
		inputFilesAtom,
		currentFiles.filter((f) => f.id !== fileId),
	);
});

// Clear all input files
export const clearInputFilesAtom = atom(null, (get, set) => {
	set(inputFilesAtom, []);
});

// Set output files (after workflow execution)
export const setOutputFilesAtom = atom(null, (get, set, files: MediaFile[]) => {
	set(outputFilesAtom, files);
});

// Clear output files
export const clearOutputFilesAtom = atom(null, (get, set) => {
	set(outputFilesAtom, []);
});

// History management
const historyLimit = 30;
type Snapshot = { nodes: Node<WorkflowNodeData>[]; edges: Edge[] };

const historyAtom = atom<{ past: Snapshot[]; future: Snapshot[] }>({
	past: [],
	future: [],
});

const pushHistoryAtom = atom(null, (get, set, snapshot: Snapshot) => {
	const { past } = get(historyAtom);
	const nextPast = [...past, snapshot].slice(-historyLimit);
	set(historyAtom, { past: nextPast, future: [] });
});

// Workflow operations
export const onNodesChangeAtom = atom(
	null,
	(get, set, changes: NodeChange[]) => {
		const current = get(nodesAtom);
		const currentEdges = get(edgesAtom);
		set(pushHistoryAtom, { nodes: current, edges: currentEdges });
		set(nodesAtom, applyNodeChanges(changes, current));
		set(hasUnsavedChangesAtom, true);
	},
);

export const onEdgesChangeAtom = atom(
	null,
	(get, set, changes: EdgeChange[]) => {
		const current = get(edgesAtom);
		const currentNodes = get(nodesAtom);
		set(pushHistoryAtom, { nodes: currentNodes, edges: current });
		set(edgesAtom, applyEdgeChanges(changes, current));
		set(hasUnsavedChangesAtom, true);
	},
);

export const onConnectAtom = atom(null, (get, set, connection: Connection) => {
	const edges = get(edgesAtom);
	const nodes = get(nodesAtom);
	set(pushHistoryAtom, { nodes, edges });
	set(edgesAtom, [
		...edges,
		{
			...connection,
			id: `${connection.source}-${connection.target}-${Date.now()}`,
		},
	]);
	set(hasUnsavedChangesAtom, true);
});

export const addNodeAtom = atom(
	null,
	(get, set, node: Node<WorkflowNodeData>) => {
		const nodes = get(nodesAtom);
		const edges = get(edgesAtom);
		set(pushHistoryAtom, { nodes, edges });
		set(nodesAtom, [
			...nodes.map((n) => ({ ...n, selected: false })),
			{ ...node, selected: true },
		]);
		set(selectedNodeIdAtom, node.id);
		set(hasUnsavedChangesAtom, true);
	},
);

export const updateNodeDataAtom = atom(
	null,
	(get, set, update: { id: string; data: Partial<WorkflowNodeData> }) => {
		const nodes = get(nodesAtom);
		const edges = get(edgesAtom);
		set(pushHistoryAtom, { nodes, edges });
		set(
			nodesAtom,
			nodes.map((n) =>
				n.id === update.id ? { ...n, data: { ...n.data, ...update.data } } : n,
			),
		);
		set(hasUnsavedChangesAtom, true);
	},
);

export const deleteSelectedAtom = atom(null, (get, set) => {
	const selectedId = get(selectedNodeIdAtom);
	if (!selectedId) return;

	const nodes = get(nodesAtom);
	const edges = get(edgesAtom);
	const selectedNode = nodes.find((n) => n.id === selectedId);

	// Prevent deleting trigger/input nodes to keep entry point
	if (
		selectedNode?.type === "input" ||
		selectedNode?.data?.type === "trigger"
	) {
		return;
	}

	set(pushHistoryAtom, { nodes, edges });
	set(
		nodesAtom,
		nodes.filter((n) => n.id !== selectedId),
	);
	set(
		edgesAtom,
		edges.filter((e) => e.source !== selectedId && e.target !== selectedId),
	);
	set(selectedNodeIdAtom, null);
	set(hasUnsavedChangesAtom, true);
});

export const undoAtom = atom(null, (get, set) => {
	const { past, future } = get(historyAtom);
	if (!past.length) return;

	const snapshot = past[past.length - 1];
	const current: Snapshot = { nodes: get(nodesAtom), edges: get(edgesAtom) };

	set(nodesAtom, snapshot.nodes);
	set(edgesAtom, snapshot.edges);
	set(selectedNodeIdAtom, null);
	set(selectedEdgeIdAtom, null);
	set(historyAtom, {
		past: past.slice(0, -1),
		future: [current, ...future].slice(0, historyLimit),
	});
	set(hasUnsavedChangesAtom, true);
});

export const redoAtom = atom(null, (get, set) => {
	const { past, future } = get(historyAtom);
	if (!future.length) return;

	const snapshot = future[0];
	const current: Snapshot = { nodes: get(nodesAtom), edges: get(edgesAtom) };

	set(nodesAtom, snapshot.nodes);
	set(edgesAtom, snapshot.edges);
	set(selectedNodeIdAtom, null);
	set(selectedEdgeIdAtom, null);
	set(historyAtom, {
		past: [...past, current].slice(-historyLimit),
		future: future.slice(1),
	});
	set(hasUnsavedChangesAtom, true);
});

// Persistence operations
export const loadWorkflowAtom = atom(
	null,
	async (get, set, workflowId: string) => {
		set(isLoadingAtom, true);
		try {
			// This will be called via TRPC from the component
			// The actual API call happens in the component layer
			set(workflowIdAtom, workflowId);
		} catch (error) {
			console.error("Failed to load workflow:", error);
			throw error;
		} finally {
			set(isLoadingAtom, false);
		}
	},
);

export const setWorkflowDataAtom = atom(
	null,
	(get, set, workflow: WorkflowDefinition) => {
		// Deserialize the workflow data from database format to ReactFlow format
		const { nodes, edges } = deserializeWorkflow(
			workflow.nodes,
			workflow.edges,
		);

		set(workflowIdAtom, workflow.id);
		set(projectIdAtom, workflow.projectId);
		set(nodesAtom, nodes);
		set(edgesAtom, edges);
		set(hasUnsavedChangesAtom, false);
		set(lastSavedAtom, workflow.updatedAt);

		// Clear history when loading a workflow
		set(historyAtom, { past: [], future: [] });
	},
);

export const saveWorkflowAtom = atom(null, async (get, set) => {
	const workflowId = get(workflowIdAtom);
	const nodes = get(nodesAtom);
	const edges = get(edgesAtom);

	if (!workflowId) {
		throw new Error("No workflow ID set");
	}

	set(isSavingAtom, true);
	try {
		// This will be called via TRPC from the component
		// The actual API call happens in the component layer
		set(hasUnsavedChangesAtom, false);
		set(lastSavedAtom, new Date());
	} catch (error) {
		console.error("Failed to save workflow:", error);
		throw error;
	} finally {
		set(isSavingAtom, false);
	}
});

// Autosave functionality
let autosaveTimeout: NodeJS.Timeout | null = null;

export const triggerAutosaveAtom = atom(null, (get, set) => {
	const hasUnsavedChanges = get(hasUnsavedChangesAtom);
	const workflowId = get(workflowIdAtom);

	if (!hasUnsavedChanges || !workflowId) return;

	// Clear existing timeout
	if (autosaveTimeout) {
		clearTimeout(autosaveTimeout);
	}

	// Set new timeout for autosave (2 seconds after last change)
	autosaveTimeout = setTimeout(() => {
		set(saveWorkflowAtom);
	}, 2000);
});

// Update node status
export const updateNodeStatusAtom = atom(
	null,
	(
		get,
		set,
		update: {
			nodeId: string;
			status: "idle" | "running" | "success" | "error";
		},
	) => {
		const nodes = get(nodesAtom);
		const updatedNodes = nodes.map((node) =>
			node.id === update.nodeId
				? { ...node, data: { ...node.data, status: update.status } }
				: node,
		);
		set(nodesAtom, updatedNodes);
		set(hasUnsavedChangesAtom, true);
	},
);

// Clear workflow state
export const clearWorkflowAtom = atom(null, (get, set) => {
	const nodes = get(nodesAtom);
	const edges = get(edgesAtom);
	set(pushHistoryAtom, { nodes, edges });

	set(nodesAtom, []);
	set(edgesAtom, []);
	set(selectedNodeIdAtom, null);
	set(selectedEdgeIdAtom, null);
	set(workflowIdAtom, null);
	set(projectIdAtom, null);
	set(hasUnsavedChangesAtom, false);
	set(lastSavedAtom, null);
	set(historyAtom, { past: [], future: [] });
});

// Create new workflow with default nodes
export const createNewWorkflowAtom = atom(
	null,
	(get, set, projectId: string) => {
		set(clearWorkflowAtom);
		set(projectIdAtom, projectId);

		// Create default workflow structure for media processing
		const defaultNodes: Node<WorkflowNodeData>[] = [
			{
				id: "input-1",
				position: { x: 100, y: 100 },
				data: {
					label: "Media Input",
					description: "Upload files or select from library",
					type: "input",
					pluginId: "media-input",
					status: "idle",
					config: {
						source: "upload",
						maxFiles: 10,
						maxSizePerFile: 50,
					},
				},
				type: "input",
			},
			{
				id: "processing-1",
				position: { x: 350, y: 100 },
				data: {
					label: "Remove Background",
					description: "AI-powered background removal",
					type: "processing",
					pluginId: "background-removal",
					status: "idle",
					config: {
						model: "bria",
						quality: "high",
					},
				},
				type: "default",
			},
			{
				id: "output-1",
				position: { x: 600, y: 100 },
				data: {
					label: "Media Output",
					description: "Download processed files",
					type: "output",
					pluginId: "media-output",
					status: "idle",
					config: {
						destination: "download",
						format: "original",
						quality: 90,
					},
				},
				type: "output",
			},
		];

		const defaultEdges: Edge[] = [
			{
				id: "e1-2",
				source: "input-1",
				target: "processing-1",
				animated: true,
			},
			{
				id: "e2-3",
				source: "processing-1",
				target: "output-1",
				animated: true,
			},
		];

		set(nodesAtom, defaultNodes);
		set(edgesAtom, defaultEdges);
		set(hasUnsavedChangesAtom, true);
	},
);
