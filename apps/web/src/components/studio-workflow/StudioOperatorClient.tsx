"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
	addEdge,
	Connection,
	Node,
	useEdgesState,
	useNodesState,
} from "@xyflow/react";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";
import { OperatorHeader } from "@/components/ui/operator/OperatorHeader";
import { uploadFiles } from "@/lib/studio-workflow/file-manager";
import type { MediaFile } from "@/lib/studio-workflow/plugins/types";
import { useTRPC } from "@/trpc/client";
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
	const trpc = useTRPC();

	const serializeNodes = useCallback(
		(items: any[]) =>
			items.map(({ id, position, type, data }: any) => ({
				id,
				position,
				type,
				data,
			})),
		[],
	);
	const serializeEdges = useCallback(
		(items: any[]) =>
			items.map(({ id, source, target, animated, markerEnd }: any) => ({
				id,
				source,
				target,
				animated,
				markerEnd,
			})),
		[],
	);

	const listQuery = useQuery({
		...trpc.workflow.list.queryOptions({ projectId }),
		refetchOnWindowFocus: false,
		staleTime: 60_000,
	});

	const createWorkflowMutation = useMutation(
		trpc.workflow.create.mutationOptions(),
	);
	const updateWorkflowMutation = useMutation(
		trpc.workflow.update.mutationOptions(),
	);
	const startRunMutation = useMutation(
		trpc.workflow.startRun.mutationOptions(),
	);

	const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(
		workflowId ?? null,
	);
	const [workflowName, setWorkflowName] = useState<string>("Workflow");
	const [dirty, setDirty] = useState(false);
	const hydratedRef = useRef(false);
	const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [activeRunId, setActiveRunId] = useState<string | null>(null);

	// Workflow State (Lifted Up)
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

	// Input artifacts (uploaded to blob) keyed by trigger node id
	type TriggerInputState = {
		files: File[];
		uploaded: MediaFile[];
		isUploading: boolean;
		uploadProgress: number;
	};
	const [triggerInputFiles, setTriggerInputFiles] = useState<
		Record<string, TriggerInputState>
	>({});

	// Connect Handler
	const onConnect = useCallback(
		(params: Connection) => setEdges((eds) => addEdge(params, eds)),
		[setEdges],
	);

	// Handle Blueprint Selection (From Mission Control)
	const handleBlueprintSelect = useCallback(
		async (option: "blank" | "ai" | "template") => {
			let nextNodes: any[] = [];
			let nextEdges: any[] = [];
			let name = "Workflow";

			if (option === "blank") {
				nextNodes = [];
				nextEdges = [];
				name = "Workflow";
			} else if (option === "template") {
				name = "Template Workflow";
				nextNodes = [
					{
						id: "t1",
						type: "trigger",
						position: { x: 100, y: 200 },
						data: {
							label: "MANUAL INPUT",
							triggerType: "manual",
							category: "input",
							pluginId: "media-input",
							config: {},
						},
					},
					{
						id: "p1",
						type: "standard",
						position: { x: 400, y: 200 },
						data: {
							label: "REMOVE BG",
							category: "vision",
							pluginId: "background-removal",
							config: { provider: "auto" },
						},
					},
					{
						id: "p2",
						type: "standard",
						position: { x: 700, y: 200 },
						data: {
							label: "SAVE GALLERY",
							category: "output",
							pluginId: "media-output",
							config: {},
						},
					},
				];
				nextEdges = [
					{ id: "e1", source: "t1", target: "p1" },
					{ id: "e2", source: "p1", target: "p2" },
				];
			} else {
				name = "AI Workflow";
				nextNodes = [];
				nextEdges = [];
			}

			setNodes(nextNodes);
			setEdges(nextEdges);

			try {
				const created = await createWorkflowMutation.mutateAsync({
					projectId,
					name,
					description: "",
					nodes: serializeNodes(nextNodes),
					edges: serializeEdges(nextEdges),
				});
				setActiveWorkflowId(created.id);
				setWorkflowName(created.name ?? name);
				setDirty(false);
				await listQuery.refetch();
			} catch {
				// If creation fails, keep local state (user can still work)
			}
		},
		[
			setNodes,
			setEdges,
			createWorkflowMutation,
			projectId,
			serializeNodes,
			serializeEdges,
			listQuery,
		],
	);

	const currentWorkflow = useMemo(() => {
		if (!listQuery.data) return null;
		if (activeWorkflowId) {
			return (
				listQuery.data.find((wf: any) => wf.id === activeWorkflowId) ?? null
			);
		}
		return (listQuery.data[0] as any) ?? null;
	}, [listQuery.data, activeWorkflowId]);

	// Hydrate UI from persisted workflow (or create a new one)
	useEffect(() => {
		if (hydratedRef.current) return;
		if (listQuery.isLoading) return;

		async function hydrate() {
			if (currentWorkflow) {
				setActiveWorkflowId(currentWorkflow.id);
				setWorkflowName(currentWorkflow.name ?? "Workflow");
				setNodes((currentWorkflow.nodes as any) ?? []);
				setEdges((currentWorkflow.edges as any) ?? []);
				hydratedRef.current = true;
				return;
			}

			const created = await createWorkflowMutation.mutateAsync({
				projectId,
				name: "Workflow",
				description: "",
				nodes: [],
				edges: [],
			});
			setActiveWorkflowId(created.id);
			setWorkflowName(created.name ?? "Workflow");
			setNodes((created.nodes as any) ?? []);
			setEdges((created.edges as any) ?? []);
			hydratedRef.current = true;
		}

		void hydrate();
	}, [
		listQuery.isLoading,
		currentWorkflow,
		createWorkflowMutation,
		projectId,
		setNodes,
		setEdges,
	]);

	const handleSwitchWorkflow = useCallback(
		(id: string) => {
			const selected = listQuery.data?.find((wf: any) => wf.id === id);
			if (!selected) return;
			setActiveWorkflowId(selected.id);
			setWorkflowName(selected.name ?? "Workflow");
			setNodes((selected.nodes as any) ?? []);
			setEdges((selected.edges as any) ?? []);
			setActiveRunId(null);
			setIsMissionControlOpen(false);
		},
		[listQuery.data, setNodes, setEdges],
	);

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

	// Mark workflow dirty when graph changes
	useEffect(() => {
		if (!hydratedRef.current) return;
		setDirty(true);
	}, [nodes, edges]);

	const saveNow = useCallback(async () => {
		if (!activeWorkflowId) return;
		await updateWorkflowMutation.mutateAsync({
			id: activeWorkflowId,
			projectId,
			name: workflowName,
			nodes: serializeNodes(nodes),
			edges: serializeEdges(edges),
		});
		setDirty(false);
	}, [
		activeWorkflowId,
		updateWorkflowMutation,
		projectId,
		workflowName,
		nodes,
		edges,
		serializeNodes,
		serializeEdges,
	]);

	// Debounced autosave
	useEffect(() => {
		if (!dirty) return;
		if (!activeWorkflowId) return;
		if (!hydratedRef.current) return;

		if (autosaveTimerRef.current) {
			clearTimeout(autosaveTimerRef.current);
		}

		autosaveTimerRef.current = setTimeout(() => {
			void saveNow();
		}, 1200);

		return () => {
			if (autosaveTimerRef.current) {
				clearTimeout(autosaveTimerRef.current);
				autosaveTimerRef.current = null;
			}
		};
	}, [dirty, activeWorkflowId, saveNow]);

	const selectedTriggerState =
		selectedNodeId && selectedNodeData?.type === "trigger"
			? triggerInputFiles[selectedNodeId]
			: undefined;

	const updateTriggerState = useCallback(
		(nodeId: string, update: Partial<TriggerInputState>) => {
			setTriggerInputFiles((prev) => {
				const current = prev[nodeId] ?? {
					files: [],
					uploaded: [],
					isUploading: false,
					uploadProgress: 0,
				};
				return { ...prev, [nodeId]: { ...current, ...update } };
			});
		},
		[],
	);

	const handleTriggerUpload = useCallback(async () => {
		if (!selectedNodeId) return;
		const entry = triggerInputFiles[selectedNodeId];
		if (!entry?.files?.length) return;

		updateTriggerState(selectedNodeId, {
			isUploading: true,
			uploadProgress: 0,
		});
		try {
			const result = await uploadFiles(entry.files, (progressItems) => {
				const completed = progressItems.filter(
					(p) => p.status === "completed",
				).length;
				const percent = Math.round((completed / progressItems.length) * 100);
				updateTriggerState(selectedNodeId, { uploadProgress: percent });
			});

			updateTriggerState(selectedNodeId, {
				uploaded: [...(entry.uploaded ?? []), ...result.files],
			});
		} finally {
			updateTriggerState(selectedNodeId, { isUploading: false });
		}
	}, [selectedNodeId, triggerInputFiles, updateTriggerState]);

	const handleTestRun = useCallback(async () => {
		if (!activeWorkflowId) return;
		await saveNow();
		const allUploadedInputs = Object.values(triggerInputFiles).flatMap(
			(value) => value.uploaded ?? [],
		);

		const run = await startRunMutation.mutateAsync({
			projectId,
			workflowId: activeWorkflowId,
			payload: {
				files: allUploadedInputs,
			},
		});
		setActiveRunId(run.id);
		setMode("run");
	}, [
		activeWorkflowId,
		saveNow,
		startRunMutation,
		projectId,
		triggerInputFiles,
	]);

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
						workflows={(listQuery.data as any[]) ?? []}
					/>
				)}
			</AnimatePresence>

			{/* Fixed Header */}
			<OperatorHeader
				mode={mode}
				setMode={setMode}
				isLive={isLive}
				setIsLive={setIsLive}
				title={workflowName}
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
									<BatchMonitor projectId={projectId} runId={activeRunId} />
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
								triggerFiles={selectedTriggerState?.files ?? []}
								isTriggerUploading={selectedTriggerState?.isUploading ?? false}
								triggerUploadProgress={
									selectedTriggerState?.uploadProgress ?? 0
								}
								onTriggerFilesSelected={(files) => {
									if (!selectedNodeId) return;
									updateTriggerState(selectedNodeId, {
										files: [...(selectedTriggerState?.files ?? []), ...files],
									});
								}}
								onTriggerRemoveFile={(index) => {
									if (!selectedNodeId) return;
									const remaining = (selectedTriggerState?.files ?? []).filter(
										(_, idx) => idx !== index,
									);
									updateTriggerState(selectedNodeId, { files: remaining });
								}}
								onTriggerUpload={handleTriggerUpload}
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
			<FloatingCommandBar mode={mode} onTestRun={handleTestRun} />
		</div>
	);
}
