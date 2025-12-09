"use client";

import {
	Background,
	Controls,
	type Edge,
	MiniMap,
	type Node,
	Panel,
	ReactFlow,
	ReactFlowProvider,
	useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useAtom, useSetAtom } from "jotai";
import { nanoid } from "nanoid";
import { useEffect, useMemo, useState } from "react";
import {
	addNodeAtom,
	clearWorkflowAtom,
	deleteSelectedAtom,
	deleteSelectedEdgeAtom,
	edgesAtom,
	nodesAtom,
	onConnectAtom,
	onEdgesChangeAtom,
	onNodesChangeAtom,
	panelCollapsedAtom,
	panelWidthAtom,
	redoAtom,
	selectedEdgeIdAtom,
	selectedNodeIdAtom,
	showMinimapAtom,
	undoAtom,
	type WorkflowNodeData,
} from "@/lib/studio-workflow/store";
import { nodeTypes } from "./nodes";
import { WorkflowToolbar } from "./WorkflowToolbar";

type RFNode = Node<WorkflowNodeData>;

type Props = {
	onRun: () => void;
	onSave: () => Promise<void> | void;
	isRunning: boolean;
	isSaving: boolean;
	hasUnsavedChanges: boolean;
	workflowName: string;
	onRename: (value: string) => void;
};

const flowProOptions = { hideAttribution: true } as const;

type ContextMenuState =
	| { visible: false }
	| { visible: true; x: number; y: number; position: { x: number; y: number } };

function CanvasContextMenu({
	state,
	onAdd,
}: {
	state: ContextMenuState;
	onAdd: (type: "input" | "default") => void;
}) {
	if (!state.visible) return null;
	return (
		<div
			className="absolute z-30 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded shadow-lg py-2 min-w-[180px]"
			style={{ top: state.y, left: state.x }}
			onClick={(e) => e.stopPropagation()}
		>
			<button
				type="button"
				className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
				onClick={() => onAdd("input")}
			>
				Add trigger
			</button>
			<button
				type="button"
				className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
				onClick={() => onAdd("default")}
			>
				Add action
			</button>
		</div>
	);
}

