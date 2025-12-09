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

export type WorkflowNodeData = {
	label?: string;
	description?: string;
	status?: "idle" | "running" | "success" | "error";
	config?: Record<string, unknown>;
	icon?: string;
	type?: string;
	enabled?: boolean;
};

export type WorkflowDefinition = {
	id: string;
	projectId: string;
	name: string;
	description?: string;
	nodes: Node<WorkflowNodeData>[];
	edges: Edge[];
};

// UI state
export const panelWidthAtom = atom<number>(32);
export const panelCollapsedAtom = atom<boolean>(false);

export const initialNodes: Node<WorkflowNodeData>[] = [
	{
		id: "trigger-1",
		position: { x: 0, y: 0 },
		data: {
			label: "Trigger",
			description: "Start a batch run",
			status: "idle",
		},
		type: "input",
	},
	{
		id: "action-1",
		position: { x: 240, y: 120 },
		data: {
			label: "Batch step",
			description: "Connect existing studio processing",
			status: "idle",
		},
		type: "default",
	},
	{
		id: "output-1",
		position: { x: 520, y: 240 },
		data: {
			label: "Result",
			description: "Review outputs",
			status: "idle",
		},
		type: "output",
	},
];

export const initialEdges: Edge[] = [
	{ id: "e1-2", source: "trigger-1", target: "action-1", animated: true },
	{ id: "e2-3", source: "action-1", target: "output-1" },
];

export const nodesAtom = atom<Node<WorkflowNodeData>[]>(initialNodes);
export const edgesAtom = atom<Edge[]>(initialEdges);
export const workflowIdAtom = atom<string | null>(null);
export const projectIdAtom = atom<string | null>(null);
export const dirtyAtom = atom(false);
export const showMinimapAtom = atom(true);
export const selectedNodeIdAtom = atom<string | null>(null);
export const selectedEdgeIdAtom = atom<string | null>(null);
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

export const onNodesChangeAtom = atom(
	null,
	(get, set, changes: NodeChange[]) => {
		const current = get(nodesAtom);
		const currentEdges = get(edgesAtom);
		set(pushHistoryAtom, { nodes: current, edges: currentEdges });
		set(nodesAtom, applyNodeChanges(changes, current));
		set(dirtyAtom, true);
	},
);

export const onEdgesChangeAtom = atom(
	null,
	(get, set, changes: EdgeChange[]) => {
		const current = get(edgesAtom);
		const currentNodes = get(nodesAtom);
		set(pushHistoryAtom, { nodes: currentNodes, edges: current });
		set(edgesAtom, applyEdgeChanges(changes, current));
		set(dirtyAtom, true);
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
			id: `${connection.source}-${connection.target}-${edges.length}`,
		},
	]);
	set(dirtyAtom, true);
});

export const setNodesAtom = atom(
	null,
	(_get, set, nodes: Node<WorkflowNodeData>[]) => {
		set(nodesAtom, nodes);
		set(selectedNodeIdAtom, null);
		set(dirtyAtom, false);
	},
);

export const setEdgesAtom = atom(null, (_get, set, edges: Edge[]) => {
	set(edgesAtom, edges);
	set(selectedEdgeIdAtom, null);
	set(dirtyAtom, false);
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
		set(dirtyAtom, true);
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
		set(dirtyAtom, true);
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
	set(dirtyAtom, true);
});

export const deleteSelectedEdgeAtom = atom(null, (get, set) => {
	const selectedEdgeId = get(selectedEdgeIdAtom);
	if (!selectedEdgeId) return;
	const nodes = get(nodesAtom);
	const edges = get(edgesAtom);
	set(pushHistoryAtom, { nodes, edges });
	set(
		edgesAtom,
		edges.filter((e) => e.id !== selectedEdgeId),
	);
	set(selectedEdgeIdAtom, null);
	set(dirtyAtom, true);
});

export const clearWorkflowAtom = atom(null, (get, set) => {
	const nodes = get(nodesAtom);
	const edges = get(edgesAtom);
	set(pushHistoryAtom, { nodes, edges });
	set(nodesAtom, initialNodes);
	set(edgesAtom, initialEdges);
	set(selectedNodeIdAtom, null);
	set(selectedEdgeIdAtom, null);
	set(dirtyAtom, true);
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
	set(dirtyAtom, true);
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
	set(dirtyAtom, true);
});
