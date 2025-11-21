"use client";

import { upload } from "@vercel/blob/client";
import { History, Loader2, Play, Settings } from "lucide-react";
import React, { useEffect, useState } from "react";
import { startBatchProcessing } from "@/app/actions/batch-actions";
import { InputQueue } from "@/components/studio-workflow/InputQueue";
import { PipelineVisualizer } from "@/components/studio-workflow/PipelineVisualizer";
import { ResultsGrid } from "@/components/studio-workflow/ResultsGrid";
import {
	StudioContent,
	StudioHeader,
	StudioLayout,
	StudioSidebar,
} from "@/components/studio-workflow/StudioLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { BatchJob } from "@/lib/batch-store";

export default function StudioPage() {
	const [isProcessing, setIsProcessing] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [files, setFiles] = useState<File[]>([]);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [activeJobIds, setActiveJobIds] = useState<string[]>([]);
	const [jobs, setJobs] = useState<BatchJob[]>([]);

	const { toast } = useToast();

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
					setJobs(data.jobs);

					// Check if all completed
					const allDone = data.jobs.every(
						(j: BatchJob) => j.status === "completed" || j.status === "failed",
					);
					if (allDone && isProcessing) {
						setIsProcessing(false);
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

	const handleRunBatch = async () => {
		if (files.length === 0) return;

		setIsUploading(true);
		setUploadProgress(0);

		const uploadedUrls: string[] = [];
		let successCount = 0;
		let failCount = 0;

		try {
			// 1. Upload all files to Vercel Blob
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				try {
					const newBlob = await upload(file.name, file, {
						access: "public",
						handleUploadUrl: "/api/upload",
					});

					if (newBlob.url) {
						uploadedUrls.push(newBlob.url);
						successCount++;
					}
				} catch (error) {
					console.error(`Failed to upload ${file.name}:`, error);
					failCount++;
				}

				setUploadProgress(Math.round(((i + 1) / files.length) * 100));
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
		} catch (error: any) {
			console.error(error);
			setIsUploading(false);
			setIsProcessing(false);
			toast({
				title: "Error",
				description: error.message || "Failed to start batch.",
				variant: "destructive",
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
				: jobs.some((j) => j.status === "completed")
					? "completed"
					: "pending",
		},
		{
			id: "verify",
			label: "Verification",
			status: jobs.some((j) => j.status === "verifying")
				? "processing"
				: jobs.every((j) => j.status === "completed") && jobs.length > 0
					? "completed"
					: "pending",
		},
		{
			id: "complete",
			label: "Done",
			status:
				jobs.length > 0 &&
				jobs.every((j) => j.status === "completed" || j.status === "failed")
					? "completed"
					: "pending",
		},
	] as const;

	return (
		<StudioLayout>
			<StudioSidebar>
				<InputQueue
					files={files}
					onFilesSelected={(newFiles) => setFiles([...files, ...newFiles])}
					onRemoveFile={(index) =>
						setFiles(files.filter((_, i) => i !== index))
					}
					isUploading={isUploading}
					uploadProgress={uploadProgress}
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
								Batch Processor
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
							onClick={handleRunBatch}
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
					<ResultsGrid jobs={jobs} isProcessing={isProcessing} />
				</StudioContent>
			</div>
		</StudioLayout>
	);
}
