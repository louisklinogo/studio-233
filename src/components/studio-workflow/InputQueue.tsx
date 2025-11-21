import { AnimatePresence, motion } from "framer-motion";
import { FileImage, Plus, UploadCloud, X } from "lucide-react";
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface InputQueueProps {
	files: File[];
	onFilesSelected: (files: File[]) => void;
	onRemoveFile: (index: number) => void;
	isUploading: boolean;
	uploadProgress: number;
}

export function InputQueue({
	files,
	onFilesSelected,
	onRemoveFile,
	isUploading,
	uploadProgress,
}: InputQueueProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			onFilesSelected(Array.from(e.dataTransfer.files));
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			onFilesSelected(Array.from(e.target.files));
		}
	};

	return (
		<div className="flex flex-col h-full">
			<div className="p-4 border-b bg-muted/5">
				<h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-1">
					Input Queue
				</h2>
				<div className="flex items-center justify-between">
					<span className="text-2xl font-bold">
						{files.length}{" "}
						<span className="text-base font-normal text-muted-foreground">
							files
						</span>
					</span>
					<Button
						variant="outline"
						size="sm"
						onClick={() => onFilesSelected([])}
						disabled={files.length === 0 || isUploading}
					>
						Clear
					</Button>
				</div>
			</div>

			<div
				className="flex-1 relative"
				onDrop={handleDrop}
				onDragOver={handleDragOver}
			>
				{files.length === 0 ? (
					<div
						className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-muted/5 transition-colors border-2 border-dashed border-transparent hover:border-primary/20 m-4 rounded-xl"
						onClick={() => fileInputRef.current?.click()}
					>
						<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
							<UploadCloud className="w-8 h-8 text-primary" />
						</div>
						<h3 className="text-lg font-medium mb-1">Drop files to start</h3>
						<p className="text-sm text-muted-foreground mb-4">
							or click to browse
						</p>
						<Button variant="secondary" size="sm">
							Select Files
						</Button>
					</div>
				) : (
					<ScrollArea className="h-full">
						<div className="p-4 grid grid-cols-2 gap-3">
							<AnimatePresence>
								{files.map((file, i) => (
									<motion.div
										key={`${file.name}-${i}`}
										initial={{ opacity: 0, scale: 0.9 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.9 }}
										className="relative aspect-square bg-muted rounded-lg overflow-hidden group border hover:border-primary/50 transition-colors"
									>
										<img
											src={URL.createObjectURL(file)}
											alt={file.name}
											className="w-full h-full object-cover"
										/>
										<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-2">
											<button
												onClick={(e) => {
													e.stopPropagation();
													onRemoveFile(i);
												}}
												className="p-1 bg-black/50 hover:bg-destructive text-white rounded-md transition-colors"
											>
												<X className="w-4 h-4" />
											</button>
										</div>
										<div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-white text-xs truncate">
											{file.name}
										</div>
									</motion.div>
								))}
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/5 hover:border-primary/30 transition-colors text-muted-foreground hover:text-foreground"
									onClick={() => fileInputRef.current?.click()}
								>
									<Plus className="w-6 h-6 mb-1" />
									<span className="text-xs font-medium">Add More</span>
								</motion.div>
							</AnimatePresence>
						</div>
					</ScrollArea>
				)}

				<input
					type="file"
					ref={fileInputRef}
					className="hidden"
					multiple
					accept="image/png, image/jpeg, image/webp"
					onChange={handleFileSelect}
				/>
			</div>

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
