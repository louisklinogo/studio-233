"use client";

import { upload } from "@vercel/blob/client";
import { AnimatePresence, motion } from "framer-motion";
import { History, Loader2, Play, Settings } from "lucide-react";
import React, { useEffect, useState } from "react";
import { startBatchProcessing } from "@/app/actions/batch-actions";
import { AssetLibrary } from "@/components/studio+/AssetLibrary";
import { CompletionView } from "@/components/studio+/CompletionView";
import { ConfigurationPanel } from "@/components/studio+/ConfigurationPanel";
import { StudioChatPanel } from "@/components/studio+/chat/StudioChatPanel";
import { EmptyStateInstructions } from "@/components/studio+/EmptyStateInstructions";
import { FloatingToolbar } from "@/components/studio+/FloatingToolbar";
import { InputQueue } from "@/components/studio+/InputQueue";
import { LiveProgressView } from "@/components/studio+/LiveProgressView";
import {
	StudioHeader,
	StudioLayout,
	StudioSidebar,
} from "@/components/studio+/StudioLayout";
import {
	EmptyWorkbenchState,
	WorkbenchStage,
} from "@/components/studio+/WorkbenchStage";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { BatchJob } from "@/lib/batch-store";
import { type BatchUpload, canvasStorage } from "@/lib/storage";
import { cn } from "@/lib/utils";
import type { UploadedAsset, ViewState } from "@/types/studio";

const TERMINAL_BATCH_STATES: BatchJob["status"][] = [
	"completed",
	"failed",
	"canceled",
];

const isTerminalStatus = (status: BatchJob["status"]) =>
	TERMINAL_BATCH_STATES.includes(status);

interface FileUploadStatus {
	progress: number;
	status: "idle" | "uploading" | "uploaded" | "error";
}

import { OperatorHeader } from "@/components/ui/operator/OperatorHeader";

type RightPaneView = "empty" | "configure" | "processing" | "complete";
type WorkflowType = "mannequin" | "style" | "logo" | "custom";

