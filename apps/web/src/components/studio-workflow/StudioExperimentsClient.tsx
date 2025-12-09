"use client";

import {
	QueryClient,
	QueryClientProvider,
	useMutation,
	useQuery,
} from "@tanstack/react-query";
import {
	createTRPCClient,
	httpBatchLink,
	httpSubscriptionLink,
	splitLink,
} from "@trpc/client";
import type { Edge, Node } from "@xyflow/react";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo, useRef, useState } from "react";
import superjson from "superjson";
import { RightPanel } from "@/components/studio-workflow/RightPanel";
import { StudioWorkflowCanvas } from "@/components/studio-workflow/StudioWorkflowCanvas";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";
import {
	deleteSelectedAtom,
	deleteSelectedEdgeAtom,
	dirtyAtom,
	edgesAtom,
	initialEdges,
	initialNodes,
	nodesAtom,
	selectedNodeIdAtom,
	setEdgesAtom,
	setNodesAtom,
	updateNodeDataAtom,
	type WorkflowDefinition,
	type WorkflowNodeData,
	workflowIdAtom,
} from "@/lib/studio-workflow/store";
import type { AppRouter } from "@/server/trpc/routers/_app";
import { getUrl, TRPCProvider, useTRPC } from "@/trpc/client";

interface Props {
	projectId: string;
}

