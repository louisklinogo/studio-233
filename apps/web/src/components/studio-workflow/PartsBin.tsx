"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { cn } from "@/lib/utils";

// Types
type CategoryKey = "input" | "vision" | "gen" | "logic";

export function PartsBin() {
	const [isHovered, setIsHovered] = useState(false);
	const [activeCategory, setActiveCategory] = useState<CategoryKey | null>(
		null,
	);

	return (
		<motion.div
			className="flex flex-col gap-[1px] bg-neutral-200 dark:bg-neutral-800 shadow-2xl rounded-sm overflow-hidden"
			initial={{ width: "56px" }}
			animate={{ width: isHovered ? "240px" : "56px" }}
			transition={{ type: "spring", stiffness: 400, damping: 30 }}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => {
				setIsHovered(false);
				setActiveCategory(null);
			}}
		>
			{/* Chassis Background */}
			<div className="absolute inset-0 bg-[#f4f4f0] dark:bg-[#111111] -z-10" />

			{/* Tools Container */}
			<div className="flex flex-col gap-[1px] bg-neutral-200 dark:bg-neutral-800">
				{/* Header / Title */}
				<div className="h-10 flex items-center bg-[#f4f4f0] dark:bg-[#111111] px-0 relative">
					<div className="w-14 flex items-center justify-center">
						<SwissIcons.Box
							size={20}
							className="text-neutral-900 dark:text-white"
						/>
					</div>
					<AnimatePresence>
						{isHovered && (
							<motion.span
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -10 }}
								className="font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-0 whitespace-nowrap"
							>
								COMPONENT LIBRARY
							</motion.span>
						)}
					</AnimatePresence>
				</div>

				{/* CATEGORY: INPUT */}
				<CategoryRow
					icon={SwissIcons.Upload}
					label="INPUT SOURCES"
					isActive={activeCategory === "input"}
					isExpanded={isHovered}
					onClick={() =>
						setActiveCategory(activeCategory === "input" ? null : "input")
					}
				>
					<DraggableModule
						icon={<SwissIcons.File size={14} />}
						label="File Upload"
						type="input.upload"
					/>
					<DraggableModule
						icon={<SwissIcons.Globe size={14} />}
						label="Webhook"
						type="input.webhook"
					/>
					<DraggableModule
						icon={<SwissIcons.History size={14} />}
						label="Cron Schedule"
						type="input.cron"
					/>
				</CategoryRow>

				{/* CATEGORY: VISION */}
				<CategoryRow
					icon={SwissIcons.Eye}
					label="VISION PROCESSORS"
					isActive={activeCategory === "vision"}
					isExpanded={isHovered}
					onClick={() =>
						setActiveCategory(activeCategory === "vision" ? null : "vision")
					}
				>
					<DraggableModule
						icon={<SwissIcons.Crop size={14} />}
						label="Smart Crop"
						type="vision.crop"
					/>
					<DraggableModule
						icon={<SwissIcons.Scissors size={14} />}
						label="Remove Background"
						type="vision.removeBg"
					/>
					<DraggableModule
						icon={<SwissIcons.Filter size={14} />}
						label="Upscale Image"
						type="vision.upscale"
					/>
					<DraggableModule
						icon={<SwissIcons.Target size={14} />}
						label="Object Detect"
						type="vision.detect"
					/>
				</CategoryRow>

				{/* CATEGORY: GENERATION */}
				<CategoryRow
					icon={SwissIcons.Sparkles}
					label="AI GENERATION"
					isActive={activeCategory === "gen"}
					isExpanded={isHovered}
					onClick={() =>
						setActiveCategory(activeCategory === "gen" ? null : "gen")
					}
				>
					<DraggableModule
						icon={<SwissIcons.Image size={14} />}
						label="Flux Image Gen"
						type="gen.flux"
					/>
					<DraggableModule
						icon={<SwissIcons.Video size={14} />}
						label="Sora Video Gen"
						type="gen.sora"
					/>
				</CategoryRow>

				{/* CATEGORY: LOGIC */}
				<CategoryRow
					icon={SwissIcons.Combine}
					label="LOGIC & CONTROL"
					isActive={activeCategory === "logic"}
					isExpanded={isHovered}
					onClick={() =>
						setActiveCategory(activeCategory === "logic" ? null : "logic")
					}
				>
					<DraggableModule
						icon={<SwissIcons.GitBranch size={14} />}
						label="Router Switch"
						type="logic.router"
					/>
					<DraggableModule
						icon={<SwissIcons.Shuffle size={14} />}
						label="Gate (Pass/Fail)"
						type="logic.gate"
					/>
					<DraggableModule
						icon={<SwissIcons.Repeat size={14} />}
						label="Retry Loop"
						type="logic.loop"
					/>
				</CategoryRow>
			</div>
		</motion.div>
	);
}

