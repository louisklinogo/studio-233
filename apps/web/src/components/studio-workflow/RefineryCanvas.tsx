"use client";

import {
	addEdge,
	Background,
	Connection,
	Controls,
	Node,
	ReactFlow,
	ReactFlowInstance,
	useEdgesState,
	useNodesState,
} from "@xyflow/react";
import { useCallback, useMemo, useState } from "react";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";
import "@xyflow/react/dist/style.css";
import { BlueprintStarter } from "./BlueprintStarter";
import { GateNode } from "./nodes/GateNode";
import { RouterNode } from "./nodes/RouterNode";
import { StandardNode } from "./nodes/StandardNode";
import { TriggerNode } from "./nodes/TriggerNode";

// Initial Empty State
const initialNodes: any[] = [];
const initialEdges: any[] = [];

let id = 0;
const getId = () => `node_${id++}`;

interface RefineryCanvasProps {
	nodes: Node[];
	edges: any[];
	onNodesChange: any;
	onEdgesChange: any;
	onConnect: any;
	setNodes: any; // Using any for simplicity in this refactor, ideally strictly typed
	onNodeSelect?: (
		nodeId: string | undefined,
		nodeType?: string,
		nodeLabel?: string,
		nodeCategory?: string,
	) => void;
	onDeleteNode?: (nodeId: string) => void;
	onDuplicateNode?: (nodeId: string) => void;
}

