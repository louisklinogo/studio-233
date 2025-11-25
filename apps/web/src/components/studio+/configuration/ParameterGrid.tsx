"use client";

import { SlidersHorizontal, Upload, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AVAILABLE_SCRIPTS, WorkflowType } from "./constants";

interface ParameterGridProps {
	workflowType: WorkflowType;
	filesCount: number;
	referenceImage: File | null;
	onReferenceChange: (file: File | null) => void;
	customPrompt: string;
	onPromptChange: (prompt: string) => void;
}

export function ParameterGrid({
	workflowType,
	filesCount,
	referenceImage,
	onReferenceChange,
	customPrompt,
	onPromptChange,
}: ParameterGridProps) {
	const [isDragging, setIsDragging] = useState(false);
	const currentScript =
		AVAILABLE_SCRIPTS.find((s) => s.id === workflowType) ||
		AVAILABLE_SCRIPTS[0];

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			const file = e.dataTransfer.files[0];
			if (file.type.startsWith("image/")) {
				onReferenceChange(file);
			}
		}
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			onReferenceChange(e.target.files[0]);
		}
	};

	return (
		<ScrollArea className="flex-1">
			<div className="p-4 space-y-6">
				<div className="space-y-4">
					<div className="flex items-center gap-2 pb-2 border-b border-border">
						<SlidersHorizontal className="w-3 h-3 text-muted-foreground" />
						<h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
							Parameters
						</h3>
					</div>

					<div className="space-y-0 divide-y divide-border/50">
						{/* Target Selection Info (Read Only) */}
						<div className="grid grid-cols-[120px_1fr] py-3 items-center gap-4">
							<div className="text-muted-foreground text-xs font-mono">
								target_files
							</div>
							<div className="font-mono text-primary text-xs">
								[{filesCount} selected]
							</div>
						</div>

						{/* Dynamic Parameters based on Script Type */}
						{currentScript.params.map((param, idx) => {
							// Special handling for Reference Image param
							if (param.type === "file") {
								return (
									<div
										key={idx}
										className="grid grid-cols-[120px_1fr] py-3 items-start gap-4 group"
									>
										<div className="text-muted-foreground text-xs mt-2 font-mono group-hover:text-foreground transition-colors">
											{param.name}
											{param.required && (
												<span className="text-destructive ml-1">*</span>
											)}
										</div>

										<div className="w-full">
											{!referenceImage ? (
												<div
													onClick={() =>
														document.getElementById("reference-upload")?.click()
													}
													onDrop={handleDrop}
													onDragOver={(e) => {
														e.preventDefault();
														setIsDragging(true);
													}}
													onDragLeave={() => setIsDragging(false)}
													className={cn(
														"h-24 border border-dashed border-border rounded bg-muted/30 flex flex-col items-center justify-center cursor-pointer hover:bg-muted hover:border-muted-foreground transition-all",
														isDragging && "border-primary bg-primary/10",
													)}
												>
													<Upload className="w-4 h-4 text-muted-foreground mb-2" />
													<span className="text-[10px] text-muted-foreground uppercase tracking-wider">
														Upload Source
													</span>
												</div>
											) : (
												<div className="relative group/image border border-border rounded bg-muted p-2 flex items-center gap-3">
													<div className="w-8 h-8 bg-background rounded overflow-hidden">
														<img
															src={URL.createObjectURL(referenceImage)}
															className="w-full h-full object-cover opacity-70"
															alt="ref"
														/>
													</div>
													<div className="flex-1 min-w-0">
														<div className="text-xs text-foreground truncate">
															{referenceImage.name}
														</div>
														<div className="text-[10px] text-muted-foreground">
															{(referenceImage.size / 1024).toFixed(1)}kb
														</div>
													</div>
													<Button
														variant="ghost"
														size="icon"
														className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-transparent"
														onClick={(e) => {
															e.stopPropagation();
															onReferenceChange(null);
														}}
													>
														<X className="w-3 h-3" />
													</Button>
												</div>
											)}
											<input
												id="reference-upload"
												type="file"
												accept="image/*"
												className="hidden"
												onChange={handleFileSelect}
											/>
										</div>
									</div>
								);
							}

							// Basic Input fallback for other params
							return (
								<div
									key={idx}
									className="grid grid-cols-[120px_1fr] py-3 items-center gap-4"
								>
									<div className="text-muted-foreground text-xs font-mono">
										{param.name}
									</div>
				<div className="text-foreground text-xs font-mono">
					{String(("default" in param ? param.default : undefined) ?? "undefined")}
				</div>
								</div>
							);
						})}

						{/* Prompt Input (Always visible but optional) */}
						<div className="grid grid-cols-[120px_1fr] py-3 items-start gap-4">
							<div className="text-muted-foreground text-xs mt-2 font-mono">
								advanced_args
							</div>
							<Textarea
								value={customPrompt}
								onChange={(e) => onPromptChange(e.target.value)}
								placeholder="--custom flags..."
								className="bg-background border-border text-foreground text-xs font-mono min-h-[80px] resize-none focus:border-primary focus:ring-0"
							/>
						</div>
					</div>
				</div>
			</div>
		</ScrollArea>
	);
}
