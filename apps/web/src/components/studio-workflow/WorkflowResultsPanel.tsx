"use client";

import { useAtomValue } from "jotai";
import { Download, Eye, FileImage, Loader2, Package, X } from "lucide-react";
import React, { useState } from "react";
import { outputFilesAtom } from "@/lib/studio-workflow/enhanced-store";
import {
	downloadFile,
	downloadFilesAsZip,
} from "@/lib/studio-workflow/file-manager";
import type { MediaFile } from "@/lib/studio-workflow/plugins/types";

interface WorkflowResultsPanelProps {
	isOpen: boolean;
	onClose: () => void;
}

export function WorkflowResultsPanel({
	isOpen,
	onClose,
}: WorkflowResultsPanelProps) {
	const outputFiles = useAtomValue(outputFilesAtom);
	const [isDownloading, setIsDownloading] = useState(false);
	const [downloadProgress, setDownloadProgress] = useState(0);
	const [downloadStatus, setDownloadStatus] = useState("");
	const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);

	if (!isOpen) return null;

	const handleDownloadAll = async () => {
		if (outputFiles.length === 0) return;

		setIsDownloading(true);
		setDownloadProgress(0);
		setDownloadStatus("Preparing download...");

		try {
			await downloadFilesAsZip(
				outputFiles,
				`workflow-results-${Date.now()}.zip`,
				(progress, status) => {
					setDownloadProgress(progress);
					setDownloadStatus(status);
				},
			);
		} catch (error) {
			console.error("Download failed:", error);
			setDownloadStatus("Download failed");
		} finally {
			setIsDownloading(false);
		}
	};

	const handleDownloadSingle = async (file: MediaFile) => {
		try {
			await downloadFile(file);
		} catch (error) {
			console.error("Download failed:", error);
		}
	};

	return (
		<>
			{/* Results Panel */}
			<div className="fixed right-0 top-0 bottom-0 w-80 bg-white border-l shadow-lg z-50 flex flex-col">
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b">
					<div className="flex items-center gap-2">
						<Package className="w-5 h-5 text-purple-600" />
						<h2 className="font-semibold">Workflow Results</h2>
					</div>
					<button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-4">
					{outputFiles.length === 0 ? (
						<div className="text-center text-gray-500 py-8">
							<Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
							<p>No results yet</p>
							<p className="text-sm">Run the workflow to see results here</p>
						</div>
					) : (
						<div className="space-y-3">
							{/* Summary */}
							<div className="bg-green-50 border border-green-200 rounded-lg p-3">
								<p className="text-sm font-medium text-green-800">
									{outputFiles.length} file{outputFiles.length !== 1 ? "s" : ""}{" "}
									processed
								</p>
							</div>

							{/* File List */}
							<div className="space-y-2">
								{outputFiles.map((file) => (
									<div
										key={file.id}
										className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100"
									>
										{/* Thumbnail */}
										{file.type === "image" && (
											<img
												src={file.url}
												alt={file.name}
												className="w-10 h-10 object-cover rounded"
											/>
										)}
										{file.type !== "image" && (
											<div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
												<FileImage className="w-5 h-5 text-gray-400" />
											</div>
										)}

										{/* File Info */}
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium truncate">
												{file.name}
											</p>
											{file.width && file.height && (
												<p className="text-xs text-gray-500">
													{file.width}×{file.height}
												</p>
											)}
										</div>

										{/* Actions */}
										<div className="flex items-center gap-1">
											<button
												onClick={() => setPreviewFile(file)}
												className="p-1.5 hover:bg-gray-200 rounded"
												title="Preview"
											>
												<Eye className="w-4 h-4 text-gray-600" />
											</button>
											<button
												onClick={() => handleDownloadSingle(file)}
												className="p-1.5 hover:bg-gray-200 rounded"
												title="Download"
											>
												<Download className="w-4 h-4 text-gray-600" />
											</button>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Footer */}
				{outputFiles.length > 0 && (
					<div className="p-4 border-t bg-gray-50">
						<button
							onClick={handleDownloadAll}
							disabled={isDownloading}
							className={`
								w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg
								${
									isDownloading
										? "bg-gray-300 cursor-not-allowed"
										: "bg-purple-600 hover:bg-purple-700 text-white"
								}
							`}
						>
							{isDownloading ? (
								<>
									<Loader2 className="w-4 h-4 animate-spin" />
									<span>
										{downloadStatus} ({downloadProgress}%)
									</span>
								</>
							) : (
								<>
									<Download className="w-4 h-4" />
									<span>Download All as ZIP</span>
								</>
							)}
						</button>
					</div>
				)}
			</div>

			{/* Preview Modal */}
			{previewFile && (
				<div
					className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-8"
					onClick={() => setPreviewFile(null)}
				>
					<div
						className="bg-white rounded-lg max-w-3xl max-h-full overflow-hidden"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-center justify-between p-3 border-b">
							<span className="font-medium">{previewFile.name}</span>
							<button
								onClick={() => setPreviewFile(null)}
								className="p-1 hover:bg-gray-100 rounded"
							>
								<X className="w-5 h-5" />
							</button>
						</div>
						<div className="p-4">
							{previewFile.type === "image" && (
								<img
									src={previewFile.url}
									alt={previewFile.name}
									className="max-w-full max-h-[70vh] object-contain"
								/>
							)}
						</div>
					</div>
				</div>
			)}
		</>
	);
}
