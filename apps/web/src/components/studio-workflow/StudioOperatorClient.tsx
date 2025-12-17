"use client";

import {
	addEdge,
	Connection,
	Node,
	useEdgesState,
	useNodesState,
} from "@xyflow/react";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";
import { OperatorHeader } from "@/components/ui/operator/OperatorHeader";
import { BatchMonitor } from "./BatchMonitor";
import { FilmstripOverlay } from "./FilmstripOverlay";
import { FloatingCommandBar } from "./FloatingCommandBar";
import { MissionControl } from "./MissionControl";
import { NodeInspector } from "./NodeInspector";
import { PartsBin } from "./PartsBin";
import { RefineryCanvas } from "./RefineryCanvas";

export type OperatorMode = "build" | "run" | "data";

// Initial Empty State (Moved from Canvas to Here)
const initialNodes: any[] = [];
const initialEdges: any[] = [];
let id = 0;
const getId = () => `node_${id++}`;

interface StudioOperatorClientProps {
	projectId: string;
	workflowId?: string;
}

import { AssetLibrary } from "@/components/studio+/AssetLibrary";
import type { UploadedAsset } from "@/types/studio";

export function StudioOperatorClient({
	projectId,
	workflowId,
}: StudioOperatorClientProps) {
	const [mode, setMode] = useState<OperatorMode>("build");
	const [isLive, setIsLive] = useState(false);
	const [isMissionControlOpen, setIsMissionControlOpen] = useState(false);

	// Workflow State (Lifted Up)
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

	// Connect Handler
	const onConnect = useCallback(
		(params: Connection) => setEdges((eds) => addEdge(params, eds)),
		[setEdges],
	);

	// Handle Blueprint Selection (From Mission Control)
	const handleBlueprintSelect = useCallback(
		(option: "blank" | "ai" | "template") => {
			if (option === "blank") {
				setNodes([]);
				setEdges([]);
			} else if (option === "template") {
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
				setEdges(templateEdges);
			} else {
				// AI Architect Mock
				console.log("AI Architect Initialized");
			}
		},
		[setNodes, setEdges],
	);

	// Handle Switching Workflows (Mock)
	const handleSwitchWorkflow = (id: string) => {
		console.log("Switching to workflow:", id);
		// In real app, fetch new nodes/edges here
		setIsMissionControlOpen(false);
	};

	// Mock state for data integration
	const [assets, setAssets] = useState<UploadedAsset[]>([]);

	// Interaction State
	const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>();
	const [selectedNodeData, setSelectedNodeData] = useState<{
		id: string;
		type: string;
		label: string;
		category?: string;
	} | null>(null);

	// Bottom Drawer State (Manual Toggle)
	const [isFilmstripOpen, setIsFilmstripOpen] = useState(false);

	// Handle selection from Canvas
	const handleNodeSelect = useCallback(
		(
			id: string | undefined,
			type?: string,
			label?: string,
			category?: string,
		) => {
			setSelectedNodeId(id);
			if (id && type && label) {
				setSelectedNodeData({ id, type, label, category });
			} else {
				setSelectedNodeData(null);
				setIsFilmstripOpen(false); // Close it if nothing is selected
			}
		},
		[],
	);

	// Handle Node Deletion
	const handleDeleteNode = useCallback(
		(idToDelete?: string) => {
			const targetId = idToDelete || selectedNodeId;
			if (targetId) {
				setNodes((nds) => nds.filter((node) => node.id !== targetId));
				if (targetId === selectedNodeId) {
					handleNodeSelect(undefined); // Deselect if we deleted the selected one
				}
			}
		},
		[selectedNodeId, setNodes, handleNodeSelect],
	);

	// Handle Node Duplication
	const handleDuplicateNode = useCallback(
		(idToDuplicate: string) => {
			const nodeToCopy = nodes.find((n) => n.id === idToDuplicate);
			if (!nodeToCopy) return;

			const newNode = {
				...nodeToCopy,
				id: getId(),
				position: {
					x: nodeToCopy.position.x + 50,
					y: nodeToCopy.position.y + 50,
				},
				data: {
					...nodeToCopy.data,
					label: `${nodeToCopy.data.label} (Copy)`,
				},
				selected: false,
			};

			setNodes((nds) => nds.concat(newNode));
		},
		[nodes, setNodes],
	);

	// Update nodes with handlers whenever they change
	// This is a bit of a hack to inject handlers, normally we'd pass these via a Context or bespoke store
	// but for this prototype, we'll map them during render or use an effect.
	// BETTER APPROACH: Pass these to RefineryCanvas and let it map them to node data.

	return (
		<div className="flex flex-col h-screen w-screen bg-neutral-50 dark:bg-[#050505] overflow-hidden relative text-neutral-900 dark:text-neutral-100 font-sans selection:bg-[#FF4D00] selection:text-white">
			{/* Mission Control Overlay */}
			<AnimatePresence>
				{isMissionControlOpen && (
					<MissionControl
						isOpen={isMissionControlOpen}
						onClose={() => setIsMissionControlOpen(false)}
						onSelectWorkflow={handleSwitchWorkflow}
						onCreateNew={handleBlueprintSelect}
					/>
				)}
			</AnimatePresence>

			{/* Fixed Header */}
			<OperatorHeader
				mode={mode}
				setMode={setMode}
				isLive={isLive}
				setIsLive={setIsLive}
				title="Fashion Campaign S/S" // TODO: Fetch from props
				onTitleClick={() => setIsMissionControlOpen(!isMissionControlOpen)}
			/>

			{/* Main Workspace */}
			<div className="flex-1 flex relative overflow-hidden mt-14">
				{/* CENTER: Canvas / Monitor / Library */}
				<div className="flex-1 relative h-full">
					{/* Global Background Grid */}
					<BackgroundGrid />

					{/* PARTS BIN (Floating Overlay) */}
					<AnimatePresence>
						{mode === "build" && (
							<motion.div
								key="parts-bin"
								initial={{ opacity: 0, x: -20, y: "-50%" }}
								animate={{ opacity: 1, x: 0, y: "-50%" }}
								exit={{ opacity: 0, x: -20, y: "-50%" }}
								className="absolute left-6 top-1/2 z-30" // Centered vertically
							>
								<PartsBin />
							</motion.div>
						)}
					</AnimatePresence>

					<AnimatePresence mode="wait">
						{mode === "build" && (
							<motion.div
								key="build"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.2 }}
								className="absolute inset-0"
							>
								{/* REFINERY CANVAS */}
								<RefineryCanvas
									nodes={nodes}
									edges={edges}
									onNodesChange={onNodesChange}
									onEdgesChange={onEdgesChange}
									onConnect={onConnect}
									setNodes={setNodes}
									onNodeSelect={handleNodeSelect}
									onDeleteNode={handleDeleteNode}
									onDuplicateNode={handleDuplicateNode}
								/>
							</motion.div>
						)}

						{mode === "run" && (
							<motion.div
								key="run"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.2 }}
								className="absolute inset-0 bg-black/5" // Dimmed background
							>
								<div className="flex items-center justify-center h-full">
									<BatchMonitor />
								</div>
							</motion.div>
						)}

						{mode === "data" && (
							<motion.div
								key="data"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.2 }}
								className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm p-8"
							>
								<div className="h-full w-full bg-white dark:bg-[#111] border border-neutral-200 dark:border-neutral-800 shadow-xl rounded-[2px] overflow-hidden">
									{/* ASSET LIBRARY (Full Width) */}
									<AssetLibrary
										assets={assets}
										onUploadMore={() => {}}
										onAssetsUploaded={(newAssets) =>
											setAssets([...assets, ...newAssets])
										}
									/>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				{/* RIGHT: Node Inspector (Build Mode + Selection) */}
				<AnimatePresence>
					{mode === "build" && selectedNodeId && selectedNodeData && (
						<motion.div
							initial={{ width: 0, opacity: 0 }}
							animate={{ width: "auto", opacity: 1 }}
							exit={{ width: 0, opacity: 0 }}
							className="h-full z-20"
						>
							<NodeInspector
								nodeId={selectedNodeData.id}
								nodeType={selectedNodeData.type}
								nodeLabel={selectedNodeData.label}
								nodeCategory={selectedNodeData.category}
								onClose={() => handleNodeSelect(undefined)}
								onToggleOutput={() => setIsFilmstripOpen(!isFilmstripOpen)}
								onDelete={handleDeleteNode}
								isOutputVisible={isFilmstripOpen}
								hasOutputData={true} // Mock: All nodes have data for now to demonstrate UI
							/>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* BOTTOM: Filmstrip (Build Mode + Selection) */}
			{mode === "build" && (
				<FilmstripOverlay
					isOpen={isFilmstripOpen && !!selectedNodeId}
					onClose={() => setIsFilmstripOpen(false)}
					selectedNodeId={selectedNodeId}
				/>
			)}

			{/* Floating HUD */}
			<FloatingCommandBar mode={mode} />
		</div>
	);
}
