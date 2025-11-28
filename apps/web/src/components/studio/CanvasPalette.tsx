"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "next-themes";
import React, { forwardRef, useEffect, useState } from "react";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { cn } from "@/lib/utils";

export type ToolType = "select" | "pan" | "text" | "shape" | "draw" | "add";

interface CanvasPaletteProps {
	activeTool?: ToolType;
	setActiveTool: (tool: ToolType) => void;
	onAddClick: () => void;
	onUploadImage: () => void;
	onUploadVideo: () => void;
	onOpenImageGenerator: () => void;
	onOpenVideoGenerator: () => void;
	onAddFrame: () => void;
	undo?: () => void;
	redo?: () => void;
	canUndo?: boolean;
	canRedo?: boolean;
}

// Helper to render a tool row
const ToolRow = forwardRef<
	HTMLButtonElement,
	{
		icon: any;
		label: string;
		isActive?: boolean;
		onClick: () => void;
		shortcut?: string;
		disabled?: boolean;
		isHovered: boolean;
	}
>(
	(
		{
			icon: Icon,
			label,
			isActive,
			onClick,
			shortcut,
			disabled = false,
			isHovered,
			...props
		},
		ref,
	) => (
		<button
			ref={ref}
			onClick={onClick}
			disabled={disabled}
			{...props}
			className={cn(
				`h-12 flex items-center relative group transition-colors w-full text-left bg-[#f4f4f0] dark:bg-[#111111]`,
				isActive
					? "bg-white dark:bg-[#1a1a1a]"
					: "hover:bg-white dark:hover:bg-[#1a1a1a]",
				disabled ? "opacity-50 cursor-not-allowed" : "",
			)}
		>
			{/* Active Indicator (Recessed LED) */}
			<div className="absolute left-0 w-1 h-full flex items-center justify-center">
				{isActive && (
					<motion.div
						layoutId="activeTool"
						className="w-1 h-8 bg-[#FF4D00] rounded-r-sm shadow-[0_0_8px_rgba(255,77,0,0.5)]"
					/>
				)}
			</div>

			{/* Icon */}
			<div className="absolute left-0 w-12 flex items-center justify-center">
				<Icon
					size={20}
					className={cn(
						"transition-colors",
						isActive
							? "text-neutral-900 dark:text-white"
							: "text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300",
					)}
				/>
			</div>

			{/* Label */}
			<AnimatePresence>
				{isHovered && (
					<motion.span
						initial={{ opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -10 }}
						className={cn(
							"font-mono text-xs tracking-wider ml-12 whitespace-nowrap flex items-center gap-2",
							isActive
								? "text-neutral-900 dark:text-white font-bold"
								: "text-neutral-500",
						)}
					>
						{label}
						{shortcut && (
							<span className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-[9px] text-neutral-500 dark:text-neutral-400">
								{shortcut}
							</span>
						)}
					</motion.span>
				)}
			</AnimatePresence>
		</button>
	),
);
ToolRow.displayName = "ToolRow";

