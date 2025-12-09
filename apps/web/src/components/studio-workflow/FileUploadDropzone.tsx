"use client";

import {
	AlertCircle,
	CheckCircle,
	FileImage,
	Loader2,
	Upload,
	X,
} from "lucide-react";
import React, { useCallback, useState } from "react";
import {
	type UploadProgress,
	uploadFiles,
} from "@/lib/studio-workflow/file-manager";
import type { MediaFile } from "@/lib/studio-workflow/plugins/types";

interface FileUploadDropzoneProps {
	onFilesUploaded: (files: MediaFile[]) => void;
	acceptedTypes?: string[];
	maxFiles?: number;
	maxSizePerFile?: number; // in MB
	className?: string;
}

export function FileUploadDropzone({
	onFilesUploaded,
	acceptedTypes = ["image/*"],
	maxFiles = 10,
	maxSizePerFile = 50,
	className = "",
}: FileUploadDropzoneProps) {
	const [isDragging, setIsDragging] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
	const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>([]);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	}, []);

	const handleDrop = useCallback(async (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);

		const files = Array.from(e.dataTransfer.files);
		await processFiles(files);
	}, []);

	const handleFileSelect = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const files = Array.from(e.target.files || []);
			await processFiles(files);
		},
		[],
	);

	const processFiles = async (files: File[]) => {
		// Filter and validate files
		const validFiles = files.filter((file) => {
			// Check file type
			const isValidType = acceptedTypes.some((type) => {
				if (type.endsWith("/*")) {
					return file.type.startsWith(type.replace("/*", "/"));
				}
				return file.type === type;
			});

			// Check file size
			const isValidSize = file.size <= maxSizePerFile * 1024 * 1024;

			return isValidType && isValidSize;
		});

		// Limit number of files
		const filesToUpload = validFiles.slice(0, maxFiles);

		if (filesToUpload.length === 0) {
			return;
		}

		setIsUploading(true);
		setUploadProgress([]);

		try {
			const result = await uploadFiles(filesToUpload, setUploadProgress);

			if (result.files.length > 0) {
				setUploadedFiles((prev) => [...prev, ...result.files]);
				onFilesUploaded(result.files);
			}
		} catch (error) {
			console.error("Upload failed:", error);
		} finally {
			setIsUploading(false);
		}
	};

	const removeFile = (fileId: string) => {
		setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
	};

	const clearAll = () => {
		setUploadedFiles([]);
		setUploadProgress([]);
	};

	return (
		<div className={`space-y-3 ${className}`}>
			{/* Dropzone */}
			<div
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				className={`
					relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
					transition-colors duration-200
					${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
					${isUploading ? "pointer-events-none opacity-60" : ""}
				`}
			>
				<input
					type="file"
					multiple
					accept={acceptedTypes.join(",")}
					onChange={handleFileSelect}
					className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
					disabled={isUploading}
				/>

				{isUploading ? (
					<div className="flex flex-col items-center">
						<Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
						<p className="text-sm text-gray-600">Uploading files...</p>
					</div>
				) : (
					<div className="flex flex-col items-center">
						<Upload className="w-8 h-8 text-gray-400 mb-2" />
						<p className="text-sm font-medium text-gray-700">
							Drop files here or click to browse
						</p>
						<p className="text-xs text-gray-500 mt-1">
							Max {maxFiles} files, up to {maxSizePerFile}MB each
						</p>
					</div>
				)}
			</div>

			{/* Upload Progress */}
			{uploadProgress.length > 0 && isUploading && (
				<div className="space-y-2">
					{uploadProgress.map((progress) => (
						<div
							key={progress.fileName}
							className="flex items-center gap-2 text-sm"
						>
							{progress.status === "uploading" && (
								<Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
							)}
							{progress.status === "completed" && (
								<CheckCircle className="w-4 h-4 text-green-500" />
							)}
							{progress.status === "error" && (
								<AlertCircle className="w-4 h-4 text-red-500" />
							)}
							<span className="truncate flex-1">{progress.fileName}</span>
							<span className="text-gray-500">{progress.progress}%</span>
						</div>
					))}
				</div>
			)}

			{/* Uploaded Files List */}
			{uploadedFiles.length > 0 && (
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-gray-700">
							{uploadedFiles.length} file{uploadedFiles.length !== 1 ? "s" : ""}{" "}
							ready
						</span>
						<button
							onClick={clearAll}
							className="text-xs text-red-500 hover:text-red-700"
						>
							Clear all
						</button>
					</div>

					<div className="max-h-32 overflow-y-auto space-y-1">
						{uploadedFiles.map((file) => (
							<div
								key={file.id}
								className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm"
							>
								<FileImage className="w-4 h-4 text-gray-400 flex-shrink-0" />
								<span className="truncate flex-1">{file.name}</span>
								{file.width && file.height && (
									<span className="text-xs text-gray-400">
										{file.width}×{file.height}
									</span>
								)}
								<button
									onClick={() => removeFile(file.id)}
									className="p-1 hover:bg-gray-200 rounded"
								>
									<X className="w-3 h-3 text-gray-500" />
								</button>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
