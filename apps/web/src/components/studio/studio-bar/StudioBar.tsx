"use client";

import type {
	CanvasElement,
	GenerationSettings,
	PlacedImage,
	PlacedVideo,
	ShapeElement,
	TextElement,
} from "@studio233/canvas";
import { motion } from "framer-motion";
import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { cn } from "@/lib/utils";
import { StyleSelector } from "../control-deck/StyleSelector"; // Reusing for now
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

	// Tool Defaults (now managed by ToolPropertiesBar)
	activeTool?: string;
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
	isChatOpen,
	onExpandInput,
	onMicInput,
}) => {
	const toolbarRef = useRef<HTMLDivElement>(null);
	const promptInputRef = useRef<HTMLInputElement>(null);
	const styleTriggerRef = useRef<HTMLButtonElement>(null);
	const promptHintId = useId();
	const selectionHintId = useId();
	const [contextAnnouncement, setContextAnnouncement] =
		useState("Studio ready");

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
	const hasSelection = selectedIds.length > 0;

	const contextDescription = useMemo(() => {
		switch (context) {
			case "IMAGE":
				return "Image selection controls ready";
			case "TEXT":
				return "Text selection controls ready";
			case "SHAPE":
				return "Shape selection controls ready";
			case "VIDEO":
				return "Video selection controls ready";
			case "MULTI":
				return `Multiple elements selected (${selectedIds.length})`;
			default:
				return "Studio context active";
		}
	}, [context, selectedIds.length]);

	useEffect(() => {
		setContextAnnouncement(contextDescription);
	}, [contextDescription]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			const isMeta = event.metaKey || event.ctrlKey;
			const isTypingTarget = (() => {
				const target = event.target as HTMLElement | null;
				if (!target) return false;
				const tag = target.tagName?.toLowerCase();
				return (
					tag === "input" || tag === "textarea" || target.isContentEditable
				);
			})();

			if (isMeta && event.key === "Enter") {
				event.preventDefault();
				if (!isGenerating) handleRun();
				return;
			}

			if (isMeta && event.key.toLowerCase() === "z" && !event.shiftKey) {
				event.preventDefault();
				undo?.();
				return;
			}

			if (isMeta && event.key.toLowerCase() === "z" && event.shiftKey) {
				event.preventDefault();
				redo?.();
				return;
			}

			if (!isMeta && !event.altKey && !event.ctrlKey && !event.repeat) {
				if (
					event.key === ";" &&
					(!isTypingTarget || event.target === promptInputRef.current)
				) {
					event.preventDefault();
					promptInputRef.current?.focus();
					return;
				}
				if (event.key === "/" && !isTypingTarget) {
					event.preventDefault();
					styleTriggerRef.current?.focus();
				}
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [handleRun, isGenerating, redo, undo]);

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
		ariaLabel,
	}: {
		icon: any;
		label?: string;
		onClick: () => void;
		disabled?: boolean;
		isActive?: boolean;
		variant?: "default" | "danger" | "accent";
		ariaLabel?: string;
	}) => (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			aria-label={ariaLabel || label || "Canvas action"}
			title={label}
			className={cn(
				"h-10 md:h-full px-2 md:px-3 flex items-center gap-2 transition-colors relative group text-xs font-mono uppercase tracking-wide",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#FF4D00]",
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
						"text-[10px]",
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
		<div
			className="flex items-center justify-between px-4 min-w-[160px] border-r border-neutral-200 dark:border-neutral-800"
			role="group"
			aria-label="Selection context"
		>
			<div>
				<p className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
					{context === "GLOBAL" ? "Studio" : context}
				</p>
				<p className="text-[11px] text-neutral-400 dark:text-neutral-500">
					{hasSelection
						? `${selectedIds.length} item${selectedIds.length > 1 ? "s" : ""} selected`
						: "No selection"}
				</p>
			</div>
			{hasSelection && (
				<span className="ml-2 px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-[9px] font-mono text-neutral-600 dark:text-neutral-300">
					{selectedIds.length}
				</span>
			)}
		</div>
	);

	// 2. COMMAND (Center)
	const CommandSection = () => (
		<div
			className="flex-1 h-full min-w-0 flex items-center overflow-hidden relative px-2"
			role="group"
			aria-label="Generation controls"
			aria-describedby={promptHintId}
		>
			<StudioBarInput
				value={generationSettings.prompt || ""}
				onChange={(val) => onUpdateSettings?.({ prompt: val })}
				onSubmit={handleRun}
				isGenerating={isGenerating}
				onExpand={onExpandInput}
				onMic={onMicInput}
				inputRef={promptInputRef}
				ariaDescribedBy={promptHintId}
			/>
			<Separator />
			<div className="px-2 flex-shrink-0">
				<StyleSelector
					selectedStyleId={generationSettings.styleId || "simpsons"}
					onSelectStyle={(id) => onUpdateSettings?.({ styleId: id })}
					triggerRef={styleTriggerRef}
					ariaLabel="Open style presets"
				/>
			</div>
			<Separator />
			<ActionButton
				icon={isGenerating ? SwissIcons.Spinner : SwissIcons.Play}
				onClick={handleRun}
				disabled={isGenerating}
				variant="accent"
				label="Run"
				ariaLabel="Run generation"
			/>
		</div>
	);

	const SelectionSection = () => (
		<div
			className="min-w-[320px] h-full border-l border-neutral-200 dark:border-neutral-800 flex items-center px-2 overflow-x-auto no-scrollbar gap-1"
			role="group"
			aria-label="Selection actions"
			aria-describedby={selectionHintId}
		>
			{!hasSelection ? (
				<span className="text-[11px] text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
					Select an element to unlock contextual controls
				</span>
			) : (
				<div className="flex items-center gap-1 min-w-max" aria-live="polite">
					<span className="text-[11px] text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
						{context} selection active
					</span>
				</div>
			)}
		</div>
	);
	// 3. SYSTEM (Right)
	const SystemSection = () => (
		<div
			className="flex items-center h-full px-2 border-l border-neutral-200 dark:border-neutral-800 gap-1"
			role="group"
			aria-label="History controls"
		>
			<ActionButton
				icon={SwissIcons.Undo}
				onClick={undo || (() => {})}
				disabled={!canUndo}
				label="Undo"
			/>
			<ActionButton
				icon={SwissIcons.Redo}
				onClick={redo || (() => {})}
				disabled={!canRedo}
				label="Redo"
			/>
		</div>
	);

	// --- RENDER ---
	const centerOffset = isChatOpen ? -168 : 0; // Adjusted for visual balance

	const promptHintText =
		"Press ; to focus the prompt, / to open styles, Command or Control plus Enter to run.";
	const selectionHintText = hasSelection
		? contextDescription
		: "Select any canvas layer to reveal contextual actions.";

	return (
		<motion.div
			ref={toolbarRef}
			role="toolbar"
			aria-label="Studio controls"
			initial={{ y: 100, opacity: 0 }}
			animate={{ y: 0, opacity: 1, x: `calc(-50% + ${centerOffset}px)` }}
			transition={{ type: "spring", stiffness: 300, damping: 30 }}
			className={cn(
				"fixed bottom-8 left-1/2 z-[100]",
				"h-16 min-w-[720px] w-[min(95vw,1200px)]",
				"rounded-sm shadow-chamfer",
				"border border-neutral-200/80 dark:border-neutral-800/80",
				"flex items-center overflow-hidden",
			)}
		>
			<div className="absolute inset-0 bg-[#f0ede3] dark:bg-[#111111] bg-noise opacity-95 -z-10 pointer-events-none" />

			<ContextSection />
			<div className="flex flex-1 h-full min-w-0 items-stretch">
				<CommandSection />
				<SelectionSection />
			</div>
			<SystemSection />
			<p id={promptHintId} className="sr-only">
				{promptHintText}
			</p>
			<p id={selectionHintId} className="sr-only">
				{selectionHintText}
			</p>
			<span className="sr-only" role="status" aria-live="polite">
				{contextAnnouncement}
			</span>
		</motion.div>
	);
};
