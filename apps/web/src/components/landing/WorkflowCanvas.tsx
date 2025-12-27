"use client";

import {
	addEdge,
	Background,
	Connection,
	ConnectionLineType,
	Controls,
	Edge,
	Panel,
	ReactFlow,
	useEdgesState,
	useNodesState,
} from "@xyflow/react";
import React, {
	forwardRef,
	useCallback,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import "@xyflow/react/dist/style.css";
import { StandardNode } from "@/components/studio-workflow/nodes/StandardNode";

// --- Custom Node Types ---
const nodeTypes = {
	standard: StandardNode,
};

const initialNodes = [
	{
		id: "node-prompt",
		type: "standard",
		position: { x: 100, y: 100 },
		data: { label: "INPUT_ENCODER", category: "input", status: "running" },
	},
	{
		id: "node-clip",
		type: "standard",
		position: { x: 400, y: 100 },
		data: { label: "SEMANTIC_ALIGN", category: "generation", status: "idle" },
	},
	{
		id: "node-output",
		type: "standard",
		position: { x: 700, y: 100 },
		data: { label: "RENDER_ENGINE", category: "output", status: "idle" },
	},
];

const initialEdges = [
	{
		id: "e1",
		source: "node-prompt",
		target: "node-clip",
		type: ConnectionLineType.Step,
		animated: true,
		style: { stroke: "#FF4400", strokeWidth: 1.5 },
	},
	{
		id: "e2",
		source: "node-clip",
		target: "node-output",
		type: ConnectionLineType.Step,
		style: { stroke: "#1a1a1a", strokeWidth: 1 },
	},
];

export interface WorkflowCanvasHandle {
	setInteractive: (interactive: boolean) => void;
	fitView: () => void;
	container: HTMLDivElement | null;
}

/**
 * WorkflowCanvas - Interactive ReactFlow implementation
 */
export const WorkflowCanvas = forwardRef<WorkflowCanvasHandle, {}>(
	(props, ref) => {
		const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
		const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
		const [isInteractive, setIsInteractive] = useState(false);
		const containerRef = useRef<HTMLDivElement>(null);

		const onConnect = useCallback(
			(params: Connection) =>
				setEdges((eds) =>
					addEdge(
						{ ...params, animated: true, style: { stroke: "#FF4400" } },
						eds,
					),
				),
			[setEdges],
		);

		useImperativeHandle(ref, () => ({
			setInteractive: (interactive: boolean) => setIsInteractive(interactive),
			fitView: () => {
				/* ReactFlow fitView handled via props or hook internally */
			},
			container: containerRef.current,
		}));

		return (
			<div ref={containerRef} className="w-full h-full bg-transparent">
				<ReactFlow
					nodes={nodes}
					edges={edges}
					onNodesChange={onNodesChange}
					onEdgesChange={onEdgesChange}
					onConnect={onConnect}
					nodeTypes={nodeTypes}
					fitView
					// Lock interaction until cinematic transition finishes
					nodesDraggable={isInteractive}
					nodesConnectable={isInteractive}
					elementsSelectable={isInteractive}
					panOnDrag={isInteractive}
					zoomOnScroll={isInteractive}
					panOnScroll={false}
					selectionKeyCode={isInteractive ? "Shift" : null}
					multiSelectionKeyCode={isInteractive ? "Meta" : null}
					proOptions={{ hideAttribution: true }}
				>
					{isInteractive && (
						<Controls
							showInteractive={false}
							className="bg-white/80 backdrop-blur-sm border-neutral-200 shadow-sm"
						/>
					)}

					<Panel position="bottom-left" className="p-4">
						<div className="flex flex-col gap-1">
							<span className="text-[10px] font-mono text-[#1a1a1a] font-bold uppercase tracking-widest">
								{isInteractive
									? "System: Interactive_Unlocked"
									: "System: Locked_for_Inference"}
							</span>
							<div
								className={`h-[1px] w-full ${isInteractive ? "bg-[#FF4400]" : "bg-neutral-200"}`}
							/>
						</div>
					</Panel>

					<Panel position="bottom-right" className="p-4">
						<div className="flex flex-col gap-2 bg-[#f4f4f0]/80 backdrop-blur-sm border border-neutral-200 p-3 rounded-sm min-w-[150px]">
							<span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest border-b border-neutral-200 pb-1 mb-1">
								Canvas_Diagnostics
							</span>
							<div className="flex justify-between">
								<span className="text-[8px] font-mono text-neutral-500 uppercase">
									Health
								</span>
								<span className="text-[8px] font-mono text-green-600 font-bold uppercase">
									Optimal
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-[8px] font-mono text-neutral-500 uppercase">
									Latency
								</span>
								<span className="text-[8px] font-mono text-[#1a1a1a]">
									0.04ms
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-[8px] font-mono text-neutral-500 uppercase">
									Buffer
								</span>
								<span className="text-[8px] font-mono text-[#FF4400]">
									Stable
								</span>
							</div>
						</div>
					</Panel>
				</ReactFlow>
			</div>
		);
	},
);

WorkflowCanvas.displayName = "WorkflowCanvas";
