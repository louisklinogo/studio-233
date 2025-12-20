"use client";

import type {
	CanvasElement,
	GenerationSettings,
	PlacedImage,
	PlacedVideo,
} from "@studio233/canvas";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SwissIcons } from "@/components/ui/SwissIcons";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { exportVideoAsGif } from "@/utils/gif-export";

interface ContextToolbarProps {
	selectedIds: string[];
	images: PlacedImage[];
	videos?: PlacedVideo[];
	elements?: CanvasElement[];
	updateElement?: (id: string, updates: Partial<CanvasElement>) => void;
	isGenerating: boolean;
	generationSettings: GenerationSettings;
	handleRun: () => void;
	handleGeminiEdit?: (prompt?: string) => void;
	isGeminiEditing?: boolean;
	handleDuplicate: () => void;
	handleRemoveBackground: () => void;
	handleCombineImages: () => void;
	handleDelete: () => void;
	handleOpenIsolateDialog: () => void;
	handleConvertToVideo?: (imageId: string) => void;
	handleVideoToVideo?: (videoId: string) => void;
	handleExtendVideo?: (videoId: string) => void;
	handleRemoveVideoBackground?: (videoId: string) => void;
	setCroppingImageId: (id: string | null) => void;
	isolateInputValue?: string;
	setIsolateInputValue?: (value: string) => void;
	setIsolateTarget?: (id: string | null) => void;
	onSendToChat?: () => void;
	sendToFront: () => void;
	sendToBack: () => void;
	bringForward: () => void;
	sendBackward: () => void;
	viewport: { x: number; y: number; scale: number };
	croppingImageId?: string | null;
	onCropConfirm?: () => void;
	onCropCancel?: () => void;
	isIsolating?: boolean;
	handleIsolate?: () => void;
	isRemovingBackground?: boolean;
	error?: string | null;
	clearError?: () => void;
}

const Separator = () => (
	<div className="w-[1px] h-6 bg-neutral-300 dark:bg-neutral-700 mx-1 self-center" />
);