function WorkflowCanvasInner({
	onRun,
	onSave,
	isRunning,
	isSaving,
	hasUnsavedChanges,
	workflowName,
	onRename,
}: Props) {
	const [nodes] = useAtom(nodesAtom);
	const [edges] = useAtom<Edge[]>(edgesAtom);
	const [selectedNodeId, setSelectedNodeId] = useAtom(selectedNodeIdAtom);
	const [selectedEdgeId, setSelectedEdgeId] = useAtom(selectedEdgeIdAtom);
	const onNodesChange = useSetAtom(onNodesChangeAtom);
	const onEdgesChange = useSetAtom(onEdgesChangeAtom);
	const onConnect = useSetAtom(onConnectAtom);
	const [showMinimap, setShowMinimap] = useAtom(showMinimapAtom);
	const addNode = useSetAtom(addNodeAtom);
	const undo = useSetAtom(undoAtom);
	const redo = useSetAtom(redoAtom);
	const deleteSelected = useSetAtom(deleteSelectedAtom);
	const deleteSelectedEdge = useSetAtom(deleteSelectedEdgeAtom);
	const clearWorkflow = useSetAtom(clearWorkflowAtom);
	const [panelCollapsed] = useAtom(panelCollapsedAtom);
	const [panelWidth] = useAtom(panelWidthAtom);
	const { screenToFlowPosition, fitView } = useReactFlow();
	const [contextMenu, setContextMenu] = useState<ContextMenuState>({
		visible: false,
	});

	useEffect(() => {
		const close = () => setContextMenu({ visible: false });
		const handleKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") close();
		};
		window.addEventListener("click", close);
		window.addEventListener("keydown", handleKey);
		return () => {
			window.removeEventListener("click", close);
			window.removeEventListener("keydown", handleKey);
		};
	}, []);

	const handleAddNode = (
		position: { x: number; y: number },
		type: "input" | "default",
	) => {
		addNode({
			id: `${type}-${nanoid(6)}`,
			position,
			data: {
				label: type === "input" ? "Trigger" : "Action",
				description: type === "input" ? "Start" : "Batch step",
				status: "idle",
				type: type === "input" ? "trigger" : "action",
			},
			type,
		});
	};

	const handleAddCenter = (type: "default" | "input" = "default") => {
		const rect = document.querySelector(".react-flow")?.getBoundingClientRect();
		const center = rect
			? screenToFlowPosition({
					x: rect.left + rect.width / 2,
					y: rect.top + rect.height / 2,
				})
			: screenToFlowPosition({
					x: window.innerWidth / 2,
					y: window.innerHeight / 2,
				});
		handleAddNode(center, type);
	};

	const handleSelectionChange = (params: {
		nodes?: Node[];
		edges?: Edge[];
	}) => {
		const firstNode = params.nodes?.[0];
		const firstEdge = params.edges?.[0];
		const nextNodeId = firstNode?.id ?? null;
		const nextEdgeId = firstEdge?.id ?? null;
		if (nextNodeId !== selectedNodeId) {
			setSelectedNodeId(nextNodeId);
		}
		if (nextEdgeId !== selectedEdgeId) {
			setSelectedEdgeId(nextEdgeId);
		}
		if (contextMenu.visible) {
			setContextMenu({ visible: false });
		}
	};

	const handleConnectEnd = (event: MouseEvent | TouchEvent) => {
		const { clientX, clientY } =
			"changedTouches" in event
				? event.changedTouches[0]
				: { clientX: event.clientX, clientY: event.clientY };
		const target =
			"changedTouches" in event
				? document.elementFromPoint(clientX, clientY)
				: (event.target as Element | null);
		const hitNode = target?.closest?.(".react-flow__node");
		const hitHandle = target?.closest?.(".react-flow__handle");
		if (hitNode || hitHandle) return;
		const position = screenToFlowPosition({ x: clientX, y: clientY });
		setContextMenu({ visible: true, x: clientX, y: clientY, position });
	};

	const toolbarProps = useMemo(
		() => ({
			onAdd: () => handleAddCenter("default"),
			onAddTrigger: () => handleAddCenter("input"),
			onUndo: () => undo(),
			onRedo: () => redo(),
			onDelete: () => {
				deleteSelected();
				deleteSelectedEdge();
			},
			onClear: () => clearWorkflow(),
			onFit: () => fitView({ padding: 0.2, duration: 300 }),
			onToggleMinimap: () => setShowMinimap((v) => !v),
			onSave,
			onRun,
			isSaving,
			isRunning,
			hasUnsavedChanges,
			workflowName,
			onRename,
			showMinimap,
		}),
		[
			clearWorkflow,
			deleteSelected,
			deleteSelectedEdge,
			fitView,
			hasUnsavedChanges,
			isRunning,
			isSaving,
			onRename,
			onRun,
			onSave,
			redo,
			setShowMinimap,
			showMinimap,
			undo,
			workflowName,
		],
	);

	return (
		<div className="h-full w-full relative">
			<WorkflowToolbar {...toolbarProps} />
			<ReactFlow<RFNode, Edge>
				proOptions={flowProOptions}
				nodes={nodes}
				edges={edges}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				onSelectionChange={handleSelectionChange}
				onPaneContextMenu={(event) => {
					event.preventDefault();
					const position = screenToFlowPosition({
						x: event.clientX,
						y: event.clientY,
					});
					setContextMenu({
						visible: true,
						x: event.clientX,
						y: event.clientY,
						position,
					});
				}}
				onConnectEnd={handleConnectEnd}
				nodeTypes={nodeTypes}
				fitView
				fitViewOptions={{ padding: 0.2, minZoom: 0.5, maxZoom: 1.2 }}
				className="bg-transparent"
			>
				<Background />
				{showMinimap ? <MiniMap pannable zoomable /> : null}
				<Controls showInteractive={false} position="top-right" />
				<Panel
					position="top-left"
					className="bg-white/80 dark:bg-black/60 shadow-sm px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-800"
				>
					<div className="text-xs text-neutral-700 dark:text-neutral-200 font-mono space-y-1">
						<p className="font-semibold">Workflow canvas</p>
						<p>Drag nodes, connect, and align with batch steps.</p>
					</div>
				</Panel>
			</ReactFlow>
			<CanvasContextMenu
				state={contextMenu}
				onAdd={(type) => {
					if (!contextMenu.visible) return;
					handleAddNode(contextMenu.position, type);
					setContextMenu({ visible: false });
				}}
			/>
			{panelCollapsed ? null : (
				<div
					className="pointer-events-none absolute inset-y-0 right-0 bg-gradient-to-l from-white/60 dark:from-black/40"
					style={{ width: `${panelWidth}%` }}
				/>
			)}
		</div>
	);
}

export function StudioWorkflowCanvas(props: Props) {
	return (
		<ReactFlowProvider>
			<WorkflowCanvasInner {...props} />
		</ReactFlowProvider>
	);
}