export default function StudioPage() {
	// View state management
	const [viewState, setViewState] = useState<ViewState>("staging");
	const [uploadedAssets, setUploadedAssets] = useState<UploadedAsset[]>([]);

	// Staging state (InputQueue)
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
	const fileInputRef = React.useRef<HTMLInputElement>(null);

	// Panel Visibility State
	const [showLeftPanel, setShowLeftPanel] = useState(true);
	const [showRightPanel, setShowRightPanel] = useState(true);

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

	// Handle additional asset uploads from library
	const handleAssetsUploaded = (newAssets: UploadedAsset[]) => {
		setUploadedAssets((prev) => [...prev, ...newAssets]);
		toast({
			title: "Upload Complete",
			description: `${newAssets.length} assets added to library`,
		});
	};

	// Persist assets to localStorage
	useEffect(() => {
		if (uploadedAssets.length > 0) {
			localStorage.setItem("studio_assets", JSON.stringify(uploadedAssets));
			localStorage.setItem("studio_view_state", viewState);
		}
	}, [uploadedAssets, viewState]);

	// Restore assets from localStorage on mount
	useEffect(() => {
		const savedAssets = localStorage.getItem("studio_assets");
		const savedViewState = localStorage.getItem("studio_view_state");

		if (savedAssets) {
			try {
				const parsed = JSON.parse(savedAssets);
				setUploadedAssets(parsed);
				if (savedViewState === "library") {
					setViewState("library");
				}
			} catch (error) {
				console.error("Failed to restore assets:", error);
				localStorage.removeItem("studio_assets");
			}
		}
	}, []);

	// Dev-only: Clear library
	const handleClearLibrary = () => {
		localStorage.removeItem("studio_assets");
		localStorage.removeItem("studio_view_state");
		setUploadedAssets([]);
		setViewState("staging");
		toast({
			title: "Library Cleared",
			description: "All assets removed (dev mode)",
		});
	};

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
					const allDone = data.jobs.every((j: BatchJob) =>
						isTerminalStatus(j.status),
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

			// Create UploadedAsset objects
			const newAssets: UploadedAsset[] = uploadedUrls.map((url, index) => ({
				id: `asset-${Date.now()}-${index}`,
				blobUrl: url,
				filename: files[index].name,
				fileType: files[index].type,
				fileSize: files[index].size,
				uploadedAt: Date.now(),
				status: "uploaded" as const,
			}));

			// Transition to library state
			setUploadedAssets(newAssets);
			setViewState("library");

			// Clear staging area
			setFiles([]);
			setUploadProgress(0);
			setIsUploading(false);
			setFileUploadStatuses(new Map());

			// Clear IndexedDB batch files
			await canvasStorage.clearBatchFiles();

			// Show success toast
			toast({
				title: "Upload Complete",
				description: `${newAssets.length} assets uploaded successfully`,
			});
		} catch (error: any) {
			console.error(error);
			setIsUploading(false);
			setIsProcessing(false);
			toast({
				title: "Error",
				description: error.message || "Failed to upload files.",
				variant: "destructive",
				duration: 5000,
			});
		}
	};

	// Calculate pipeline steps
	const anyVerifying = jobStatuses.some((j) => j.status === "verifying");
	const processActive =
		isProcessing || jobStatuses.some((j) => j.status === "processing");
	const allTerminal =
		jobStatuses.length > 0 &&
		jobStatuses.every((j) => isTerminalStatus(j.status));
	const hasTerminal = jobStatuses.some((j) => isTerminalStatus(j.status));

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
			status: processActive
				? "processing"
				: hasTerminal
					? "completed"
					: jobStatuses.length > 0
						? "processing"
						: "pending",
		},
		{
			id: "verify",
			label: "Verification",
			status: anyVerifying
				? "processing"
				: allTerminal
					? "completed"
					: "pending",
		},
		{
			id: "complete",
			label: "Done",
			status: allTerminal ? "completed" : "pending",
		},
	] as const;

	return (
		<div className="h-screen w-screen overflow-hidden bg-neutral-50 dark:bg-[#050505] relative flex flex-col">
			<OperatorHeader mode="studio" title="Batch_Pipeline_Alpha" />

			<div className="flex-1 flex relative pt-20 px-6 pb-6 gap-6 overflow-hidden">
				<AnimatePresence mode="wait">
					{showLeftPanel && (
						<motion.div
							initial={{ width: 0, opacity: 0, x: -20 }}
							animate={{ width: 400, opacity: 1, x: 0 }}
							exit={{ width: 0, opacity: 0, x: -20 }}
							transition={{ type: "spring", stiffness: 300, damping: 30 }}
							className="h-full z-10"
						>
							{/* Replaced StudioSidebar with Operator Panel Container */}
							<div className="w-full h-full bg-[#f4f4f0] dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 flex flex-col shadow-xl">
								{/* Dev-only: Clear Library Button */}
								{process.env.NODE_ENV === "development" &&
									viewState === "library" && (
										<div className="absolute top-2 right-2 z-50">
											<button
												onClick={handleClearLibrary}
												className="px-2 py-1 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded border border-red-500/20 transition-colors"
												title="Clear library (dev only)"
											>
												🗑️ Clear
											</button>
										</div>
									)}

								<AnimatePresence mode="wait">
									{viewState === "staging" ? (
										<motion.div
											key="staging"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											transition={{ duration: 0.3 }}
											className="h-full"
										>
											<InputQueue
												files={files}
												onFilesSelected={handleFilesSelected}
												onRemoveFile={handleRemoveFile}
												onRemoveFiles={handleRemoveFiles}
												onUpload={handleUpload}
												isUploading={isUploading}
												uploadProgress={uploadProgress}
												fileUploadStatuses={fileUploadStatuses}
											/>
										</motion.div>
									) : (
										<motion.div
											key="library"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											transition={{ duration: 0.3 }}
											className="h-full"
										>
											<AssetLibrary
												assets={uploadedAssets}
												onUploadMore={() => {
													// Fallback - not used anymore since we handle it internally
												}}
												onAssetsUploaded={handleAssetsUploaded}
											/>
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				<div className="flex-1 flex flex-col min-w-0 relative bg-[#e5e5e5] dark:bg-[#111] border border-neutral-200 dark:border-neutral-800 shadow-inner">
					{/* Central Workbench */}
					<WorkbenchStage>
						<EmptyWorkbenchState />
					</WorkbenchStage>
				</div>

				<AnimatePresence mode="wait">
					{showRightPanel && (
						<motion.div
							initial={{ width: 0, opacity: 0, x: 20 }}
							animate={{ width: 360, opacity: 1, x: 0 }}
							exit={{ width: 0, opacity: 0, x: 20 }}
							transition={{ type: "spring", stiffness: 300, damping: 30 }}
							className="h-full z-10"
						>
							<div className="w-full h-full bg-[#f4f4f0] dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 flex flex-col shadow-xl">
								<StudioChatPanel
									filesCount={
										viewState === "staging"
											? files.length
											: uploadedAssets.length
									}
									className="w-full h-full shadow-none border-none"
								/>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Global File Input */}
			<input
				type="file"
				ref={fileInputRef}
				className="hidden"
				multiple
				accept="image/png, image/jpeg, image/webp"
				onChange={(e) => {
					if (e.target.files && e.target.files.length > 0) {
						handleFilesSelected(Array.from(e.target.files));
						// Reset value to allow selecting same files again
						e.target.value = "";
					}
				}}
			/>
		</div>
	);
}
