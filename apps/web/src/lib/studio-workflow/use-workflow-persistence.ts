import { useMutation, useQuery } from "@tanstack/react-query";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect } from "react";
import { useTRPC, useTRPCClient } from "@/trpc/client";
import {
	edgesAtom,
	hasUnsavedChangesAtom,
	isLoadingAtom,
	isSavingAtom,
	lastSavedAtom,
	nodesAtom,
	projectIdAtom,
	setWorkflowDataAtom,
	workflowIdAtom,
} from "./enhanced-store";
import {
	type SerializableEdge,
	type SerializableNode,
	serializeWorkflow,
	type WorkflowDefinition,
} from "./types";

export function assertWorkflowDefinitionApi(
	trpc: ReturnType<typeof useTRPC> | unknown,
) {
	const missing: string[] = [];
	const workflowDefinition = (trpc as any)?.workflowDefinition;

	if (!workflowDefinition) {
		missing.push("workflowDefinition");
	} else {
		const expectationMap: Record<string, unknown> = {
			"workflowDefinition.create.mutationOptions":
				workflowDefinition.create?.mutationOptions,
			"workflowDefinition.update.mutationOptions":
				workflowDefinition.update?.mutationOptions,
			"workflowDefinition.delete.mutationOptions":
				workflowDefinition.delete?.mutationOptions,
			"workflowDefinition.get.queryOptions":
				workflowDefinition.get?.queryOptions,
			"workflowDefinition.list.queryOptions":
				workflowDefinition.list?.queryOptions,
		};

		for (const [key, value] of Object.entries(expectationMap)) {
			if (typeof value !== "function") {
				missing.push(key);
			}
		}
	}

	if (missing.length > 0) {
		throw new Error(
			`TRPC workflowDefinition API is not ready. Missing: ${missing.join(", ")}. Ensure TRPCProvider and react-query are configured.`,
		);
	}
}

