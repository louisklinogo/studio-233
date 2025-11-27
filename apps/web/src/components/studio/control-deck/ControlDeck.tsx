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
import React from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { cn } from "@/lib/utils";
import { ColorPickerPopover } from "../properties/ColorPickerPopover";
// Reuse existing selectors
import { FontSelector } from "../properties/FontSelector";
import { FontSizeSelector } from "../properties/FontSizeSelector";
import { DeckButton } from "./DeckButton";
import { DeckSlider } from "./DeckSlider";
import { PromptInput } from "./PromptInput";
import { StyleSelector } from "./StyleSelector";

interface ControlDeckProps {
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
}

export const ControlDeck: React.FC<ControlDeckProps> = ({
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
}) => {
	// Determine Selection Type
	const getSelectionContext = () => {
		// Priority 1: Selection
		if (selectedIds.length > 1) return "MULTI";
		if (selectedIds.length === 1) {
			const id = selectedIds[0];
			const image = images.find((i) => i.id === id);
			if (image) return "IMAGE";

			const video = videos.find((v) => v.id === id);
			if (video) return "VIDEO";

			const element = elements.find((e) => e.id === id);
			if (element) return element.type.toUpperCase(); // TEXT, SHAPE, DRAWING
		}

		// Priority 2: Active Tool (setting defaults)
		if (activeTool === "text") return "TEXT";
		if (activeTool === "shape") return "SHAPE";
		if (activeTool === "draw") return "DRAWING";

		// Priority 3: Global
		return "GLOBAL";
	};

	const context = getSelectionContext();
	const selectedElement = elements.find((e) => e.id === selectedIds[0]);
	const isToolMode = selectedIds.length === 0;

	// Helper for element updates (handles both Selection and Defaults)
	const updateProperty = (updates: any) => {
		if (!isToolMode && selectedIds.length === 1) {
			// Update selected element
			updateElement(selectedIds[0], updates);
		} else {
			// Update defaults based on context
			if (context === "TEXT" && setDefaultTextProps)
				setDefaultTextProps({ ...defaultTextProps, ...updates });
			if (context === "SHAPE" && setDefaultShapeProps)
				setDefaultShapeProps({ ...defaultShapeProps, ...updates });
			if (context === "DRAWING" && setDefaultDrawingProps)
				setDefaultDrawingProps({ ...defaultDrawingProps, ...updates });
		}
	};

	// --- UTILS ---
	const Separator = () => (
		<div className="w-[1px] h-6 bg-neutral-300 dark:bg-neutral-700 mx-[1px]" />
	);

	// --- ZONES ---

	const RunButton = () => (
		<DeckButton
			icon={
				isGenerating ? (
					<div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
				) : (
					<SwissIcons.Play />
				)
			}
			onClick={handleRun}
			disabled={isGenerating}
			tooltip="Run Generation"
			isActive={isGenerating}
		/>
	);

	const GlobalControls = () => (
		<>
			<RunButton />

			<Separator />

			<StyleSelector
				selectedStyleId={generationSettings.styleId || "simpsons"}
				onSelectStyle={(id) => {
					onUpdateSettings?.({ styleId: id });
				}}
			/>

			<Separator />

			<PromptInput
				value={generationSettings.prompt || ""}
				onChange={(val) => {
					onUpdateSettings?.({ prompt: val });
				}}
				onSubmit={handleRun}
			/>

			<Separator />

			<DeckButton
				icon={<SwissIcons.Undo />}
				onClick={undo}
				disabled={!canUndo}
				tooltip="Undo"
			/>
			<DeckButton
				icon={<SwissIcons.Redo />}
				onClick={redo}
				disabled={!canRedo}
				tooltip="Redo"
			/>
		</>
	);

	const ImageControls = () => (
		<>
			<RunButton />

			<Separator />

			<PromptInput
				value={generationSettings.prompt || ""}
				onChange={(val) => {
					onUpdateSettings?.({ prompt: val });
				}}
				onSubmit={handleRun}
				className="w-48"
			/>

			<Separator />

			<DeckButton
				icon={<SwissIcons.Crop />}
				onClick={() => setCroppingImageId(selectedIds[0])}
				tooltip="Crop"
			/>
			<DeckButton
				icon={<SwissIcons.Scissors />}
				onClick={handleRemoveBackground}
				tooltip="Remove Background"
			/>
			<DeckButton
				icon={<SwissIcons.Copy />}
				onClick={handleDuplicate}
				tooltip="Duplicate"
			/>

			{handleOpenIsolateDialog && (
				<DeckButton
					icon={<SwissIcons.Filter />} // Using Filter icon for Isolate as per context menu
					onClick={handleOpenIsolateDialog}
					tooltip="Isolate Object"
				/>
			)}

			{handleGeminiEdit && (
				<DeckButton
					icon={
						isGeminiEditing ? (
							<div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
						) : (
							<SwissIcons.Sparkles />
						)
					}
					onClick={handleGeminiEdit}
					disabled={isGeminiEditing}
					tooltip="Edit with Gemini"
				/>
			)}

			{handleConvertToVideo && (
				<DeckButton
					icon={<SwissIcons.Video />}
					onClick={() => handleConvertToVideo(selectedIds[0])}
					tooltip="Image to Video"
				/>
			)}

			<Separator />

			{/* Layers */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<DeckButton icon={<SwissIcons.Layers />} tooltip="Layer Order" />
				</DropdownMenuTrigger>
				<DropdownMenuContent
					side="top"
					align="center"
					className="w-32 rounded-sm"
				>
					<DropdownMenuItem onClick={sendToFront}>To Front</DropdownMenuItem>
					<DropdownMenuItem onClick={bringForward}>Forward</DropdownMenuItem>
					<DropdownMenuItem onClick={sendBackward}>Backward</DropdownMenuItem>
					<DropdownMenuItem onClick={sendToBack}>To Back</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<Separator />

			<DeckButton
				icon={<SwissIcons.Trash />}
				onClick={handleDelete}
				variant="danger"
				tooltip="Delete"
			/>
		</>
	);

	const TextControls = () => (
		<>
			{/* Font & Size - Compact Wrappers */}
			<div className="h-12 flex items-center px-1 bg-[#f4f4f0] dark:bg-[#111111]">
				<div className="w-32 scale-90 origin-left">
					<FontSelector
						value={
							isToolMode
								? defaultTextProps?.fontFamily
								: (selectedElement as TextElement)?.fontFamily
						}
						onChange={(val) => updateProperty({ fontFamily: val })}
					/>
				</div>
			</div>

			<Separator />

			<div className="h-12 flex items-center px-1 bg-[#f4f4f0] dark:bg-[#111111]">
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
			</div>

			<Separator />

			{/* Color */}
			<div className="h-12 flex items-center px-2 bg-[#f4f4f0] dark:bg-[#111111]">
				<ColorPickerPopover
					color={
						isToolMode
							? defaultTextProps?.fill
							: (selectedElement as TextElement)?.fill
					}
					onChange={(c) => updateProperty({ fill: c })}
				/>
			</div>

			<Separator />

			<DeckButton
				icon={<SwissIcons.Trash />}
				onClick={handleDelete}
				variant="danger"
				tooltip="Delete"
				disabled={isToolMode}
			/>
		</>
	);

	const ShapeControls = () => (
		<>
			{/* Style */}
			<div className="h-12 flex items-center gap-2 px-3 bg-[#f4f4f0] dark:bg-[#111111]">
				<ColorPickerPopover
					label="Fill"
					color={
						isToolMode
							? defaultShapeProps?.fill
							: (selectedElement as ShapeElement)?.fill
					}
					onChange={(c) => updateProperty({ fill: c })}
				/>
				<ColorPickerPopover
					label="Stroke"
					color={
						isToolMode
							? defaultShapeProps?.stroke
							: (selectedElement as ShapeElement)?.stroke
					}
					onChange={(c) => updateProperty({ stroke: c })}
				/>
			</div>

			<Separator />

			{/* Dimensions */}
			<DeckSlider
				value={[
					isToolMode
						? defaultShapeProps?.strokeWidth || 1
						: (selectedElement as ShapeElement)?.strokeWidth || 1,
				]}
				onValueChange={(v) => updateProperty({ strokeWidth: v[0] })}
				min={0}
				max={20}
				className="w-24"
			/>

			<Separator />

			<DeckButton
				icon={<SwissIcons.Trash />}
				onClick={handleDelete}
				variant="danger"
				tooltip="Delete"
				disabled={isToolMode}
			/>
		</>
	);

	const MultiControls = () => (
		<>
			<div className="h-12 flex items-center px-4 bg-[#f4f4f0] dark:bg-[#111111]">
				<span className="text-[10px] font-mono text-neutral-500">
					{selectedIds.length} Selected
				</span>
			</div>

			<Separator />

			<DeckButton
				icon={<SwissIcons.Combine />}
				onClick={handleCombineImages}
				tooltip="Combine"
				disabled={images.filter((i) => selectedIds.includes(i.id)).length < 2}
			/>
			<DeckButton
				icon={<SwissIcons.Trash />}
				onClick={handleDelete}
				variant="danger"
				tooltip="Delete"
			/>
		</>
	);

	// --- MAIN RENDER ---

	// Calculate dynamic center offset
	// Default: Shift right by 32px (half of CanvasPalette's 64px width) to visually center in available space
	// Chat Open: Shift left by 168px (half of ChatPanel's ~400px width minus the default offset)
	const centerOffset = isChatOpen ? -168 : 32;

	return (
		<motion.div
			initial={{ y: 20, opacity: 0, x: "-50%" }}
			animate={{
				y: 0,
				opacity: 1,
				x: `calc(-50% + ${centerOffset}px)`,
			}}
			transition={{ type: "spring", stiffness: 300, damping: 30 }}
			className={cn(
				"fixed bottom-6 left-1/2 z-40",
				// The Chassis
				"flex flex-row items-center h-12",
				"bg-neutral-200 dark:bg-neutral-800 rounded-sm shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-neutral-300 dark:border-neutral-700",
				"gap-[1px]", // The 1px grid gap key to the aesthetic
				"overflow-hidden",
			)}
		>
			<AnimatePresence mode="wait">
				<motion.div
					key={context}
					initial={{ opacity: 0, x: -5 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: 5 }}
					transition={{ duration: 0.1 }}
					className="flex items-center h-full"
				>
					{context === "GLOBAL" && <GlobalControls />}
					{context === "IMAGE" && <ImageControls />}
					{context === "TEXT" && <TextControls />}
					{context === "SHAPE" && <ShapeControls />}
					{context === "MULTI" && <MultiControls />}

					{/* Fallback */}
					{(context === "VIDEO" ||
						context === "DRAWING" ||
						context === "UNKNOWN") && (
						<div className="h-12 px-4 flex items-center justify-center bg-[#f4f4f0] dark:bg-[#111111]">
							<span className="text-[10px] font-mono text-neutral-400">
								NO CONTROLS
							</span>
						</div>
					)}
				</motion.div>
			</AnimatePresence>
		</motion.div>
	);
};