export function CanvasPalette({
	activeTool,
	setActiveTool,
	onAddClick,
	onUploadImage,
	onUploadVideo,
	onOpenImageGenerator,
	onOpenVideoGenerator,
	onAddFrame,
	undo,
	redo,
	canUndo,
	canRedo,
}: CanvasPaletteProps) {
	const [isHovered, setIsHovered] = useState(false);
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const playClickSound = () => {
		const AudioContext =
			window.AudioContext || (window as any).webkitAudioContext;
		if (!AudioContext) return;

		const ctx = new AudioContext();
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();

		osc.connect(gain);
		gain.connect(ctx.destination);

		osc.type = "square";
		osc.frequency.setValueAtTime(150, ctx.currentTime);
		osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);

		gain.gain.setValueAtTime(0.1, ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

		osc.start(ctx.currentTime);
		osc.stop(ctx.currentTime + 0.1);
	};

	const toggleTheme = () => {
		playClickSound();
		const nextTheme = theme === "dark" ? "light" : "dark";

		// @ts-ignore
		if (!document.startViewTransition) {
			setTheme(nextTheme);
			return;
		}

		const x = window.innerWidth / 2;
		const y = window.innerHeight / 2;
		const endRadius = Math.hypot(
			Math.max(x, innerWidth - x),
			Math.max(y, innerHeight - y),
		);

		// @ts-ignore
		const transition = document.startViewTransition(async () => {
			setTheme(nextTheme);
		});

		transition.ready.then(() => {
			const clipPath = [
				`circle(0px at ${x}px ${y}px)`,
				`circle(${endRadius}px at ${x}px ${y}px)`,
			];
			document.documentElement.animate(
				{ clipPath },
				{
					duration: 800,
					easing: "ease-in-out",
					pseudoElement: "::view-transition-new(root)",
				},
			);
		});
	};

	const handleToolClick = (action: () => void) => {
		playClickSound();
		action();
	};

	return (
		<motion.div
			className="fixed left-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-[1px] bg-neutral-200 dark:bg-neutral-800 shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-neutral-300 dark:border-neutral-700 rounded-sm overflow-hidden"
			initial={{ width: "48px" }}
			animate={{ width: isHovered ? "200px" : "48px" }}
			transition={{ type: "spring", stiffness: 300, damping: 30 }}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{/* Chassis Background */}
			<div className="absolute inset-0 bg-[#f4f4f0] dark:bg-[#111111] -z-10" />

			{/* Tools Container */}
			<div className="flex flex-col gap-[1px] bg-neutral-200 dark:bg-neutral-800">
				{/* Add Content (Direct) */}
				<ToolRow
					icon={SwissIcons.Plus}
					label="ADD CONTENT"
					isActive={false}
					onClick={() => handleToolClick(onAddClick)}
					isHovered={isHovered}
				/>

				{/* Primary Tools */}
				<ToolRow
					icon={SwissIcons.Cursor}
					label="SELECT"
					isActive={activeTool === "select"}
					onClick={() => handleToolClick(() => setActiveTool("select"))}
					shortcut="V"
					isHovered={isHovered}
				/>
				<ToolRow
					icon={SwissIcons.Hand}
					label="PAN"
					isActive={activeTool === "pan"}
					onClick={() => handleToolClick(() => setActiveTool("pan"))}
					shortcut="H"
					isHovered={isHovered}
				/>

				{/* Creation Tools */}
				<ToolRow
					icon={SwissIcons.Type}
					label="TEXT"
					isActive={activeTool === "text"}
					onClick={() => handleToolClick(() => setActiveTool("text"))}
					shortcut="T"
					isHovered={isHovered}
				/>
				<ToolRow
					icon={SwissIcons.Shape}
					label="SHAPES"
					isActive={activeTool === "shape"}
					onClick={() => handleToolClick(() => setActiveTool("shape"))}
					shortcut="R"
					isHovered={isHovered}
				/>
				<ToolRow
					icon={SwissIcons.Edit}
					label="DRAW"
					isActive={activeTool === "draw"}
					onClick={() => handleToolClick(() => setActiveTool("draw"))}
					shortcut="P"
					isHovered={isHovered}
				/>
			</div>

			{/* System Controls */}
			<div className="flex flex-col gap-[1px] bg-neutral-200 dark:bg-neutral-800 mt-[1px]">
				{/* Theme Toggle */}
				<button
					onClick={toggleTheme}
					className="h-12 flex items-center relative group hover:bg-white dark:hover:bg-[#1a1a1a] transition-colors w-full text-left bg-[#f4f4f0] dark:bg-[#111111]"
				>
					<div className="absolute left-0 w-12 flex items-center justify-center">
						<SwissIcons.Contrast
							size={20}
							className="text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors"
						/>
					</div>
					<AnimatePresence>
						{isHovered && (
							<motion.span
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -10 }}
								className="font-mono text-xs tracking-wider ml-12 whitespace-nowrap text-neutral-500 flex items-center gap-3"
							>
								{theme === "dark" ? "LIGHT_MODE" : "DARK_MODE"}
								{mounted && (
									<motion.div
										initial={{ opacity: 0, x: 8 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: 8 }}
										transition={{ duration: 0.2 }}
										className="relative w-10 h-5 bg-[#e5e5e5] dark:bg-[#2a2a2a] border border-neutral-300 dark:border-neutral-700 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]"
									>
										<div className="absolute top-1/2 left-1.5 right-1.5 h-px bg-neutral-300 dark:bg-neutral-600" />
										<motion.div
											className="absolute top-[2px] bottom-[2px] w-4 bg-[#f0f0f0] dark:bg-[#3a3a3a] border border-neutral-300 dark:border-neutral-600 shadow-[0_1px_2px_rgba(0,0,0,0.1)] flex items-center justify-center"
											animate={{
												left: theme === "dark" ? "calc(100% - 18px)" : "2px",
											}}
											transition={{
												type: "spring",
												stiffness: 600,
												damping: 35,
											}}
										>
											<div className="w-[2px] h-2.5 bg-[#FF4D00]" />
										</motion.div>
									</motion.div>
								)}
							</motion.span>
						)}
					</AnimatePresence>
				</button>
			</div>
		</motion.div>
	);
}