export function useWorkflowPersistence() {
	const [workflowId, setWorkflowId] = useAtom(workflowIdAtom);
	const [projectId, setProjectId] = useAtom(projectIdAtom);
	const nodes = useAtomValue(nodesAtom);
	const edges = useAtomValue(edgesAtom);
	const hasUnsavedChanges = useAtomValue(hasUnsavedChangesAtom);
	const isLoading = useAtomValue(isLoadingAtom);
	const isSaving = useAtomValue(isSavingAtom);
	const lastSaved = useAtomValue(lastSavedAtom);

	const setWorkflowData = useSetAtom(setWorkflowDataAtom) as (
		workflow: WorkflowDefinition,
	) => void;

	const normalizeWorkflow = (workflow: any): WorkflowDefinition => ({
		id: workflow.id,
		name: workflow.name,
		description: workflow.description ?? null,
		projectId: workflow.projectId,
		userId: workflow.userId,
		nodes: (workflow.nodes ?? []) as SerializableNode[],
		edges: (workflow.edges ?? []) as SerializableEdge[],
		createdAt:
			workflow.createdAt instanceof Date
				? workflow.createdAt
				: new Date(workflow.createdAt),
		updatedAt:
			workflow.updatedAt instanceof Date
				? workflow.updatedAt
				: new Date(workflow.updatedAt),
	});
	const setIsLoading = useSetAtom(isLoadingAtom);
	const setIsSaving = useSetAtom(isSavingAtom);
	const setHasUnsavedChanges = useSetAtom(hasUnsavedChangesAtom);
	const setLastSaved = useSetAtom(lastSavedAtom);

	// TRPC client
	const trpc = useTRPC();
	assertWorkflowDefinitionApi(trpc);
	const workflowDefinition = trpc.workflowDefinition;
	const trpcClient = useTRPCClient();

	// TRPC mutations and queries
	const createWorkflowMutation = useMutation({
		...workflowDefinition.create.mutationOptions(),
	});
	const updateWorkflowMutation = useMutation({
		...workflowDefinition.update.mutationOptions(),
	});
	const deleteWorkflowMutation = useMutation({
		...workflowDefinition.delete.mutationOptions(),
	});

	const workflowQuery = useQuery({
		...workflowDefinition.get.queryOptions({ id: workflowId ?? "" }),
		enabled: Boolean(workflowId),
	});

	const workflowListQuery = useQuery({
		...workflowDefinition.list.queryOptions({ projectId: projectId ?? "" }),
		enabled: Boolean(projectId),
	});

	// Load workflow from database
	const loadWorkflow = useCallback(
		async (id: string): Promise<void> => {
			setIsLoading(true);
			try {
				const workflow = await trpcClient.workflowDefinition.get.query({ id });
				setWorkflowData(normalizeWorkflow(workflow));
			} catch (error) {
				console.error("Failed to load workflow:", error);
				throw error;
			} finally {
				setIsLoading(false);
			}
		},
		[trpcClient, setIsLoading, setWorkflowData],
	);

	// Save current workflow
	const saveWorkflow = useCallback(async (): Promise<void> => {
		if (!workflowId || !projectId) {
			throw new Error("No workflow ID or project ID set");
		}

		setIsSaving(true);
		try {
			// Serialize the workflow data for database storage
			const { nodes: serializedNodes, edges: serializedEdges } =
				serializeWorkflow(nodes, edges);

			await updateWorkflowMutation.mutateAsync({
				id: workflowId,
				nodes: serializedNodes,
				edges: serializedEdges,
			});

			setHasUnsavedChanges(false);
			setLastSaved(new Date());

			// Invalidate queries to refresh data
			await workflowQuery.refetch();
			await workflowListQuery.refetch();
		} catch (error) {
			console.error("Failed to save workflow:", error);
			throw error;
		} finally {
			setIsSaving(false);
		}
	}, [
		workflowId,
		projectId,
		nodes,
		edges,
		updateWorkflowMutation,
		setIsSaving,
		setHasUnsavedChanges,
		setLastSaved,
		workflowQuery,
		workflowListQuery,
	]);

	// Create new workflow
	const createWorkflow = useCallback(
		async (name: string, description?: string): Promise<WorkflowDefinition> => {
			if (!projectId) {
				throw new Error("No project ID set");
			}

			setIsSaving(true);
			try {
				// Serialize the workflow data for database storage
				const { nodes: serializedNodes, edges: serializedEdges } =
					serializeWorkflow(nodes, edges);

				const workflow = await createWorkflowMutation.mutateAsync({
					name,
					description,
					projectId,
					nodes: serializedNodes,
					edges: serializedEdges,
				});
				const normalized = normalizeWorkflow(workflow);

				setWorkflowId(normalized.id);
				setHasUnsavedChanges(false);
				setLastSaved(new Date());

				// Invalidate list query to show new workflow
				await workflowListQuery.refetch();

				return normalized;
			} catch (error) {
				console.error("Failed to create workflow:", error);
				throw error;
			} finally {
				setIsSaving(false);
			}
		},
		[
			projectId,
			nodes,
			edges,
			createWorkflowMutation,
			setWorkflowId,
			setIsSaving,
			setHasUnsavedChanges,
			setLastSaved,
			workflowListQuery,
		],
	);

	// Delete workflow
	const deleteWorkflow = useCallback(
		async (id: string): Promise<void> => {
			try {
				await deleteWorkflowMutation.mutateAsync({ id });

				// If we deleted the current workflow, clear state
				if (id === workflowId) {
					setWorkflowId(null);
					setHasUnsavedChanges(false);
					setLastSaved(null);
				}

				// Invalidate list query to remove deleted workflow
				await workflowListQuery.refetch();
			} catch (error) {
				console.error("Failed to delete workflow:", error);
				throw error;
			}
		},
		[
			deleteWorkflowMutation,
			workflowId,
			setWorkflowId,
			setHasUnsavedChanges,
			setLastSaved,
			workflowListQuery,
		],
	);

	// Auto-save functionality
	useEffect(() => {
		if (!hasUnsavedChanges || !workflowId || isSaving) return;

		const timeoutId = setTimeout(() => {
			saveWorkflow().catch(console.error);
		}, 2000); // Auto-save after 2 seconds of inactivity

		return () => clearTimeout(timeoutId);
	}, [hasUnsavedChanges, workflowId, isSaving, saveWorkflow]);

	return {
		// State
		workflowId,
		projectId,
		hasUnsavedChanges,
		isLoading,
		isSaving,
		lastSaved,

		// Data
		workflows: workflowListQuery.data
			? (workflowListQuery.data as any[]).map(normalizeWorkflow)
			: [],
		currentWorkflow: workflowQuery.data
			? normalizeWorkflow(workflowQuery.data as any)
			: undefined,

		// Actions
		loadWorkflow,
		saveWorkflow,
		createWorkflow,
		deleteWorkflow,
		setProjectId,

		// Query states
		isLoadingWorkflows: workflowListQuery.isLoading,
		isLoadingCurrentWorkflow: workflowQuery.isLoading,
	};
}
