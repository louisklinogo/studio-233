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
import React, { useState } from "react";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { cn } from "@/lib/utils";
import { StyleSelector } from "../control-deck/StyleSelector"; // Reusing for now
import { ColorPickerPopover } from "../properties/ColorPickerPopover";
import { FontSelector } from "../properties/FontSelector";
import { FontSizeSelector } from "../properties/FontSizeSelector";
import { StudioBarInput } from "./StudioBarInput";

interface StudioBarProps {
	selectedIds: string[];
	images: PlacedImage[];
	videos: PlacedVideo[];
	elements: CanvasElement[];
	updateElement: (id: string, updates: Partial<CanvasElement>) => void;

	isGenerating: boolean;
	generationSettings: GenerationSettings;
	onUpdateSettings?: (settings: Partial<GenerationSettings>) => void;
	handleRun: () => void;

	// History
	undo?: () => void;
	redo?: () => void;
	canUndo?: boolean;
	canRedo?: boolean;

	// Actions
	handleDuplicate: () => void;
	handleRemoveBackground: () => void;
	handleOpenIsolateDialog?: () => void;
	handleGeminiEdit?: () => void;
	isGeminiEditing?: boolean;
	handleConvertToVideo?: (id: string) => void;
	handleCombineImages: () => void;
	handleDelete: () => void;
	setCroppingImageId: (id: string | null) => void;

	// Layering
	sendToFront: () => void;
	sendToBack: () => void;
	bringForward: () => void;
	sendBackward: () => void;

	// Tool Defaults
	activeTool?: string;
	defaultTextProps?: any;
	setDefaultTextProps?: (props: any) => void;
	defaultShapeProps?: any;
	setDefaultShapeProps?: (props: any) => void;
	defaultDrawingProps?: any;
	setDefaultDrawingProps?: (props: any) => void;
	isChatOpen?: boolean;

	// Expanded Input Control
	onExpandInput?: () => void;
	onMicInput?: () => void;
}

