import type { Edge, Node } from "@xyflow/react";

// Serializable versions of ReactFlow types for database storage
export interface SerializableNodePosition {
	x: number;
	y: number;
}

export interface SerializableNodeData {
	label?: string;
	description?: string;
	status?: "idle" | "running" | "success" | "error";
	type?: string;
	enabled?: boolean;
	pluginId?: string;
	config?: Record<string, unknown>; // Plugin-specific config
	lastResult?: Record<string, unknown>;
	lastExecuted?: string; // ISO date string
	executionTime?: number; // milliseconds
	expanded?: boolean;
	showPreview?: boolean;
}

export interface SerializableNode {
	id: string;
	type?: string;
	position: SerializableNodePosition;
	data?: SerializableNodeData;
	selected?: boolean;
	dragging?: boolean;
	width?: number;
	height?: number;
	zIndex?: number;
}

export interface SerializableEdge {
	id: string;
	source: string;
	target: string;
	sourceHandle?: string;
	targetHandle?: string;
	type?: string;
	animated?: boolean;
	hidden?: boolean;
	deletable?: boolean;
	focusable?: boolean;
	style?: Record<string, unknown>;
	className?: string;
	zIndex?: number;
	ariaLabel?: string;
	interactionWidth?: number;
	markerStart?: Edge["markerStart"];
	markerEnd?: Edge["markerEnd"];
}

// Database workflow definition type
export interface WorkflowDefinition {
	id: string;
	name: string;
	description?: string | null;
	projectId: string;
	userId: string;
	nodes: SerializableNode[];
	edges: SerializableEdge[];
	createdAt: Date;
	updatedAt: Date;
}

// Type conversion utilities
export function serializeNode(node: Node): SerializableNode {
	return {
		id: node.id,
		type: node.type,
		position: {
			x: node.position.x,
			y: node.position.y,
		},
		data: node.data
			? ({
					...node.data,
					// Convert Date objects to ISO strings
					lastExecuted:
						node.data.lastExecuted instanceof Date
							? node.data.lastExecuted.toISOString()
							: typeof node.data.lastExecuted === "string"
								? node.data.lastExecuted
								: undefined,
				} as SerializableNodeData)
			: undefined,
		selected: node.selected,
		dragging: node.dragging,
		width: node.width,
		height: node.height,
		zIndex: node.zIndex,
	};
}

export function deserializeNode(serializedNode: SerializableNode): Node {
	return {
		id: serializedNode.id,
		type: serializedNode.type,
		position: {
			x: serializedNode.position.x,
			y: serializedNode.position.y,
		},
		data: (serializedNode.data
			? {
					...serializedNode.data,
					// Convert ISO strings back to Date objects
					lastExecuted: serializedNode.data.lastExecuted
						? new Date(serializedNode.data.lastExecuted)
						: undefined,
				}
			: {}) as Record<string, unknown>,
		selected: serializedNode.selected,
		dragging: serializedNode.dragging,
		width: serializedNode.width,
		height: serializedNode.height,
		zIndex: serializedNode.zIndex,
	};
}

export function serializeEdge(edge: Edge): SerializableEdge {
	return {
		id: edge.id,
		source: edge.source,
		target: edge.target,
		sourceHandle: edge.sourceHandle || undefined,
		targetHandle: edge.targetHandle || undefined,
		type: edge.type,
		animated: edge.animated,
		hidden: edge.hidden,
		deletable: edge.deletable,
		focusable: edge.focusable,
		style: edge.style ? { ...edge.style } : undefined,
		className: edge.className,
		zIndex: edge.zIndex,
		ariaLabel: edge.ariaLabel,
		interactionWidth: edge.interactionWidth,
		markerStart: edge.markerStart,
		markerEnd: edge.markerEnd,
	};
}

export function deserializeEdge(serializedEdge: SerializableEdge): Edge {
	return {
		id: serializedEdge.id,
		source: serializedEdge.source,
		target: serializedEdge.target,
		sourceHandle: serializedEdge.sourceHandle,
		targetHandle: serializedEdge.targetHandle,
		type: serializedEdge.type,
		animated: serializedEdge.animated,
		hidden: serializedEdge.hidden,
		deletable: serializedEdge.deletable,
		focusable: serializedEdge.focusable,
		style: serializedEdge.style as Edge["style"],
		className: serializedEdge.className,
		zIndex: serializedEdge.zIndex,
		ariaLabel: serializedEdge.ariaLabel,
		interactionWidth: serializedEdge.interactionWidth,
		markerStart: serializedEdge.markerStart,
		markerEnd: serializedEdge.markerEnd,
	};
}

// Utility functions for batch conversion
export function serializeWorkflow(
	nodes: Node[],
	edges: Edge[],
): {
	nodes: SerializableNode[];
	edges: SerializableEdge[];
} {
	return {
		nodes: nodes.map(serializeNode),
		edges: edges.map(serializeEdge),
	};
}

export function deserializeWorkflow(
	serializedNodes: SerializableNode[],
	serializedEdges: SerializableEdge[],
): {
	nodes: Node[];
	edges: Edge[];
} {
	return {
		nodes: serializedNodes.map(deserializeNode),
		edges: serializedEdges.map(deserializeEdge),
	};
}
