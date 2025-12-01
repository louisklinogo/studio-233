"use client";

import type {
	CanvasElement,
	GenerationSettings,
	PlacedImage,
	PlacedVideo,
	ShapeElement,
	TextElement,
} from "@studio233/canvas";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { SpinnerIcon } from "@/components/icons";
import { SwissIcons } from "@/components/ui/SwissIcons";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { exportVideoAsGif } from "@/utils/gif-export";
import { ColorPickerPopover } from "../properties/ColorPickerPopover";
import { FontSelector } from "../properties/FontSelector";
import { FontSizeSelector } from "../properties/FontSizeSelector";
import { ShortcutBadge } from "./ShortcutBadge";

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
	sendToFront: () => void;
	sendToBack: () => void;
	bringForward: () => void;
	sendBackward: () => void;
	viewport: { x: number; y: number; scale: number };
}

const Separator = () => (
	<div className="w-[1px] h-4 bg-neutral-200 dark:bg-neutral-800 mx-1" />
);

export const ContextToolbar: React.FC<ContextToolbarProps> = ({
	selectedIds,
	images,
	videos = [],
	elements = [],
	updateElement,
	isGenerating,
	generationSettings,
	handleRun,
	handleGeminiEdit,
	isGeminiEditing,
	handleDuplicate,
	handleRemoveBackground,
	handleCombineImages,
	handleDelete,
	handleOpenIsolateDialog,
	handleConvertToVideo,
	handleVideoToVideo,
	handleExtendVideo,
	handleRemoveVideoBackground,
	setCroppingImageId,
	sendToFront,
	sendToBack,
	bringForward,
	sendBackward,
	viewport,
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
		// screenX = (canvasX * scale) + viewportX
		// screenY = (canvasY * scale) + viewportY
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

		// Offset upwards by some amount (e.g. 50px)
		setPosition({ x: screenX, y: screenY - 50 });
	}, [selectedIds, images, videos, elements, viewport]);

	if (!position || selectedIds.length === 0) return null;

	// Determine context type
	const isImage =
		selectedIds.length === 1 && images.some((img) => img.id === selectedIds[0]);
	const isVideo =
		selectedIds.length === 1 && videos.some((vid) => vid.id === selectedIds[0]);
	const isMulti = selectedIds.length > 1;

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
						"h-8 px-2 flex items-center gap-2 transition-all relative group rounded-sm",
						"text-[10px] font-mono uppercase tracking-wider",
						disabled
							? "opacity-30 cursor-not-allowed"
							: "hover:bg-neutral-200 dark:hover:bg-neutral-800",
						isActive && "bg-neutral-200 dark:bg-neutral-800",
						variant === "danger" &&
							"text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20",
						variant === "accent" && "text-[#FF4D00]",
					)}
				>
					<Icon
						size={14}
						className={cn(
							"stroke-[1.5px]",
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
					initial={{ opacity: 0, y: 10, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: 5, scale: 0.95 }}
					transition={{ type: "spring", stiffness: 400, damping: 30 }}
					className={cn(
						"pointer-events-auto",
						"flex items-center p-1 gap-0.5",
						"bg-[#f4f4f0] dark:bg-[#111111]",
						"border border-neutral-200 dark:border-neutral-800",
						"rounded-md shadow-sm", // Precision geometry
						"backdrop-blur-sm", // Subtle glass effect if needed, but keeping it solid per specs
					)}
				>
					{/* Context Actions */}
					{isImage && (
						<>
							<ToolbarButton
								icon={SwissIcons.Crop}
								label="Crop"
								onClick={() => setCroppingImageId(selectedIds[0])}
							/>
							<ToolbarButton
								icon={SwissIcons.Scissors}
								label="No BG"
								onClick={handleRemoveBackground}
							/>
							<ToolbarButton
								icon={SwissIcons.Filter}
								label="Isolate"
								onClick={handleOpenIsolateDialog}
							/>
							{handleGeminiEdit && (
								<ToolbarButton
									icon={
										isGeminiEditing ? SwissIcons.Spinner : SwissIcons.Sparkles
									}
									label="Edit"
									onClick={handleGeminiEdit}
									disabled={isGeminiEditing}
								/>
							)}
							{handleConvertToVideo && (
								<>
									<Separator />
									<ToolbarButton
										icon={SwissIcons.Video}
										label="Animate"
										onClick={() => handleConvertToVideo(selectedIds[0])}
									/>
								</>
							)}
						</>
					)}

					{isVideo && (
						<>
							{handleExtendVideo && (
								<ToolbarButton
									icon={SwissIcons.FilePlus}
									label="Extend"
									onClick={() => handleExtendVideo(selectedIds[0])}
								/>
							)}
							{handleRemoveVideoBackground && (
								<ToolbarButton
									icon={SwissIcons.Scissors}
									label="No BG"
									onClick={() => handleRemoveVideoBackground(selectedIds[0])}
								/>
							)}
							<Separator />
							<ToolbarButton
								icon={SwissIcons.Video}
								label="GIF"
								onClick={async () => {
									const video = videos.find((v) => v.id === selectedIds[0]);
									if (video) {
										try {
											await exportVideoAsGif(video.src);
										} catch (error) {
											console.error("Failed to export GIF:", error);
										}
									}
								}}
							/>
						</>
					)}

					{isMulti && (
						<>
							<ToolbarButton
								icon={SwissIcons.Combine}
								label="Combine"
								onClick={handleCombineImages}
							/>
							<div className="px-2 text-[10px] font-mono text-neutral-400">
								{selectedIds.length} ITEMS
							</div>
						</>
					)}

					{/* Common Actions */}
					<Separator />
					<ToolbarButton
						icon={SwissIcons.Copy}
						onClick={handleDuplicate}
						shortcut="Ctrl+D"
					/>

					{/* Layering */}
					<div className="flex items-center">
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
					<ToolbarButton
						icon={SwissIcons.Trash}
						onClick={handleDelete}
						variant="danger"
						shortcut="Del"
					/>
				</motion.div>
			</div>
		</TooltipProvider>
	);
};