export const ContextToolbar: React.FC<ContextToolbarProps> = ({
	selectedIds,
	images,
	videos = [],
	elements = [],
	isGenerating,
	handleGeminiEdit,
	isGeminiEditing,
	handleDuplicate,
	handleRemoveBackground,
	handleCombineImages,
	handleDelete,
	handleOpenIsolateDialog,
	handleConvertToVideo,
	handleExtendVideo,
	handleRemoveVideoBackground,
	setCroppingImageId,
	isolateInputValue = "",
	setIsolateInputValue,
	sendToFront,
	sendToBack,
	bringForward,
	sendBackward,
	viewport,
	onSendToChat,
	croppingImageId,
	onCropConfirm,
	onCropCancel,
	isIsolating,
	handleIsolate,
	isRemovingBackground,
	error,
	clearError,
}) => {
	const [position, setPosition] = useState<{ x: number; y: number } | null>(
		null,
	);
	const [isIsolateExpanded, setIsIsolateExpanded] = useState(false);
	const [isEditExpanded, setIsEditExpanded] = useState(false);
	const [editPrompt, setEditPrompt] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);
	const editInputRef = useRef<HTMLInputElement>(null);
	const toolbarRef = useRef<HTMLDivElement>(null);
	const [toolbarWidth, setToolbarWidth] = useState(0);

	// Measure toolbar width for proper clamping
	useEffect(() => {
		if (toolbarRef.current) {
			const observer = new ResizeObserver((entries) => {
				for (const entry of entries) {
					setToolbarWidth(entry.contentRect.width);
				}
			});
			observer.observe(toolbarRef.current);
			return () => observer.disconnect();
		}
	}, []);

	// Calculate position based on selection
	useEffect(() => {
		if (selectedIds.length === 0) {
			setPosition(null);
			setIsIsolateExpanded(false);
			setIsEditExpanded(false);
			setEditPrompt("");
			return;
		}

		let minX = Infinity;
		let minY = Infinity;
		let maxX = -Infinity;
		let maxY = -Infinity;
		let found = false;

		// Check images
		images.forEach((img) => {
			if (selectedIds.includes(img.id)) {
				minX = Math.min(minX, img.x);
				minY = Math.min(minY, img.y);
				maxX = Math.max(maxX, img.x + (img.width || 0));
				maxY = Math.max(maxY, img.y + (img.height || 0));
				found = true;
			}
		});

		// Check videos
		videos.forEach((vid) => {
			if (selectedIds.includes(vid.id)) {
				minX = Math.min(minX, vid.x);
				minY = Math.min(minY, vid.y);
				maxX = Math.max(maxX, vid.x + (vid.width || 0));
				maxY = Math.max(maxY, vid.y + (vid.height || 0));
				found = true;
			}
		});

		// Check other elements (shapes, text)
		elements.forEach((el) => {
			if (selectedIds.includes(el.id)) {
				minX = Math.min(minX, el.x);
				minY = Math.min(minY, el.y);
				// Assuming elements have width/height or we estimate
				const width = (el as any).width || 100;
				const height = (el as any).height || 100;
				maxX = Math.max(maxX, el.x + width);
				maxY = Math.max(maxY, el.y + height);
				found = true;
			}
		});

		if (!found) {
			setPosition(null);
			return;
		}

		// Center of bounding box in canvas coords
		const centerX = (minX + maxX) / 2;
		const topY = minY;

		// Convert to screen coords
		const screenX = centerX * viewport.scale + viewport.x;
		const screenY = topY * viewport.scale + viewport.y;

		// Guard against NaN values
		if (
			isNaN(screenX) ||
			isNaN(screenY) ||
			!isFinite(screenX) ||
			!isFinite(screenY)
		) {
			setPosition(null);
			return;
		}

		// Offset upwards by some amount (e.g. 60px)
		setPosition({ x: screenX, y: screenY - 60 });
	}, [selectedIds, images, videos, elements, viewport]);

	// Auto-focus input when expanded
	useEffect(() => {
		if (isIsolateExpanded && inputRef.current) {
			inputRef.current.focus();
		}
		if (isEditExpanded && editInputRef.current) {
			editInputRef.current.focus();
		}
	}, [isIsolateExpanded, isEditExpanded]);

	if (!position || selectedIds.length === 0) return null;

	// Determine context type
	const isImage =
		selectedIds.length === 1 && images.some((img) => img.id === selectedIds[0]);
	const isVideo =
		selectedIds.length === 1 && videos.some((vid) => vid.id === selectedIds[0]);
	const isMulti = selectedIds.length > 1;
	const hasSelectedImages = images.some((img) => selectedIds.includes(img.id));

	const ToolbarButton = ({
		icon: Icon,
		label,
		onClick,
		disabled,
		isActive,
		isLoading,
		variant = "default",
		shortcut,
	}: {
		icon: any;
		label?: string;
		onClick: () => void;
		disabled?: boolean;
		isActive?: boolean;
		isLoading?: boolean;
		variant?: "default" | "danger" | "accent";
		shortcut?: string;
	}) => (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					type="button"
					onClick={onClick}
					disabled={disabled || isLoading}
					className={cn(
						"h-10 px-3 flex items-center gap-2 transition-all relative group",
						"text-[11px] font-mono uppercase tracking-tight",
						disabled || isLoading
							? "opacity-40 cursor-not-allowed"
							: "hover:bg-white dark:hover:bg-neutral-900",
						isActive && "bg-white dark:bg-neutral-900",
						variant === "danger" &&
							"text-neutral-500 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-400",
						variant === "accent" && "text-[#FF4D00]",
					)}
				>
					{isLoading ? (
						<SwissIcons.Spinner className="animate-spin" size={16} />
					) : (
						<Icon
							size={16}
							strokeWidth={1.5}
							className={cn(
								"transition-colors",
								variant === "default" &&
									"text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white",
								variant === "danger" && "text-current",
								variant === "accent" && "text-current",
							)}
						/>
					)}
					{label && (
						<span
							className={cn(
								"whitespace-nowrap",
								variant === "default" &&
									"text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white",
								variant === "danger" && "text-current",
								variant === "accent" && "text-current",
							)}
						>
							{label}
						</span>
					)}
				</button>
			</TooltipTrigger>
			<TooltipContent
				side="top"
				className="text-[10px] font-mono rounded-none border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black text-neutral-900 dark:text-white"
			>
				{label || "Action"}{" "}
				{shortcut && <span className="ml-2 opacity-50">{shortcut}</span>}
			</TooltipContent>
		</Tooltip>
	);

	return (
		<TooltipProvider>
			<div
				ref={toolbarRef}
				className="fixed z-50 pointer-events-none"
				style={{
					// Clamp position to keep entire toolbar within viewport
					// Account for half the toolbar width on each side
					left: Math.max(
						toolbarWidth / 2 + 16, // Left edge padding
						Math.min(
							window.innerWidth - toolbarWidth / 2 - 16, // Right edge padding
							position.x,
						),
					),
					top: Math.max(60, position.y),
					transform: "translateX(-50%)",
				}}
			>
				<motion.div
					initial={{ opacity: 0, y: 10, scale: 0.98 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: 5, scale: 0.98 }}
					transition={{ type: "spring", stiffness: 400, damping: 30 }}
					className={cn(
						"pointer-events-auto",
						"flex items-center",
						"bg-neutral-200 dark:bg-neutral-800",
						"border border-neutral-300 dark:border-neutral-700",
						"rounded-sm shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden flex-col items-stretch",
					)}
				>
					{croppingImageId ? (
						<div className="flex items-center gap-[1px] bg-neutral-200 dark:bg-neutral-800">
							<div className="bg-[#f4f4f0] dark:bg-[#111111]">
								<ToolbarButton
									icon={SwissIcons.Check}
									label="Apply"
									onClick={onCropConfirm || (() => setCroppingImageId(null))}
									variant="accent"
								/>
							</div>
							<div className="bg-[#f4f4f0] dark:bg-[#111111]">
								<ToolbarButton
									icon={SwissIcons.Close}
									label="Cancel"
									onClick={onCropCancel || (() => setCroppingImageId(null))}
								/>
							</div>
						</div>
					) : (
						<div className="flex items-center gap-[1px] bg-neutral-200 dark:bg-neutral-800">
							{isImage && (
								<>
									{isIsolateExpanded ? (
										<div className="flex items-center bg-[#f4f4f0] dark:bg-[#111111] px-1 h-10">
											<input
												ref={inputRef}
												type="text"
												placeholder="WHAT TO ISOLATE? (E.G. 'THE CHAIR')"
												value={isolateInputValue}
												onChange={(e) =>
													setIsolateInputValue?.(e.target.value.toUpperCase())
												}
												onKeyDown={(e) => {
													if (e.key === "Enter") {
														handleIsolate?.();
														setIsIsolateExpanded(false);
													}
													if (e.key === "Escape") setIsIsolateExpanded(false);
												}}
												className="bg-transparent border-none outline-none px-2 w-64 text-[11px] font-mono uppercase tracking-tight placeholder:text-neutral-400"
											/>
											<ToolbarButton
												icon={SwissIcons.Check}
												onClick={() => {
													handleIsolate?.();
													setIsIsolateExpanded(false);
												}}
												isLoading={isIsolating}
												variant="accent"
											/>
											<ToolbarButton
												icon={SwissIcons.Close}
												onClick={() => setIsIsolateExpanded(false)}
											/>
										</div>
									) : (
										<>
											<div className="bg-[#f4f4f0] dark:bg-[#111111]">
												<ToolbarButton
													icon={SwissIcons.Crop}
													label="Crop"
													onClick={() => setCroppingImageId(selectedIds[0])}
												/>
											</div>
											<Separator />
											{/* REFINE Dropdown - Consolidated AI transformations */}
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<div className="bg-[#f4f4f0] dark:bg-[#111111]">
														<button
															type="button"
															className={cn(
																"h-10 px-3 flex items-center gap-2 transition-all relative group",
																"text-[11px] font-mono uppercase tracking-tight",
																isRemovingBackground || isIsolating
																	? "opacity-40 cursor-not-allowed"
																	: "hover:bg-white dark:hover:bg-neutral-900",
																"text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white",
															)}
															disabled={isRemovingBackground || isIsolating}
														>
															{isRemovingBackground || isIsolating ? (
																<SwissIcons.Spinner size={16} />
															) : (
																<SwissIcons.Sparkles size={16} />
															)}
															<span className="whitespace-nowrap">Refine</span>
															<SwissIcons.ChevronDown size={12} />
														</button>
													</div>
												</DropdownMenuTrigger>
												<DropdownMenuContent
													side="bottom"
													align="start"
													className="min-w-[160px] rounded-sm border border-neutral-300 dark:border-neutral-700 bg-[#f4f4f0] dark:bg-[#111111] p-1 shadow-lg"
												>
													<DropdownMenuItem
														onClick={handleRemoveBackground}
														disabled={isRemovingBackground}
														className="flex items-center gap-2 px-2 py-1.5 text-[11px] font-mono uppercase tracking-tight cursor-pointer rounded-sm hover:bg-white dark:hover:bg-neutral-900 focus:bg-white dark:focus:bg-neutral-900"
													>
														<SwissIcons.Scissors size={14} />
														<span>Remove Background</span>
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => setIsIsolateExpanded(true)}
														disabled={isIsolating}
														className="flex items-center gap-2 px-2 py-1.5 text-[11px] font-mono uppercase tracking-tight cursor-pointer rounded-sm hover:bg-white dark:hover:bg-neutral-900 focus:bg-white dark:focus:bg-neutral-900"
													>
														<SwissIcons.Filter size={14} />
														<span>Isolate Object</span>
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
											{handleGeminiEdit && (
												<>
													{isEditExpanded ? (
														<div className="flex items-center bg-[#f4f4f0] dark:bg-[#111111] px-1 h-10">
															<input
																ref={editInputRef}
																type="text"
																placeholder="HOW TO EDIT? (E.G. 'MAKE IT VINTAGE')"
																value={editPrompt}
																onChange={(e) =>
																	setEditPrompt(e.target.value.toUpperCase())
																}
																onKeyDown={(e) => {
																	if (e.key === "Enter") {
																		handleGeminiEdit(editPrompt);
																		setIsEditExpanded(false);
																	}
																	if (e.key === "Escape")
																		setIsEditExpanded(false);
																}}
																className="bg-transparent border-none outline-none px-2 w-64 text-[11px] font-mono uppercase tracking-tight placeholder:text-neutral-400"
															/>
															<ToolbarButton
																icon={SwissIcons.Check}
																onClick={() => {
																	handleGeminiEdit(editPrompt);
																	setIsEditExpanded(false);
																}}
																isLoading={isGeminiEditing}
																variant="accent"
															/>
															<ToolbarButton
																icon={SwissIcons.Close}
																onClick={() => setIsEditExpanded(false)}
															/>
														</div>
													) : (
														<div className="bg-[#f4f4f0] dark:bg-[#111111]">
															<ToolbarButton
																icon={SwissIcons.Sparkles}
																label="Edit"
																onClick={() => setIsEditExpanded(true)}
																isLoading={isGeminiEditing}
															/>
														</div>
													)}
												</>
											)}
											{handleConvertToVideo && (
												<div className="bg-[#f4f4f0] dark:bg-[#111111]">
													<ToolbarButton
														icon={SwissIcons.Video}
														label="Animate"
														onClick={() => handleConvertToVideo(selectedIds[0])}
													/>
												</div>
											)}
										</>
									)}
								</>
							)}

							{isVideo && (
								<>
									{handleExtendVideo && (
										<div className="bg-[#f4f4f0] dark:bg-[#111111]">
											<ToolbarButton
												icon={SwissIcons.FilePlus}
												label="Extend"
												onClick={() => handleExtendVideo(selectedIds[0])}
											/>
										</div>
									)}
									{handleRemoveVideoBackground && (
										<div className="bg-[#f4f4f0] dark:bg-[#111111]">
											<ToolbarButton
												icon={SwissIcons.Scissors}
												label="No BG"
												onClick={() =>
													handleRemoveVideoBackground(selectedIds[0])
												}
											/>
										</div>
									)}
									<Separator />
									<div className="bg-[#f4f4f0] dark:bg-[#111111]">
										<ToolbarButton
											icon={SwissIcons.Video}
											label="GIF"
											onClick={async () => {
												const video = videos.find(
													(v) => v.id === selectedIds[0],
												);
												if (video) {
													try {
														await exportVideoAsGif(video.src);
													} catch (error) {
														console.error("Failed to export GIF:", error);
													}
												}
											}}
										/>
									</div>
								</>
							)}

							{isMulti && (
								<>
									<div className="bg-[#f4f4f0] dark:bg-[#111111]">
										<ToolbarButton
											icon={SwissIcons.Combine}
											label="Combine"
											onClick={handleCombineImages}
										/>
									</div>
									<div className="bg-[#f4f4f0] dark:bg-[#111111] h-10 px-4 flex items-center">
										<span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
											{selectedIds.length} ITEMS
										</span>
									</div>
								</>
							)}

							{hasSelectedImages && onSendToChat && !isIsolateExpanded && (
								<>
									<Separator />
									<div className="bg-[#f4f4f0] dark:bg-[#111111]">
										<ToolbarButton
											icon={SwissIcons.Link}
											label="To Chat"
											onClick={onSendToChat}
										/>
									</div>
								</>
							)}

							{!isIsolateExpanded && (
								<>
									<Separator />
									<div className="bg-[#f4f4f0] dark:bg-[#111111]">
										<ToolbarButton
											icon={SwissIcons.Copy}
											onClick={handleDuplicate}
											shortcut="Ctrl+D"
										/>
									</div>
									<div className="bg-[#f4f4f0] dark:bg-[#111111] flex items-center">
										<ToolbarButton
											icon={SwissIcons.ArrowUp}
											onClick={bringForward}
											shortcut="]"
										/>
										<ToolbarButton
											icon={SwissIcons.ArrowDown}
											onClick={sendBackward}
											shortcut="["
										/>
									</div>
									<Separator />
									<div className="bg-[#f4f4f0] dark:bg-[#111111]">
										<ToolbarButton
											icon={SwissIcons.Trash}
											onClick={handleDelete}
											variant="danger"
											shortcut="Del"
										/>
									</div>
								</>
							)}
						</div>
					)}

					{/* Error / Status Area */}
					<AnimatePresence>
						{error && (
							<motion.div
								initial={{ height: 0, opacity: 0 }}
								animate={{ height: "auto", opacity: 1 }}
								exit={{ height: 0, opacity: 0 }}
								className="bg-red-50 dark:bg-red-950/30 border-t border-red-200 dark:border-red-900/50 px-3 py-1.5 flex items-center justify-between gap-4"
							>
								<span className="text-[9px] font-mono uppercase tracking-wider text-red-600 dark:text-red-400">
									{error}
								</span>
								<button
									type="button"
									onClick={clearError}
									className="text-red-400 hover:text-red-600 transition-colors"
								>
									<SwissIcons.Close size={12} />
								</button>
							</motion.div>
						)}
					</AnimatePresence>
				</motion.div>
			</div>
		</TooltipProvider>
	);
};