export function StudioExperimentsClient({ projectId }: Props) {
	// Local TRPC + Query clients to guarantee context even if upstream provider is missing in this route
	const [queryClient] = useState(() => new QueryClient());
	const [trpcClient] = useState(() =>
		createTRPCClient<AppRouter>({
			links: [
				splitLink({
					condition: (op) => op.type === "subscription",
					true: httpSubscriptionLink({ transformer: superjson, url: getUrl() }),
					false: httpBatchLink({
						transformer: superjson,
						url: getUrl(),
						headers() {
							return {
								"x-trpc-source": "client",
							};
						},
					}),
				}),
			],
		}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			<TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
				<StudioExperimentsInner projectId={projectId} />
			</TRPCProvider>
		</QueryClientProvider>
	);
}

function StudioExperimentsInner({ projectId }: Props) {
	const trpc = useTRPC();
	const setNodes = useSetAtom(setNodesAtom);
	const setEdges = useSetAtom(setEdgesAtom);
	const setWorkflowId = useSetAtom(workflowIdAtom);
	const updateNodeData = useSetAtom(updateNodeDataAtom);
	const deleteSelected = useSetAtom(deleteSelectedAtom);
	const deleteSelectedEdge = useSetAtom(deleteSelectedEdgeAtom);
	const setDirty = useSetAtom(dirtyAtom);
	const dirty = useAtomValue(dirtyAtom);
	const nodes = useAtomValue(nodesAtom);
	const edges = useAtomValue(edgesAtom);
	const selectedNodeId = useAtomValue(selectedNodeIdAtom);
	const selectedNode = useMemo(
		() => nodes.find((n) => n.id === selectedNodeId),
		[nodes, selectedNodeId],
	);
	const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
	const [workflowName, setWorkflowName] = useState("Workflow");
	const [runSnapshot, setRunSnapshot] = useState<any | null>(null);

	const workflowIdRef = useRef<string | null>(null);
	const hydratedRef = useRef(false);

	const serializeNodes = (items: Node<WorkflowNodeData>[]) =>
		items.map(({ id, position, type, data }) => ({ id, position, type, data }));
	const serializeEdges = (items: Edge[]) =>
		items.map(({ id, source, target, animated, markerEnd }) => ({
			id,
			source,
			target,
			animated,
			markerEnd: markerEnd as Record<string, unknown> | undefined,
		}));

	const listQuery = useQuery({
		...trpc.workflow.list.queryOptions({ projectId }),
		refetchOnWindowFocus: false,
		staleTime: 60_000,
	});

	const runsQuery = useQuery({
		...trpc.workflow.listRuns.queryOptions({ projectId }),
		refetchInterval: 4000,
		refetchOnWindowFocus: false,
	});

	const createMutation = useMutation(trpc.workflow.create.mutationOptions());
	const updateMutation = useMutation({
		...trpc.workflow.update.mutationOptions(),
		onSuccess: (data) => {
			if (data?.name) setWorkflowName(data.name);
			setDirty(false);
		},
	});
	const startRun = useMutation({
		...trpc.workflow.startRun.mutationOptions(),
		onSuccess: (result) => {
			setSelectedRunId(result.id);
			runsQuery.refetch();
		},
	});
	const runStatus = useQuery({
		...trpc.workflow.runStatus.queryOptions({ runId: selectedRunId ?? "" }),
		enabled: Boolean(selectedRunId),
		refetchInterval: selectedRunId ? 4000 : false,
	});

	useEffect(() => {
		if (runStatus.data) {
			setRunSnapshot(runStatus.data);
		}
	}, [runStatus.data]);

	const handleSave = async () => {
		if (!workflowIdRef.current) return;
		try {
			await updateMutation.mutateAsync({
				id: workflowIdRef.current,
				projectId,
				nodes: serializeNodes(nodes),
				edges: serializeEdges(edges),
			});
		} catch (error) {
			console.error("save", error);
		}
	};

	const handleRename = async (name: string) => {
		setWorkflowName(name);
		if (!workflowIdRef.current) return;
		try {
			await updateMutation.mutateAsync({
				id: workflowIdRef.current,
				projectId,
				name,
			});
		} catch (error) {
			console.error("rename", error);
		}
	};

	const currentWorkflow = useMemo<WorkflowDefinition | null>(() => {
		if (!listQuery.data || listQuery.data.length === 0) return null;
		return listQuery.data[0] as unknown as WorkflowDefinition;
	}, [listQuery.data]);

	// Hydrate store from server definition or create default
	useEffect(() => {
		if (hydratedRef.current) return;
		if (listQuery.isLoading) return;

		async function ensureWorkflow() {
			if (currentWorkflow) {
				setWorkflowId(currentWorkflow.id);
				setNodes(currentWorkflow.nodes as any);
				setEdges(currentWorkflow.edges as any);
				setWorkflowName(currentWorkflow.name || "Workflow");
				workflowIdRef.current = currentWorkflow.id;
				hydratedRef.current = true;
				return;
			}

			const created = await createMutation.mutateAsync({
				projectId,
				name: "Workflow",
				nodes: serializeNodes(initialNodes as Node<WorkflowNodeData>[]),
				edges: serializeEdges(initialEdges),
			});
			setWorkflowId(created.id);
			setNodes(created.nodes as any);
			setEdges(created.edges as any);
			setWorkflowName(created.name || "Workflow");
			workflowIdRef.current = created.id;
			hydratedRef.current = true;
		}

		ensureWorkflow().catch((err) => console.error("workflow hydrate", err));
	}, [
		listQuery.isLoading,
		currentWorkflow,
		createMutation,
		projectId,
		setWorkflowId,
		setNodes,
		setEdges,
	]);

	// Autosave when dirty
	useEffect(() => {
		if (!hydratedRef.current) return;
		if (!dirty) return;
		const id = setTimeout(() => {
			if (!workflowIdRef.current) return;
			updateMutation.mutate({
				id: workflowIdRef.current,
				projectId,
				nodes: serializeNodes(nodes),
				edges: serializeEdges(edges),
			});
		}, 600);
		return () => clearTimeout(id);
	}, [dirty, nodes, edges, projectId, updateMutation]);

	const handleRun = async () => {
		if (!workflowIdRef.current) return;
		try {
			await startRun.mutateAsync({
				projectId,
				workflowId: workflowIdRef.current,
				payload: { nodes: serializeNodes(nodes), edges: serializeEdges(edges) },
			});
		} catch (err) {
			console.error("start run", err);
		}
	};

	useEffect(() => {
		if (runsQuery.data && runsQuery.data.length > 0) {
			const newest = runsQuery.data[0]?.id;
			if (!selectedRunId) {
				setSelectedRunId(newest);
			}
		}
	}, [runsQuery.data, selectedRunId]);

	useEffect(() => {
		if (!selectedRunId) {
			nodes.forEach((node) => {
				if (node.data?.status !== "idle") {
					updateNodeData({ id: node.id, data: { status: "idle" } });
				}
			});
			return;
		}
		const detail = runSnapshot || runStatus.data;
		if (!detail?.steps?.length) return;
		const statusMap: Record<string, WorkflowNodeData["status"]> = {
			pending: "idle",
			pending_step: "idle",
			running: "running",
			completed: "success",
			success: "success",
			failed: "error",
			error: "error",
			canceled: "idle",
		};
		detail.steps.forEach((step: any, index: number) => {
			const node = nodes[index];
			if (!node) return;
			const next = statusMap[(step.state || "").toLowerCase()] || "idle";
			if (node.data?.status !== next) {
				updateNodeData({ id: node.id, data: { status: next } });
			}
		});
	}, [nodes, runSnapshot, runStatus.data, selectedRunId, updateNodeData]);

	const runsList = useMemo(
		() =>
			(runsQuery.data ?? []).map((run) => ({
				...run,
				createdAt: new Date(run.createdAt).toISOString(),
				finishedAt: run.finishedAt
					? new Date(run.finishedAt).toISOString()
					: null,
			})),
		[runsQuery.data],
	);

	return (
		<div className="h-screen w-screen overflow-hidden bg-neutral-50 dark:bg-[#050505]">
			<BackgroundGrid />
			<div className="absolute inset-0 flex">
				<div className="flex-1 relative">
					<StudioWorkflowCanvas
						onRun={handleRun}
						onSave={handleSave}
						isRunning={startRun.isPending}
						isSaving={updateMutation.isPending}
						hasUnsavedChanges={dirty}
						workflowName={workflowName}
						onRename={handleRename}
					/>
				</div>
				<RightPanel
					selectedNode={selectedNode as Node<WorkflowNodeData> | null}
					onUpdateNode={(id, data) => updateNodeData({ id, data })}
					onDeleteSelected={() => {
						deleteSelected();
						deleteSelectedEdge();
					}}
					runs={runsList}
					selectedRunId={selectedRunId}
					onSelectRun={(id) => setSelectedRunId(id)}
					runDetail={runSnapshot || runStatus.data}
					isLoadingRunDetail={runStatus.isLoading}
					onRefreshRuns={() => runsQuery.refetch()}
				/>
			</div>
		</div>
	);
}
