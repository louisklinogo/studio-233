import { AnimatePresence, motion } from "framer-motion";
import {
	ChevronLeft,
	ChevronRight,
	FileImage,
	Plus,
	Trash2,
	X,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/vectr-components/ui/checkbox";
import { cn } from "@/lib/utils";
import { EmptyStateCardStack } from "./EmptyStateCardStack";

interface FileUploadStatus {
	progress: number;
	status: "idle" | "uploading" | "uploaded" | "error";
}

interface InputQueueProps {
	files: File[];
	onFilesSelected: (files: File[]) => void;
	onRemoveFile: (index: number) => void;
	onRemoveFiles?: (indices: number[]) => void;
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

	const PREVIEW_PAGE_SIZE = 6;
	const totalPages = Math.ceil(files.length / PREVIEW_PAGE_SIZE);

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
		<div className="flex flex-col h-full">
			{/* Header */}
			<div className="p-3 border-b bg-muted/5">
				<h2 className="font-semibold text-sm tracking-wide text-muted-foreground mb-1">
					Input Queue
				</h2>
				<div className="flex items-center justify-between">
					<span className="text-2xl font-bold">
						{files.length}{" "}
						<span className="text-base font-normal text-muted-foreground">
							files
						</span>
					</span>
					{selectedIndices.size > 0 && (
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setSelectedIndices(new Set())}
								disabled={isUploading}
							>
								<X className="w-4 h-4 mr-1" />
								Clear
							</Button>
							<Button
								variant="destructive"
								size="sm"
								onClick={removeSelected}
								disabled={isUploading}
							>
								<Trash2 className="w-4 h-4 mr-1" />
								Remove ({selectedIndices.size})
							</Button>
						</div>
					)}
				</div>
			</div>

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
						<div className="p-5 border-b">
							<div className="flex items-center justify-between mb-2">
								<h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
									Preview
								</h3>
								<div className="flex items-center gap-2">
									{totalPages > 1 && (
										<div className="flex items-center gap-1">
											<Button
												variant="ghost"
												size="icon"
												className="h-6 w-6"
												onClick={() =>
													setPreviewPage((p) => Math.max(0, p - 1))
												}
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
								</div>
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
												className="relative aspect-square bg-muted rounded-md overflow-hidden group border border-border"
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
						</div>

						{/* File Management Table */}
						{/* File Management Table */}
						<div className="flex-1 overflow-hidden flex flex-col">
							<ScrollArea className="flex-1">
								<table className="w-full caption-bottom text-sm">
									<TableHeader className="sticky top-0 z-10 bg-background border-b shadow-sm">
										<TableRow>
											<TableHead className="w-12 py-3">
												<Checkbox
													checked={isAllSelected}
													onCheckedChange={toggleSelectAll}
													aria-label="Select all"
													className={cn(
														isSomeSelected &&
															"data-[state=checked]:bg-primary/50",
													)}
												/>
											</TableHead>
											<TableHead className="w-16 py-3">Preview</TableHead>
											<TableHead className="py-3">Filename</TableHead>
											<TableHead className="w-24 py-3">Size</TableHead>
											<TableHead className="w-20 py-3">Type</TableHead>
											<TableHead className="w-24 py-3">Status</TableHead>
											<TableHead className="w-12 py-3"></TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{files.map((file, i) => (
											<TableRow
												key={`${file.name}-${i}`}
												data-state={
													selectedIndices.has(i) ? "selected" : undefined
												}
											>
												<TableCell className="w-12 py-3">
													<Checkbox
														checked={selectedIndices.has(i)}
														onCheckedChange={() => toggleSelection(i)}
														aria-label={`Select ${file.name}`}
													/>
												</TableCell>
												<TableCell className="w-16 py-3">
													<div className="w-12 h-12 bg-muted rounded overflow-hidden">
														<img
															src={URL.createObjectURL(file)}
															alt={file.name}
															className="w-full h-full object-cover"
														/>
													</div>
												</TableCell>
												<TableCell className="font-medium max-w-[200px] py-3">
													<div className="truncate" title={file.name}>
														{file.name}
													</div>
												</TableCell>
												<TableCell className="w-24 text-muted-foreground py-3">
													{formatFileSize(file.size)}
												</TableCell>
												<TableCell className="w-20 text-muted-foreground text-xs py-3">
													{file.type.split("/")[1]?.toUpperCase() || "N/A"}
												</TableCell>
												<TableCell className="w-24 py-3">
													{(() => {
														const status = fileUploadStatuses.get(file.name);
														if (!status || status.status === "idle") {
															return (
																<Badge
																	variant="secondary"
																	className="font-normal"
																>
																	Ready
																</Badge>
															);
														}
														if (status.status === "uploading") {
															return (
																<Badge
																	variant="outline"
																	className="border-primary text-primary font-normal"
																>
																	{Math.round(status.progress)}%
																</Badge>
															);
														}
														if (status.status === "uploaded") {
															return (
																<Badge className="bg-green-500 hover:bg-green-600 font-normal">
																	Uploaded
																</Badge>
															);
														}
														if (status.status === "error") {
															return (
																<Badge
																	variant="destructive"
																	className="font-normal"
																>
																	Failed
																</Badge>
															);
														}
													})()}
												</TableCell>
												<TableCell className="w-12 py-3">
													<button
														onClick={() => onRemoveFile(i)}
														disabled={isUploading}
														className="p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-colors disabled:opacity-50"
														aria-label={`Remove ${file.name}`}
													>
														<X className="w-4 h-4" />
													</button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</table>
							</ScrollArea>
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
		</div>
	);
}
