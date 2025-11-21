"use client";

import { upload } from "@vercel/blob/client";
import { History, Loader2, Play, Settings } from "lucide-react";
import React, { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { startBatchProcessing } from "@/app/actions/batch-actions";
import { InputQueue } from "@/components/studio+/InputQueue";
import { EmptyStateInstructions } from "@/components/studio+/EmptyStateInstructions";
import { ConfigurationPanel } from "@/components/studio+/ConfigurationPanel";
import { LiveProgressView } from "@/components/studio+/LiveProgressView";
import { CompletionView } from "@/components/studio+/CompletionView";
import { PipelineVisualizer } from "@/components/studio+/PipelineVisualizer";
import { ResultsGrid } from "@/components/studio+/ResultsGrid";
import {
	StudioContent,
	StudioHeader,
	StudioLayout,
	StudioSidebar,
} from "@/components/studio+/StudioLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { BatchJob } from "@/lib/batch-store";
import { canvasStorage, type BatchUpload } from "@/lib/storage";

interface FileUploadStatus {
	progress: number;
	status: "idle" | "uploading" | "uploaded" | "error";
}

type RightPaneView = "empty" | "configure" | "processing" | "complete";
type WorkflowType = "mannequin" | "style" | "logo" | "custom";

export default function StudioPage() {
	const [files, setFiles] = useState<File[]>([]);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isUploading, setIsUploading] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const [activeJobIds, setActiveJobIds] = useState<string[]>([]);
	const [jobStatuses, setJobStatuses] = useState<BatchJob[]>([]);
	const [fileUploadStatuses, setFileUploadStatuses] = useState<
		Map<string, FileUploadStatus>
	>(new Map());

	// Right Pane State
	const [rightPaneView, setRightPaneView] = useState<RightPaneView>("empty");
	const [workflowType, setWorkflowType] = useState<WorkflowType>("mannequin");
	const [referenceImage, setReferenceImage] = useState<File | null>(null);
	const [customPrompt, setCustomPrompt] = useState("");

	const { toast } = useToast();

	// Load saved files from IndexedDB on mount
	useEffect(() => {
		const loadSavedFiles = async () => {
			const savedBatchFiles = await canvasStorage.getAllBatchFiles();
			if (savedBatchFiles.length > 0) {
				// Convert BatchUpload to File objects
				const loadedFiles = savedBatchFiles.map((batchFile) => {
					// Convert data URL back to File
					const byteString = atob(batchFile.dataUrl.split(",")[1]);
					const ab = new ArrayBuffer(byteString.length);
					const ia = new Uint8Array(ab);
					for (let i = 0; i < byteString.length; i++) {
						ia[i] = byteString.charCodeAt(i);
					}
					const blob = new Blob([ab], { type: batchFile.fileType });
					return new File([blob], batchFile.fileName, {
						type: batchFile.fileType,
					});
				});
				setFiles(loadedFiles);
				setRightPaneView("configure");
			}
		};
		loadSavedFiles();
	}, []);

	// Polling logic
	useEffect(() => {
		if (activeJobIds.length === 0) return;

		const fetchStatus = async () => {
			try {
				const res = await fetch(
					`/api/batch/status?ids=${activeJobIds.join(",")}`,
				);
				if (res.ok) {
					const data = await res.json();
					setJobStatuses(data.jobs);

					// Check if all completed
					const allDone = data.jobs.every(
						(j: BatchJob) => j.status === "completed" || j.status === "failed",
					);
					if (allDone && isProcessing) {
						setIsProcessing(false);
						setRightPaneView("complete");
						toast({
							title: "Batch Complete",
							description: "All items have been processed.",
						});
					}
				}
			} catch (e) {
				console.error("Polling error", e);
			}
		};

		// Poll every 2 seconds
		const interval = setInterval(fetchStatus, 2000);

		// Initial fetch
		fetchStatus();

		return () => clearInterval(interval);
	}, [activeJobIds, isProcessing, toast]);

	const handleFilesSelected = async (newFiles: File[]) => {
		setFiles((prevFiles) => [...prevFiles, ...newFiles]);
		const newStatuses = new Map(fileUploadStatuses);
		newFiles.forEach((file) => {
			newStatuses.set(file.name, { progress: 0, status: "idle" });
		});
		setFileUploadStatuses(newStatuses);

		// Save to IndexedDB immediately
		for (const file of newFiles) {
			const reader = new FileReader();
			reader.onload = async (e) => {
				if (e.target?.result) {
					await canvasStorage.saveBatchFile(
						e.target.result as string,
						file.name,
						file.type,
						file.size,
					);
				}
			};
			reader.readAsDataURL(file);
		}

		// Transition to configure view
		if (rightPaneView === "empty") {
			setRightPaneView("configure");
		}
	};

	const handleRemoveFile = async (index: number) => {
		const fileToRemove = files[index];
		setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
		setFileUploadStatuses((prevStatuses) => {
			const newStatuses = new Map(prevStatuses);
			if (fileToRemove) {
				newStatuses.delete(fileToRemove.name);
			}
			return newStatuses;
		});

		// Remove from IndexedDB
		if (fileToRemove) {
			const savedFiles = await canvasStorage.getAllBatchFiles();
			const matchingFile = savedFiles.find(
				(f) => f.fileName === fileToRemove.name,
			);
			if (matchingFile) {
				await canvasStorage.deleteBatchFile(matchingFile.id);
			}
		}

		// Check if we should transition back to empty view
		if (files.length === 1) {
			// Will be 0 after removal
			setRightPaneView("empty");
		}
	};

	const handleRemoveFiles = async (indices: number[]) => {
		const indicesSet = new Set(indices);
		const filesToRemove = files.filter((_, i) => indicesSet.has(i));

		// Update UI state immediately
		setFiles((prevFiles) => prevFiles.filter((_, i) => !indicesSet.has(i)));
		setFileUploadStatuses((prevStatuses) => {
			const newStatuses = new Map(prevStatuses);
			filesToRemove.forEach((file) => {
				newStatuses.delete(file.name);
			});
			return newStatuses;
		});

		// Remove from IndexedDB
		if (filesToRemove.length > 0) {
			const savedFiles = await canvasStorage.getAllBatchFiles();
			for (const fileToRemove of filesToRemove) {
				const matchingFile = savedFiles.find(
					(f) => f.fileName === fileToRemove.name,
				);
				if (matchingFile) {
					await canvasStorage.deleteBatchFile(matchingFile.id);
				}
			}
		}

		// Check if we should transition back to empty view
		if (files.length === filesToRemove.length) {
			setRightPaneView("empty");
		}
	};

	const handleUpload = async () => {
		if (files.length === 0) return;

		setIsUploading(true);
		setUploadProgress(0);

		// Initialize all files as idle
		const initialStatuses = new Map<string, FileUploadStatus>();
		files.forEach((file) => {
			initialStatuses.set(file.name, { progress: 0, status: "idle" });
		});
		setFileUploadStatuses(initialStatuses);

		const uploadedUrls: string[] = [];
		let completedCount = 0;
		let successCount = 0;
		let failCount = 0;

		// Concurrency helper
		const CONCURRENCY_LIMIT = 3;
		const queue = [...files];
		const activePromises: Promise<void>[] = [];

		const updateGlobalProgress = () => {
			const total = files.length;
			if (total === 0) return;
			const percent = Math.round((completedCount / total) * 100);
			setUploadProgress(percent);
		};

		const processFile = async (file: File) => {
			try {
				// Set status to uploading
				setFileUploadStatuses((prev) => {
					const newMap = new Map(prev);
					newMap.set(file.name, { progress: 0, status: "uploading" });
					return newMap;
				});

				const newBlob = await upload(file.name, file, {
					access: "public",
					handleUploadUrl: "/api/upload",
					onUploadProgress: (progressEvent) => {
						setFileUploadStatuses((prev) => {
							const newMap = new Map(prev);
							newMap.set(file.name, {
								progress: progressEvent.percentage,
								status: "uploading",
							});
							return newMap;
						});
					},
				});

				if (newBlob.url) {
					uploadedUrls.push(newBlob.url);
					successCount++;

					// Mark as uploaded
					setFileUploadStatuses((prev) => {
						const newMap = new Map(prev);
						newMap.set(file.name, { progress: 100, status: "uploaded" });
						return newMap;
					});
				}
			} catch (error) {
				console.error(`Failed to upload ${file.name}:`, error);
				failCount++;

				// Mark as error
				setFileUploadStatuses((prev) => {
					const newMap = new Map(prev);
					newMap.set(file.name, { progress: 0, status: "error" });
					return newMap;
				});
			} finally {
				completedCount++;
				updateGlobalProgress();
			}
		};

		try {
			// Process queue with concurrency limit
			while (queue.length > 0 || activePromises.length > 0) {
				while (queue.length > 0 && activePromises.length < CONCURRENCY_LIMIT) {
					const file = queue.shift();
					if (file) {
						const p = processFile(file).then(() => {
							activePromises.splice(activePromises.indexOf(p), 1);
						});
						activePromises.push(p);
					}
				}
				if (activePromises.length > 0) {
					await Promise.race(activePromises);
				}
			}

			if (uploadedUrls.length === 0) {
				throw new Error("No files were successfully uploaded.");
			}

			// 2. Trigger Batch Processing
			setIsProcessing(true);
			const result = await startBatchProcessing(uploadedUrls);

			if (result.jobIds) {
				setActiveJobIds(result.jobIds);
				toast({
					title: "Batch Started",
					description: `${successCount} items queued. Monitoring progress...`,
				});
			}

			// Reset upload state but keep processing state
			setFiles([]);
			setUploadProgress(0);
			setIsUploading(false);
			setFileUploadStatuses(new Map()); // Clear file upload statuses

			// Clear IndexedDB batch files
			await canvasStorage.clearBatchFiles();

			// Transition to processing view
			setRightPaneView("processing");
		} catch (error: any) {
			console.error(error);
			setIsUploading(false);
			setIsProcessing(false);
			toast({
				title: "Error",
				description: error.message || "Failed to start batch.",
				variant: "destructive",
				duration: 5000,
			});
		}
	};

	// Calculate pipeline steps
	const steps = [
		{
			id: "upload",
			label: "Upload",
			status: isUploading
				? "processing"
				: activeJobIds.length > 0
					? "completed"
					: "pending",
		},
		{
			id: "process",
			label: "Processing",
			status: isProcessing
				? "processing"
				: jobStatuses.some((j) => j.status === "completed")
					? "completed"
					: "pending",
		},
		{
			id: "verify",
			label: "Verification",
			status: jobStatuses.some((j) => j.status === "verifying")
				? "processing"
				: jobStatuses.every((j) => j.status === "completed") &&
					jobStatuses.length > 0
					? "completed"
					: "pending",
		},
		{
			id: "complete",
			label: "Done",
			status:
				jobStatuses.length > 0 &&
					jobStatuses.every(
						(j) => j.status === "completed" || j.status === "failed",
					)
					? "completed"
					: "pending",
		},
	] as const;

	return (
		<StudioLayout>
			<StudioSidebar>
				<InputQueue
					files={files}
					onFilesSelected={handleFilesSelected}
					onRemoveFile={handleRemoveFile}
					onRemoveFiles={handleRemoveFiles}
					isUploading={isUploading}
					uploadProgress={uploadProgress}
					fileUploadStatuses={fileUploadStatuses}
				/>
			</StudioSidebar>

			<div className="flex-1 flex flex-col min-w-0">
				<StudioHeader>
					<div className="flex items-center gap-2">
						<div className="p-2 bg-primary/10 rounded-md">
							<History className="w-5 h-5 text-primary" />
						</div>
						<div>
							<h1 className="text-lg font-bold leading-none">
								Studio+ Workflow
							</h1>
							<p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
								Batch Settings
							</p>
						</div>
					</div>

					<div className="flex-1 flex justify-center">
						<PipelineVisualizer steps={steps} />
					</div>

					<div className="flex items-center gap-2">
						<Button variant="ghost" size="sm">
							<Settings className="w-4 h-4" />
						</Button>
						<Button
							size="sm"
							onClick={handleUpload}
							disabled={isProcessing || isUploading || files.length === 0}
							className="min-w-[120px]"
						>
							{isUploading ? (
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
							) : (
								<Play className="w-4 h-4 mr-2" />
							)}
							{isUploading
								? `Uploading...`
								: isProcessing
									? "Processing..."
									: "Run Batch"}
						</Button>
					</div>
				</StudioHeader>

				<StudioContent>
					<AnimatePresence mode="wait">
						{rightPaneView === "empty" && (
							<EmptyStateInstructions key="empty" />
						)}

						{rightPaneView === "configure" && (
							<ConfigurationPanel
								key="configure"
								filesCount={files.length}
								workflowType={workflowType}
								onWorkflowChange={setWorkflowType}
								referenceImage={referenceImage}
								onReferenceChange={setReferenceImage}
								customPrompt={customPrompt}
								onPromptChange={setCustomPrompt}
								onStartBatch={handleUpload}
								onBack={() => {
									setFiles([]);
									canvasStorage.clearBatchFiles();
									setRightPaneView("empty");
								}}
							/>
						)}

						{rightPaneView === "processing" && (
							<LiveProgressView
								key="processing"
								jobs={jobStatuses.map((job) => ({
									id: job.id,
									originalUrl: job.originalUrl,
									resultUrl: job.resultUrl,
									status: job.status,
									attempt: job.attempt,
									error: job.error,
								}))}
								isProcessing={isProcessing}
								onImageClick={(jobId) => {
									// TODO: Implement image detail view
									console.log("Image clicked:", jobId);
								}}
							/>
						)}

						{rightPaneView === "complete" && (
							<CompletionView
								key="complete"
								jobs={jobStatuses.map((job) => ({
									id: job.id,
									originalUrl: job.originalUrl,
									resultUrl: job.resultUrl,
									status: job.status,
									error: job.error,
								}))}
								onDownloadAll={() => {
									// TODO: Implement download all
									console.log("Download all");
								}}
								onRetryFailed={() => {
									// TODO: Implement retry failed
									console.log("Retry failed");
								}}
								onNewBatch={() => {
									setJobStatuses([]);
									setActiveJobIds([]);
									setRightPaneView("empty");
								}}
								onImageClick={(jobId) => {
									// TODO: Implement image detail view
									console.log("Image clicked:", jobId);
								}}
							/>
						)}
					</AnimatePresence>
				</StudioContent>
			</div>
		</StudioLayout>
	);
}
