"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	addInputFilesAtom,
	clearInputFilesAtom,
	createNewWorkflowAtom,
	inputFilesAtom,
	outputFilesAtom,
	projectIdAtom,
} from "@/lib/studio-workflow/enhanced-store";
import type { MediaFile } from "@/lib/studio-workflow/plugins/types";
import type { WorkflowDefinition } from "@/lib/studio-workflow/types";
import { useWorkflowExecution } from "@/lib/studio-workflow/use-workflow-execution";
import { useWorkflowPersistence } from "@/lib/studio-workflow/use-workflow-persistence";
import { TRPCProvider, useTRPC } from "@/trpc/client";
import { FileUploadDropzone } from "./FileUploadDropzone";
import { StudioWorkflowCanvas } from "./StudioWorkflowCanvas";
import { WorkflowResultsPanel } from "./WorkflowResultsPanel";

function getBaseUrl() {
	if (typeof window !== "undefined") return "";
	if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
	return `http://localhost:${process.env.PORT ?? 3000}`;
}

interface EnhancedStudioExperimentsClientProps {
	projectId: string;
	workflowId?: string;
}

function StudioExperimentsInner({
	projectId,
	workflowId: initialWorkflowId,
}: EnhancedStudioExperimentsClientProps) {
	const setProjectId = useSetAtom(projectIdAtom);
	const createNewWorkflow = useSetAtom(createNewWorkflowAtom);
	const addInputFiles = useSetAtom(addInputFilesAtom);
	const clearInputFiles = useSetAtom(clearInputFilesAtom);
	const inputFiles = useAtomValue(inputFilesAtom);
	const outputFiles = useAtomValue(outputFilesAtom);
	const [workflowName, setWorkflowName] = useState("Untitled Workflow");
	const [showResults, setShowResults] = useState(false);

	const {
		workflowId,
		hasUnsavedChanges,
		isLoading,
		isSaving,
		workflows,
		loadWorkflow,
		saveWorkflow,
		createWorkflow,
		deleteWorkflow,
	} = useWorkflowPersistence();

	const {
		isRunning,
		executeWorkflow,
		cancelExecution,
		executionState,
		summary,
	} = useWorkflowExecution();

	// Initialize project and workflow
	useEffect(() => {
		setProjectId(projectId);

		if (initialWorkflowId) {
			loadWorkflow(initialWorkflowId).catch((error: unknown) => {
				console.error("Failed to load initial workflow:", error);
				toast.error("Failed to load workflow");
			});
			return;
		}

		createNewWorkflow(projectId);
	}, [
		createNewWorkflow,
		initialWorkflowId,
		loadWorkflow,
		projectId,
		setProjectId,
	]);

	const handleSave = async () => {
		try {
			if (!workflowId) {
				// Create new workflow
				const workflow = await createWorkflow(
					workflowName,
					"Media batch processing workflow",
				);
				setWorkflowName(workflow.name);
				toast.success("Workflow created successfully");
			} else {
				// Save existing workflow
				await saveWorkflow();
				toast.success("Workflow saved successfully");
			}
		} catch (error) {
			console.error("Failed to save workflow:", error);
			toast.error("Failed to save workflow");
		}
	};

	const handleRun = async () => {
		if (inputFiles.length === 0) {
			toast.error("Please upload files before running the workflow");
			return;
		}

		if (isRunning) {
			// Cancel execution if already running
			cancelExecution();
			toast.info("Workflow execution cancelled");
			return;
		}

		try {
			toast.info(`Starting workflow with ${inputFiles.length} files...`);
			const result = await executeWorkflow();

			if (result.success) {
				toast.success(
					`Workflow completed successfully! Processed ${result.completedNodes.length} nodes in ${result.totalTime}ms`,
				);
				setShowResults(true); // Show results panel
			} else {
				toast.error(
					`Workflow failed: ${result.failedNodes.length} nodes failed`,
				);
			}
		} catch (error: unknown) {
			console.error("Failed to run workflow:", error);
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			toast.error(`Failed to run workflow: ${errorMessage}`);
		}
	};

	const handleFilesUploaded = (files: MediaFile[]) => {
		addInputFiles(files);
		toast.success(
			`${files.length} file${files.length !== 1 ? "s" : ""} uploaded`,
		);
	};

	const handleRename = (newName: string) => {
		setWorkflowName(newName);
	};

	if (isLoading) {
		return (
			<div className="h-full w-full flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p className="text-muted-foreground">Loading workflow...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="h-full w-full flex flex-col">
			{/* Workflow List Panel (if multiple workflows) */}
			{workflows.length > 1 && (
				<div className="border-b bg-muted/30 p-2">
					<div className="flex items-center gap-2">
						<span className="text-sm text-muted-foreground">Workflows:</span>
						<select
							value={workflowId || ""}
							onChange={(e) => {
								if (e.target.value) {
									loadWorkflow(e.target.value);
								}
							}}
							className="text-sm border rounded px-2 py-1"
						>
							<option value="">Select workflow...</option>
							{workflows.map((workflow: WorkflowDefinition) => (
								<option key={workflow.id} value={workflow.id}>
									{workflow.name}
								</option>
							))}
						</select>
						<button
							onClick={() => createNewWorkflow(projectId)}
							className="text-sm bg-primary text-primary-foreground px-2 py-1 rounded hover:bg-primary/90"
						>
							New Workflow
						</button>
					</div>
				</div>
			)}

			{/* Main Content Area */}
			<div className="flex-1 flex">
				{/* Left Panel - File Upload */}
				<div className="w-64 border-r bg-gray-50 p-4 flex flex-col gap-4 overflow-y-auto">
					<div>
						<h3 className="text-sm font-semibold mb-2">Input Files</h3>
						<FileUploadDropzone
							onFilesUploaded={handleFilesUploaded}
							acceptedTypes={["image/*"]}
							maxFiles={20}
							maxSizePerFile={50}
						/>
					</div>

					{/* Input files count */}
					{inputFiles.length > 0 && (
						<div className="flex items-center justify-between text-sm">
							<span className="text-green-600 font-medium">
								{inputFiles.length} file{inputFiles.length !== 1 ? "s" : ""}{" "}
								ready
							</span>
							<button
								onClick={() => clearInputFiles()}
								className="text-red-500 text-xs hover:underline"
							>
								Clear all
							</button>
						</div>
					)}

					{/* Results button */}
					{outputFiles.length > 0 && (
						<button
							onClick={() => setShowResults(true)}
							className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
						>
							<span>View Results ({outputFiles.length})</span>
						</button>
					)}
				</div>

				{/* Main Canvas */}
				<div className="flex-1">
					<StudioWorkflowCanvas
						onRun={handleRun}
						onSave={handleSave}
						isRunning={isRunning}
						isSaving={isSaving}
						hasUnsavedChanges={hasUnsavedChanges}
						workflowName={workflowName}
						onRename={handleRename}
					/>
				</div>
			</div>

			{/* Results Panel */}
			<WorkflowResultsPanel
				isOpen={showResults}
				onClose={() => setShowResults(false)}
			/>

			{/* Status Bar */}
			<div className="border-t bg-muted/30 px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
				<div className="flex items-center gap-4">
					<span>Project: {projectId}</span>
					{workflowId && <span>Workflow: {workflowId}</span>}
				</div>
				<div className="flex items-center gap-2">
					{isRunning && (
						<span className="text-green-600">
							Running...{" "}
							{executionState.currentNode && `(${executionState.currentNode})`}
						</span>
					)}
					{summary && !isRunning && (
						<span
							className={summary.success ? "text-green-600" : "text-red-600"}
						>
							Last run: {summary.success ? "Success" : "Failed"}(
							{summary.completedNodes}/{summary.totalNodes} nodes,{" "}
							{summary.totalTime}ms)
						</span>
					)}
					{hasUnsavedChanges && (
						<span className="text-amber-600">Unsaved changes</span>
					)}
					{isSaving && <span className="text-blue-600">Saving...</span>}
				</div>
			</div>
		</div>
	);
}

export function EnhancedStudioExperimentsClient(
	props: EnhancedStudioExperimentsClientProps,
) {
	// Use existing TRPC provider context
	return <StudioExperimentsInner {...props} />;
}