export function RefineryCanvas({
	nodes,
	edges,
	onNodesChange,
	onEdgesChange,
	onConnect,
	setNodes,
	onNodeSelect,
	onDeleteNode,
	onDuplicateNode,
}: RefineryCanvasProps) {
	const [reactFlowInstance, setReactFlowInstance] =
		useState<ReactFlowInstance | null>(null);
	const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

	// Register custom nodes
	const nodeTypes = useMemo(
		() => ({
			standard: StandardNode,
			trigger: TriggerNode,
			gate: GateNode,
			router: RouterNode,
		}),
		[],
	);

	// Inject Handlers into Node Data
	// We map over nodes to add the callback functions dynamically
	const nodesWithHandlers = useMemo(() => {
		return nodes.map((node) => ({
			...node,
			data: {
				...node.data,
				onDelete: () => onDeleteNode?.(node.id),
				onDuplicate: () => onDuplicateNode?.(node.id),
			},
		}));
	}, [nodes, onDeleteNode, onDuplicateNode]);

	const onDragOver = useCallback((event: React.DragEvent) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
	}, []);

	const onDrop = useCallback(
		(event: React.DragEvent) => {
			event.preventDefault();

			const type = event.dataTransfer.getData("application/reactflow");

			// check if the dropped element is valid
			if (typeof type === "undefined" || !type || !reactFlowInstance) {
				return;
			}

			const position = reactFlowInstance.screenToFlowPosition({
				x: event.clientX,
				y: event.clientY,
			});

			// Determine Node Component & Data based on dropped type
			let nodeType = "standard";
			let nodeData = { label: "New Node" };

			if (type.startsWith("input.")) {
				nodeType = "trigger";
				nodeData = {
					label: type.split(".")[1].toUpperCase(),
					triggerType: type === "input.cron" ? "cron" : "manual",
					category: "input",
				};
			} else if (type === "logic.gate") {
				nodeType = "gate";
				nodeData = { label: "Quality Gate", category: "logic" };
			} else if (type === "logic.router") {
				nodeType = "router";
				nodeData = { label: "Router", category: "logic" };
			} else {
				nodeType = "standard";
				nodeData = {
					label: type.split(".")[1].toUpperCase(),
					category: type.startsWith("gen.") ? "generation" : "vision", // Differentiate vision vs generation
				};
			}

			const newNode = {
				id: getId(),
				type: nodeType,
				position,
				data: nodeData,
			};

			setNodes((nds: any[]) => nds.concat(newNode));
			setHasSeenOnboarding(true); // Dismiss onboarding on drop

			// Auto-select the new node to open Inspector immediately
			setTimeout(() => {
				if (onNodeSelect) {
					onNodeSelect(
						newNode.id,
						newNode.type,
						newNode.data.label as string,
						newNode.data.category as string,
					);
				}
			}, 50);
		},
		[reactFlowInstance, setNodes, nodes, onNodeSelect],
	);

	// Handle Blueprint Selection
	const handleBlueprintSelect = useCallback(
		(option: "blank" | "ai" | "template") => {
			if (option === "blank") {
				// Just dismiss, leaving grid empty
				setHasSeenOnboarding(true);
			} else if (option === "template") {
				// Load a mock E-commerce Template
				const templateNodes = [
					{
						id: "t1",
						type: "trigger",
						position: { x: 100, y: 200 },
						data: {
							label: "MANUAL INPUT",
							triggerType: "manual",
							category: "input",
						},
					},
					{
						id: "p1",
						type: "standard",
						position: { x: 400, y: 200 },
						data: { label: "REMOVE BG", category: "vision" },
					},
					{
						id: "p2",
						type: "standard",
						position: { x: 700, y: 200 },
						data: { label: "SAVE GALLERY", category: "output" },
					},
				];
				const templateEdges = [
					{ id: "e1", source: "t1", target: "p1" },
					{ id: "e2", source: "p1", target: "p2" },
				];
				setNodes(templateNodes);
				// We need to pass edges setter too if we want full template support,
				// but for now let's focus on nodes. Edges might need to be lifted fully or passed down.
				// setEdges(templateEdges); // Error: setEdges not passed.
				// NOTE: Ideally we pass setEdges too.
				setHasSeenOnboarding(true);
			} else {
				// AI Architect (Mock for now)
				setHasSeenOnboarding(true);
			}
		},
		[setNodes],
	);

	// Selection Handler (Consolidated)
	const onSelectionChange = useCallback(
		({ nodes }: { nodes: Node[] }) => {
			if (onNodeSelect) {
				if (nodes.length === 1) {
					const node = nodes[0];
					onNodeSelect(
						node.id,
						node.type,
						node.data.label as string,
						node.data.category as string,
					);
				} else {
					onNodeSelect(undefined);
				}
			}
		},
		[onNodeSelect],
	);

	// Node Click Handler (Backup for direct interaction)
	const onNodeClick = useCallback(
		(event: React.MouseEvent, node: Node) => {
			if (onNodeSelect) {
				onNodeSelect(
					node.id,
					node.type,
					node.data.label as string,
					node.data.category as string,
				);
			}
		},
		[onNodeSelect],
	);

	return (
		<div className="w-full h-full relative">
			<ReactFlow
				nodes={nodesWithHandlers}
				edges={edges}
				nodeTypes={nodeTypes}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				onInit={setReactFlowInstance}
				onDrop={onDrop}
				onDragOver={onDragOver}
				onSelectionChange={onSelectionChange}
				onNodeClick={onNodeClick}
				minZoom={0.1}
				maxZoom={2}
				defaultViewport={{ x: 0, y: 0, zoom: 1 }}
				fitView
				proOptions={{ hideAttribution: true }}
				className="bg-transparent"
				deleteKeyCode={["Backspace", "Delete"]}
			>
				{/* 
                    Using our custom BackgroundGrid component BEHIND React Flow 
                    to ensure visual consistency with Dashboard.
                    React Flow's native background is disabled/transparent.
                */}
				<div className="absolute inset-0 -z-10 pointer-events-none">
					<BackgroundGrid />
				</div>

				<Controls
					className="bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur border border-neutral-200 dark:border-neutral-800 rounded-[4px] shadow-sm !left-4 !bottom-24 m-0"
					showInteractive={false}
				/>
			</ReactFlow>

			{/* Blueprint Starter Overlay */}
			{!hasSeenOnboarding && nodes.length === 0 && (
				<BlueprintStarter onSelectOption={handleBlueprintSelect} />
			)}
		</div>
	);
}