function CategoryRow({
	icon: Icon,
	label,
	isActive,
	isExpanded,
	onClick,
	children,
}: {
	icon: any;
	label: string;
	isActive: boolean;
	isExpanded: boolean;
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col bg-[#f4f4f0] dark:bg-[#111111] overflow-hidden transition-colors hover:bg-white dark:hover:bg-[#1a1a1a]">
			<button
				onClick={onClick}
				className={cn(
					"h-14 flex items-center relative w-full text-left transition-colors",
					isActive ? "bg-white dark:bg-[#1a1a1a]" : "",
				)}
			>
				{/* Active Indicator (Recessed LED) */}
				<div className="absolute left-0 w-1 h-full flex items-center justify-center">
					{isActive && (
						<motion.div
							layoutId="activeCategory"
							className="w-1 h-14 bg-[#FF4D00] rounded-r-sm shadow-[0_0_8px_rgba(255,77,0,0.5)]"
						/>
					)}
				</div>

				{/* Icon */}
				<div className="absolute left-0 w-14 flex items-center justify-center">
					<Icon
						size={20}
						className={cn(
							"transition-colors",
							isActive
								? "text-neutral-900 dark:text-white"
								: "text-neutral-400",
						)}
					/>
				</div>

				{/* Label */}
				<AnimatePresence>
					{isExpanded && (
						<motion.div
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -10 }}
							className="ml-14 flex-1 flex items-center justify-between pr-4"
						>
							<span
								className={cn(
									"font-mono text-xs tracking-wider whitespace-nowrap",
									isActive
										? "text-neutral-900 dark:text-white font-bold"
										: "text-neutral-500",
								)}
							>
								{label}
							</span>
							<SwissIcons.ChevronDown
								size={12}
								className={cn(
									"text-neutral-400 transition-transform duration-200",
									isActive && "rotate-180",
								)}
							/>
						</motion.div>
					)}
				</AnimatePresence>
			</button>

			{/* Expanded Content (Modules) */}
			<AnimatePresence>
				{isActive && isExpanded && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						className="overflow-hidden bg-neutral-100 dark:bg-[#0a0a0a]"
					>
						<div className="p-2 flex flex-col gap-1 border-t border-neutral-200 dark:border-neutral-800">
							{children}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

function DraggableModule({
	icon,
	label,
	type,
}: {
	icon: React.ReactNode;
	label: string;
	type: string;
}) {
	const onDragStart = (event: React.DragEvent, nodeType: string) => {
		event.dataTransfer.setData("application/reactflow", nodeType);
		event.dataTransfer.effectAllowed = "move";
	};

	return (
		<div
			className="flex items-center gap-3 px-3 py-2 rounded-[2px] hover:bg-white dark:hover:bg-[#1A1A1A] border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 transition-all cursor-grab active:cursor-grabbing group select-none"
			draggable
			onDragStart={(event) => onDragStart(event, type)}
		>
			<div className="text-neutral-400 group-hover:text-[#FF4D00] transition-colors">
				{icon}
			</div>
			<span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
				{label}
			</span>
		</div>
	);
}
