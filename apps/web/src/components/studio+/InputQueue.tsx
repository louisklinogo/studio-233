import { AnimatePresence, motion } from "framer-motion";
import {
	Check,
	ChevronLeft,
	ChevronRight,
	FileImage,
	Loader2,
	Plus,
	Trash2,
	Upload,
	X,
	XCircle,
} from "lucide-react";
import React, { useRef, useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/vectr-components/ui/checkbox";
import { cn } from "@/lib/utils";
import { EmptyStateCardStack } from "./EmptyStateCardStack";
import { StudioBottomToolbar } from "./StudioBottomToolbar";
import { UploadButtonDataSlot } from "./UploadButtonDataSlot";
import { UploadButtonMagnetic } from "./UploadButtonMagnetic";
import { UploadButtonMechanical } from "./UploadButtonMechanical";

interface FileUploadStatus {
	progress: number;
	status: "idle" | "uploading" | "uploaded" | "error";
}

interface InputQueueProps {
	files: File[];
	onFilesSelected: (files: File[]) => void;
	onRemoveFile: (index: number) => void;
	onRemoveFiles?: (indices: number[]) => Promise<void> | void;
	onUpload: () => void;
	isUploading: boolean;
	uploadProgress: number;
	fileUploadStatuses?: Map<string, FileUploadStatus>;
}

// Helper to format file size
function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export function InputQueue({
	files,
	onFilesSelected,
	onRemoveFile,
	onRemoveFiles,
	onUpload,
	isUploading,
	uploadProgress,
	fileUploadStatuses = new Map(),
}: InputQueueProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
		new Set(),
	);
	const [previewPage, setPreviewPage] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

	const PREVIEW_PAGE_SIZE = 6;
	const totalPages = Math.ceil(files.length / PREVIEW_PAGE_SIZE);

	// Keyboard navigation for lightbox
	React.useEffect(() => {
		if (lightboxIndex === null) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowLeft") {
				setLightboxIndex((prev) => (prev! > 0 ? prev! - 1 : files.length - 1));
			} else if (e.key === "ArrowRight") {
				setLightboxIndex((prev) => (prev! < files.length - 1 ? prev! + 1 : 0));
			} else if (e.key === "Escape") {
				setLightboxIndex(null);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [lightboxIndex, files.length]);

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			onFilesSelected(Array.from(e.dataTransfer.files));
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
	};

	const handleDragEnter = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		// Only set to false if we're leaving the drop zone entirely
		if (e.currentTarget === e.target) {
			setIsDragging(false);
		}
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			onFilesSelected(Array.from(e.target.files));
		}
		// Clear the input value to allow re-selecting the same file
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const toggleSelection = (index: number) => {
		const newSelected = new Set(selectedIndices);
		if (newSelected.has(index)) {
			newSelected.delete(index);
		} else {
			newSelected.add(index);
		}
		setSelectedIndices(newSelected);
	};

	const toggleSelectAll = () => {
		if (selectedIndices.size === files.length) {
			setSelectedIndices(new Set());
		} else {
			setSelectedIndices(new Set(files.map((_, i) => i)));
		}
	};

	const removeSelected = () => {
		if (onRemoveFiles) {
			onRemoveFiles(Array.from(selectedIndices));
		} else {
			// Fallback for older behavior if needed, though onRemoveFiles should be provided
			const remainingFiles = files.filter((_, i) => !selectedIndices.has(i));
			onFilesSelected(remainingFiles);
		}
		setSelectedIndices(new Set());
	};

	const isAllSelected =
		files.length > 0 && selectedIndices.size === files.length;
	const isSomeSelected =
		selectedIndices.size > 0 && selectedIndices.size < files.length;

	// Calculate preview files based on current page
	const startIdx = previewPage * PREVIEW_PAGE_SIZE;
	const endIdx = startIdx + PREVIEW_PAGE_SIZE;
	const previewFiles = files.slice(startIdx, endIdx);

	// Reset preview page if files change and current page is out of bounds
	React.useEffect(() => {
		if (previewPage >= totalPages && totalPages > 0) {
			setPreviewPage(totalPages - 1);
		}
	}, [files.length, previewPage, totalPages]);

	return (
		<div className="flex flex-col h-full relative">
			<div
				className={cn(
					"flex-1 flex flex-col relative overflow-hidden transition-colors",
					isDragging && "bg-primary/5",
				)}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onDragEnter={handleDragEnter}
				onDragLeave={handleDragLeave}
			>
				{files.length === 0 ? (
					<EmptyStateCardStack
						isDragging={isDragging}
						onClick={() => fileInputRef.current?.click()}
					/>
				) : (
					<>
						{/* Visual Preview Grid (Small, 2x3) */}
						<div className="p-5 border-b relative">
							<div className="flex items-center justify-end gap-2 mb-2">
								{totalPages > 1 && (
									<div className="flex items-center gap-1">
										<Button
											variant="ghost"
											size="icon"
											className="h-6 w-6"
											onClick={() => setPreviewPage((p) => Math.max(0, p - 1))}
											disabled={previewPage === 0}
										>
											<ChevronLeft className="w-3 h-3" />
										</Button>
										<span className="text-xs text-muted-foreground min-w-[60px] text-center">
											{startIdx + 1}-{Math.min(endIdx, files.length)} of{" "}
											{files.length}
										</span>
										<Button
											variant="ghost"
											size="icon"
											className="h-6 w-6"
											onClick={() =>
												setPreviewPage((p) => Math.min(totalPages - 1, p + 1))
											}
											disabled={previewPage >= totalPages - 1}
										>
											<ChevronRight className="w-3 h-3" />
										</Button>
									</div>
								)}
								<Button
									variant="ghost"
									size="sm"
									onClick={() => fileInputRef.current?.click()}
									aria-label="Add more files"
									className="hover:bg-accent"
								>
									<Plus className="w-4 h-4 mr-1" />
									Add More
								</Button>
								{files.length > 0 && (
									<Button
										variant="outline"
										size="sm"
										onClick={onUpload}
										disabled={isUploading}
										className="ml-2 border-neutral-200 dark:border-neutral-800 hover:border-[#FF4D00] hover:text-[#FF4D00] transition-colors"
									>
										{isUploading ? (
											<Loader2 className="w-3 h-3 animate-spin mr-1" />
										) : (
											<Upload className="w-3 h-3 mr-1" />
										)}
										Upload to Blob
									</Button>
								)}
							</div>
							<div className="grid grid-cols-3 gap-2">
								<AnimatePresence mode="wait">
									{previewFiles.map((file, i) => {
										const globalIndex = startIdx + i;
										return (
											<motion.div
												key={`${file.name}-${globalIndex}`}
												initial={{ opacity: 0, scale: 0.9 }}
												animate={{ opacity: 1, scale: 1 }}
												exit={{ opacity: 0, scale: 0.9 }}
												className="relative aspect-square bg-muted rounded-md overflow-hidden group border border-border cursor-pointer"
												onClick={() => setLightboxIndex(globalIndex)}
											>
												<img
													src={URL.createObjectURL(file)}
													alt={file.name}
													className="w-full h-full object-cover"
												/>
												<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
													<span className="text-white text-[10px] font-medium px-2 text-center truncate">
														{file.name}
													</span>
												</div>
											</motion.div>
										);
									})}
								</AnimatePresence>
							</div>

							{/* Lightbox Overlay */}
							<AnimatePresence>
								{lightboxIndex !== null && (
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
										className="absolute inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center"
										onClick={() => setLightboxIndex(null)}
									>
										<div
											className="relative w-full h-full p-8 flex items-center justify-center"
											onClick={(e) => e.stopPropagation()}
										>
											{/* Close button */}
											<button
												onClick={() => setLightboxIndex(null)}
												className="absolute top-2 right-2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
											>
												<X className="w-4 h-4" />
											</button>

											{/* Previous button */}
											<button
												onClick={() =>
													setLightboxIndex((prev) =>
														prev! > 0 ? prev! - 1 : files.length - 1,
													)
												}
												className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
											>
												<ChevronLeft className="w-5 h-5" />
											</button>

											{/* Image */}
											<div className="max-w-full max-h-full flex items-center justify-center">
												<img
													src={URL.createObjectURL(files[lightboxIndex])}
													alt={files[lightboxIndex].name}
													className="max-w-full max-h-full object-contain rounded-lg"
												/>
											</div>

											{/* Next button */}
											<button
												onClick={() =>
													setLightboxIndex((prev) =>
														prev! < files.length - 1 ? prev! + 1 : 0,
													)
												}
												className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
											>
												<ChevronRight className="w-5 h-5" />
											</button>

											{/* Image info */}
											<div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/50 text-white text-xs">
												{lightboxIndex + 1} / {files.length}
											</div>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>

						{/* File Management Table */}
						{/* File Management Table */}
						<div className="flex-1 overflow-hidden flex flex-col">
							<div className="flex-1 overflow-y-auto scrollbar-none">
								<table className="w-full caption-bottom text-[10px] font-mono uppercase tracking-wide">
									<TableHeader className="sticky top-0 z-10 bg-[#f4f4f0] dark:bg-[#0a0a0a] border-b border-neutral-200 dark:border-neutral-800 shadow-sm">
										<TableRow className="hover:bg-transparent border-neutral-200 dark:border-neutral-800">
											<TableHead className="w-8 py-2 h-8 text-neutral-500">
												<Checkbox
													checked={isAllSelected}
													onCheckedChange={toggleSelectAll}
													aria-label="Select all"
													className={cn(
														"w-3.5 h-3.5 rounded-[2px] border-neutral-400 data-[state=checked]:bg-[#FF4D00] data-[state=checked]:border-[#FF4D00]",
														isSomeSelected &&
															"data-[state=checked]:bg-[#FF4D00]/50",
													)}
												/>
											</TableHead>
											<TableHead className="w-10 py-2 h-8 text-neutral-500">
												Prev
											</TableHead>
											<TableHead className="py-2 h-8 text-neutral-500">
												File
											</TableHead>
											<TableHead className="w-14 py-2 h-8 text-neutral-500 text-right">
												Size
											</TableHead>
											<TableHead className="w-8 py-2 h-8 text-neutral-500 text-center">
												Stat
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{files.map((file, i) => (
											<TableRow
												key={`${file.name}-${i}`}
												data-state={
													selectedIndices.has(i) ? "selected" : undefined
												}
												className="border-b border-neutral-100 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors h-10"
											>
												<TableCell className="w-8 py-1">
													<Checkbox
														checked={selectedIndices.has(i)}
														onCheckedChange={() => toggleSelection(i)}
														aria-label={`Select ${file.name}`}
														className="w-3.5 h-3.5 rounded-[2px] border-neutral-300 data-[state=checked]:bg-[#FF4D00] data-[state=checked]:border-[#FF4D00]"
													/>
												</TableCell>
												<TableCell className="w-10 py-1">
													<div className="w-6 h-6 bg-neutral-200 dark:bg-neutral-800 rounded-[1px] overflow-hidden">
														<img
															src={URL.createObjectURL(file)}
															alt={file.name}
															className="w-full h-full object-cover grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all"
														/>
													</div>
												</TableCell>
												<TableCell className="py-1 max-w-[120px]">
													<div
														className="truncate text-neutral-700 dark:text-neutral-300"
														title={file.name}
													>
														{file.name}
													</div>
												</TableCell>
												<TableCell className="w-14 py-1 text-right text-neutral-400">
													{formatFileSize(file.size)}
												</TableCell>
												<TableCell className="w-8 py-1 text-center">
													{(() => {
														const status = fileUploadStatuses.get(file.name);
														if (!status || status.status === "idle") {
															return (
																<div
																	className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700 mx-auto"
																	title="Ready"
																/>
															);
														}
														if (status.status === "uploading") {
															return (
																<div className="w-3 h-3 mx-auto flex items-center justify-center">
																	<Loader2 className="w-2.5 h-2.5 text-[#FF4D00] animate-spin" />
																</div>
															);
														}
														if (status.status === "uploaded") {
															return (
																<div
																	className="w-2 h-2 bg-[#FF4D00] mx-auto rounded-[1px]"
																	title="Uploaded"
																/>
															);
														}
														if (status.status === "error") {
															return (
																<div
																	className="w-2 h-2 bg-red-500 mx-auto rounded-full"
																	title="Error"
																/>
															);
														}
													})()}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</table>
							</div>
						</div>
					</>
				)}
			</div>

			<input
				type="file"
				ref={fileInputRef}
				className="hidden"
				multiple
				accept="image/png, image/jpeg, image/webp"
				onChange={handleFileSelect}
			/>

			{/* Upload Progress */}
			{isUploading && (
				<div className="p-4 border-t bg-card">
					<div className="flex items-center justify-between text-xs mb-2">
						<span>Uploading...</span>
						<span>{uploadProgress}%</span>
					</div>
					<div className="h-1 bg-muted rounded-full overflow-hidden">
						<div
							className="h-full bg-primary transition-all duration-300 ease-out"
							style={{ width: `${uploadProgress}%` }}
						/>
					</div>
				</div>
			)}

			<StudioBottomToolbar
				selectedCount={selectedIndices.size}
				onClear={() => setSelectedIndices(new Set())}
				onRemove={removeSelected}
				disabled={isUploading}
			/>
		</div>
	);
}