export const StudioBar: React.FC<StudioBarProps> = ({
	selectedIds,
	images,
	videos,
	elements,
	updateElement,
	isGenerating,
	generationSettings,
	onUpdateSettings,
	handleRun,
	undo,
	redo,
	canUndo,
	canRedo,
	handleDuplicate,
	handleRemoveBackground,
	handleOpenIsolateDialog,
	handleGeminiEdit,
	isGeminiEditing,
	handleConvertToVideo,
	handleCombineImages,
	handleDelete,
	setCroppingImageId,
	sendToFront,
	sendToBack,
	bringForward,
	sendBackward,
	activeTool,
	defaultTextProps,
	setDefaultTextProps,
	defaultShapeProps,
	setDefaultShapeProps,
	defaultDrawingProps,
	setDefaultDrawingProps,
	isChatOpen,
	onExpandInput,
	onMicInput,
}) => {
	// --- CONTEXT LOGIC ---
	const getSelectionContext = () => {
		if (selectedIds.length > 1) return "MULTI";
		if (selectedIds.length === 1) {
			const id = selectedIds[0];
			const image = images.find((i) => i.id === id);
			if (image) return "IMAGE";
			const video = videos.find((v) => v.id === id);
			if (video) return "VIDEO";
			const element = elements.find((e) => e.id === id);
			if (element) return element.type.toUpperCase();
		}
		if (activeTool === "text") return "TEXT";
		if (activeTool === "shape") return "SHAPE";
		if (activeTool === "draw") return "DRAWING";
		return "GLOBAL";
	};

	const context = getSelectionContext();
	const selectedElement = elements.find((e) => e.id === selectedIds[0]);
	const isToolMode = selectedIds.length === 0;

	const updateProperty = (updates: any) => {
		if (!isToolMode && selectedIds.length === 1) {
			updateElement(selectedIds[0], updates);
		} else {
			if (context === "TEXT" && setDefaultTextProps)
				setDefaultTextProps({ ...defaultTextProps, ...updates });
			if (context === "SHAPE" && setDefaultShapeProps)
				setDefaultShapeProps({ ...defaultShapeProps, ...updates });
			if (context === "DRAWING" && setDefaultDrawingProps)
				setDefaultDrawingProps({ ...defaultDrawingProps, ...updates });
		}
	};

	// --- COMPONENTS ---

	const Separator = () => (
		<div className="w-[1px] h-6 bg-neutral-200 dark:bg-neutral-800 mx-1" />
	);

	const ActionButton = ({
		icon: Icon,
		label,
		onClick,
		disabled,
		isActive,
		variant = "default",
	}: {
		icon: any;
		label?: string;
		onClick: () => void;
		disabled?: boolean;
		isActive?: boolean;
		variant?: "default" | "danger" | "accent";
	}) => (
		<button
			onClick={onClick}
			disabled={disabled}
			className={cn(
				"h-full px-3 flex items-center gap-2 transition-colors relative group",
				disabled
					? "opacity-30 cursor-not-allowed"
					: "hover:bg-neutral-100 dark:hover:bg-neutral-800",
				isActive && "bg-neutral-100 dark:bg-neutral-800",
			)}
		>
			<Icon
				size={16}
				className={cn(
					"transition-colors",
					variant === "danger"
						? "text-red-500"
						: variant === "accent"
							? "text-[#FF4D00]"
							: "text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white",
				)}
			/>
			{label && (
				<span
					className={cn(
						"font-mono text-[10px] tracking-wider uppercase",
						variant === "danger"
							? "text-red-500"
							: "text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white",
					)}
				>
					{label}
				</span>
			)}
		</button>
	);

	// --- SECTIONS ---

	// 1. CONTEXT (Left)
	const ContextSection = () => (
		<div className="flex items-center h-full px-4 min-w-[140px] border-r border-neutral-200 dark:border-neutral-800">
			<span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-600 uppercase tracking-widest">
				{context === "GLOBAL" ? "STUDIO" : context}
			</span>
			{selectedIds.length > 0 && (
				<span className="ml-2 px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-[9px] font-mono text-neutral-500">
					{selectedIds.length}
				</span>
			)}
		</div>
	);

	// 2. COMMAND (Center)
	const CommandSection = () => (
		<div className="flex-1 h-full flex items-center overflow-hidden relative">
			{context === "GLOBAL" ? (
				<div className="w-full h-full flex items-center">
					<StudioBarInput
						value={generationSettings.prompt || ""}
						onChange={(val) => onUpdateSettings?.({ prompt: val })}
						onSubmit={handleRun}
						isGenerating={isGenerating}
						onExpand={onExpandInput}
						onMic={onMicInput}
					/>
					<Separator />
					<div className="px-2">
						<StyleSelector
							selectedStyleId={generationSettings.styleId || "simpsons"}
							onSelectStyle={(id) => onUpdateSettings?.({ styleId: id })}
						/>
					</div>
					<Separator />
					<ActionButton
						icon={isGenerating ? SwissIcons.Spinner : SwissIcons.Play}
						onClick={handleRun}
						disabled={isGenerating}
						variant="accent"
						label="RUN"
					/>
				</div>
			) : (
				<div className="w-full h-full flex items-center px-2 gap-1 overflow-x-auto no-scrollbar">
					{/* IMAGE ACTIONS */}
					{context === "IMAGE" && (
						<>
							<ActionButton
								icon={SwissIcons.Crop}
								label="CROP"
								onClick={() => setCroppingImageId(selectedIds[0])}
							/>
							<ActionButton
								icon={SwissIcons.Scissors}
								label="NO BG"
								onClick={handleRemoveBackground}
							/>
							{handleOpenIsolateDialog && (
								<ActionButton
									icon={SwissIcons.Filter}
									label="ISOLATE"
									onClick={handleOpenIsolateDialog}
								/>
							)}
							{handleGeminiEdit && (
								<ActionButton
									icon={
										isGeminiEditing ? SwissIcons.Spinner : SwissIcons.Sparkles
									}
									label="EDIT"
									onClick={handleGeminiEdit}
									disabled={isGeminiEditing}
								/>
							)}
						</>
					)}
					{/* TEXT ACTIONS */}
					{context === "TEXT" && (
						<>
							<div className="w-32 scale-90">
								<FontSelector
									value={
										isToolMode
											? defaultTextProps?.fontFamily
											: (selectedElement as TextElement)?.fontFamily
									}
									onChange={(val) => updateProperty({ fontFamily: val })}
								/>
							</div>
							<Separator />
							<div className="w-16 scale-90">
								<FontSizeSelector
									value={
										isToolMode
											? defaultTextProps?.fontSize
											: (selectedElement as TextElement)?.fontSize
									}
									onChange={(val) => updateProperty({ fontSize: val })}
								/>
							</div>
							<Separator />
							<ColorPickerPopover
								color={
									isToolMode
										? defaultTextProps?.fill
										: (selectedElement as TextElement)?.fill
								}
								onChange={(c) => updateProperty({ fill: c })}
							/>
						</>
					)}
					{/* SHAPE ACTIONS */}
					{context === "SHAPE" && (
						<>
							<ColorPickerPopover
								label="Fill"
								color={
									isToolMode
										? defaultShapeProps?.fill
										: (selectedElement as ShapeElement)?.fill
								}
								onChange={(c) => updateProperty({ fill: c })}
							/>
							<Separator />
							<ColorPickerPopover
								label="Stroke"
								color={
									isToolMode
										? defaultShapeProps?.stroke
										: (selectedElement as ShapeElement)?.stroke
								}
								onChange={(c) => updateProperty({ stroke: c })}
							/>
						</>
					)}
					{/* COMMON ACTIONS */}
					<div className="flex-1" /> {/* Spacer */}
					<Separator />
					<ActionButton
						icon={SwissIcons.Copy}
						onClick={handleDuplicate}
						label="DUPE"
					/>
					<ActionButton
						icon={SwissIcons.Trash}
						onClick={handleDelete}
						variant="danger"
					/>
				</div>
			)}
		</div>
	);
	// 3. SYSTEM (Right)
	const SystemSection = () => (
		<div className="flex items-center h-full px-2 border-l border-neutral-200 dark:border-neutral-800">
			<ActionButton
				icon={SwissIcons.Undo}
				onClick={undo || (() => {})}
				disabled={!canUndo}
			/>
			<ActionButton
				icon={SwissIcons.Redo}
				onClick={redo || (() => {})}
				disabled={!canRedo}
			/>
		</div>
	);

	// --- RENDER ---
	const centerOffset = isChatOpen ? -168 : 0; // Adjusted for visual balance

	return (
		<motion.div
			initial={{ y: 100, opacity: 0 }}
			animate={{ y: 0, opacity: 1, x: `calc(-50% + ${centerOffset}px)` }}
			transition={{ type: "spring", stiffness: 300, damping: 30 }}
			className={cn(
				"fixed bottom-8 left-1/2 z-[100]",
				"h-14 min-w-[720px] max-w-[90vw]",
				"bg-[#f4f4f0] dark:bg-[#111111]",
				"rounded-sm shadow-2xl",
				"border border-neutral-200 dark:border-neutral-800",
				"flex items-center overflow-hidden",
			)}
		>
			<ContextSection />
			<CommandSection />
			<SystemSection />
		</motion.div>
	);
};
