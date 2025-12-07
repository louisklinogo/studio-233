"use client";

import type {
	CanvasElement,
	GenerationSettings,
	PlacedImage,
	PlacedVideo,
} from "@studio233/canvas";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
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
	handleGeminiEdit?: () => void;
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
}

const Separator = () => (
	<div className="w-[1px] h-6 bg-neutral-300 dark:bg-neutral-700 mx-[1px]" />
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
	sendToFront,
	sendToBack,
	bringForward,
	sendBackward,
	viewport,
	onSendToChat,
	croppingImageId,
	onCropConfirm,
	onCropCancel,
}) => {
	const [position, setPosition] = useState<{ x: number; y: number } | null>(
		null,
	);

	// Calculate position based on selection
	useEffect(() => {
		if (selectedIds.length === 0) {
			setPosition(null);
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
		variant = "default",
		shortcut,
	}: {
		icon: any;
		label?: string;
		onClick: () => void;
		disabled?: boolean;
		isActive?: boolean;
		variant?: "default" | "danger" | "accent";
		shortcut?: string;
	}) => (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					type="button"
					onClick={onClick}
					disabled={disabled}
					className={cn(
						"h-10 px-3 flex items-center gap-2 transition-colors relative group",
						"text-[10px] font-mono uppercase tracking-wider",
						disabled
							? "opacity-40 cursor-not-allowed"
							: "hover:bg-white dark:hover:bg-[#1a1a1a]",
						isActive && "bg-white dark:bg-[#1a1a1a]",
						variant === "danger" &&
							"text-neutral-500 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-400",
						variant === "accent" && "text-[#FF4D00]",
					)}
				>
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
					{label && (
						<span
							className={cn(
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
			<TooltipContent side="top" className="text-xs font-mono">
				{label || "Action"}{" "}
				{shortcut && <span className="ml-2 opacity-50">{shortcut}</span>}
			</TooltipContent>
		</Tooltip>
	);

	return (
		<TooltipProvider>
			<div
				className="fixed z-50 pointer-events-none"
				style={{
					left: position.x,
					top: position.y,
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
						"flex items-center gap-[1px]",
						"bg-neutral-200 dark:bg-neutral-800", // Grid lines color
						"border border-neutral-300 dark:border-neutral-700",
						"rounded-sm shadow-xl overflow-hidden",
					)}
				>
					{/* Inner container for solid background of items */}
					<div className="flex items-center gap-[1px] bg-neutral-200 dark:bg-neutral-800">
						{croppingImageId ? (
							// Crop Mode Controls
							<>
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
							</>
						) : (
							// Standard Controls
							<>
								{/* Context Actions */}
								{isImage && (
									<>
										{/* Generative Actions Group */}
										<div className="bg-[#f4f4f0] dark:bg-[#111111]">
											<ToolbarButton
												icon={SwissIcons.Scissors}
												label="No BG"
												onClick={handleRemoveBackground}
											/>
										</div>
										<div className="bg-[#f4f4f0] dark:bg-[#111111]">
											<ToolbarButton
												icon={SwissIcons.Filter}
												label="Isolate"
												onClick={handleOpenIsolateDialog}
											/>
										</div>
										{handleGeminiEdit && (
											<div className="bg-[#f4f4f0] dark:bg-[#111111]">
												<ToolbarButton
													icon={
														isGeminiEditing
															? SwissIcons.Spinner
															: SwissIcons.Sparkles
													}
													label="Edit"
													onClick={handleGeminiEdit}
													disabled={isGeminiEditing}
												/>
											</div>
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

										<Separator />

										{/* Canvas Actions Group */}
										<div className="bg-[#f4f4f0] dark:bg-[#111111]">
											<ToolbarButton
												icon={SwissIcons.Crop}
												label="Crop"
												onClick={() => setCroppingImageId(selectedIds[0])}
											/>
										</div>
									</>
								)}

								{isVideo && (
									<>
										{/* Generative Video Actions */}
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

										{/* Canvas Video Actions */}
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
										<div className="bg-[#f4f4f0] dark:bg-[#111111] h-10 px-3 flex items-center">
											<span className="text-[10px] font-mono text-neutral-400">
												{selectedIds.length} ITEMS
											</span>
										</div>
									</>
								)}

								{hasSelectedImages && onSendToChat && (
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

								{/* Common Actions */}
								<Separator />
								<div className="bg-[#f4f4f0] dark:bg-[#111111]">
									<ToolbarButton
										icon={SwissIcons.Copy}
										onClick={handleDuplicate}
										shortcut="Ctrl+D"
									/>
								</div>

								{/* Layering */}
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

								{/* Delete */}
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
				</motion.div>
			</div>
		</TooltipProvider>
	);
};
