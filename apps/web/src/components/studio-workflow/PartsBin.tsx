"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { cn } from "@/lib/utils";

// Types
type CategoryKey = "input" | "vision" | "gen" | "logic";

const CATEGORIES = {
	input: {
		label: "INPUT",
		icon: SwissIcons.Upload,
		modules: [
			{ label: "File Upload", type: "input.upload", icon: SwissIcons.File },
			{ label: "Webhook", type: "input.webhook", icon: SwissIcons.Globe },
			{ label: "Cron Schedule", type: "input.cron", icon: SwissIcons.History },
		],
	},
	vision: {
		label: "VISION",
		icon: SwissIcons.Eye,
		modules: [
			{ label: "Smart Crop", type: "vision.crop", icon: SwissIcons.Crop },
			{
				label: "Remove BG",
				type: "vision.removeBg",
				icon: SwissIcons.Scissors,
			},
			{ label: "Upscale", type: "vision.upscale", icon: SwissIcons.Filter },
			{
				label: "Object Detect",
				type: "vision.detect",
				icon: SwissIcons.Target,
			},
		],
	},
	gen: {
		label: "GENERATE",
		icon: SwissIcons.Sparkles,
		modules: [
			{ label: "Flux Image", type: "gen.flux", icon: SwissIcons.Image },
			{ label: "Sora Video", type: "gen.sora", icon: SwissIcons.Video },
		],
	},
	logic: {
		label: "LOGIC",
		icon: SwissIcons.Combine,
		modules: [
			{ label: "Router", type: "logic.router", icon: SwissIcons.GitBranch },
			{ label: "Gate", type: "logic.gate", icon: SwissIcons.Shuffle },
			{ label: "Loop", type: "logic.loop", icon: SwissIcons.Repeat },
		],
	},
};

export function PartsBin() {
	const [activeCategory, setActiveCategory] = useState<CategoryKey | null>(
		null,
	);
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

	return (
		<div
			className="flex gap-4 items-start"
			onMouseLeave={() => {
				setActiveCategory(null);
				setIsHovered(false);
			}}
		>
			{/* Primary Spine (The Rack) */}
			<motion.div
				className="flex flex-col gap-[1px] bg-neutral-200 dark:bg-neutral-800 shadow-2xl rounded-sm overflow-hidden"
				initial={{ width: "56px" }}
				animate={{ width: isHovered || activeCategory ? "220px" : "56px" }}
				transition={{ type: "spring", stiffness: 400, damping: 30 }}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				{/* Chassis Background */}
				<div className="absolute inset-0 bg-[#f4f4f0] dark:bg-[#111111] -z-10" />

				{/* Header / Brand */}
				<div className="h-14 flex items-center justify-center bg-[#f4f4f0] dark:bg-[#111111] relative shrink-0">
					<div className="absolute left-0 w-14 flex items-center justify-center">
						<div className="w-2 h-2 bg-[#FF4D00] rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]" />
					</div>
					<AnimatePresence>
						{isHovered && (
							<motion.span
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -10 }}
								className="font-black text-sm tracking-tighter uppercase ml-10 whitespace-nowrap text-neutral-900 dark:text-neutral-100"
							>
								Studio+233
							</motion.span>
						)}
					</AnimatePresence>
				</div>

				{/* Category Buttons */}
				<div className="flex flex-col gap-[1px] bg-neutral-200 dark:bg-neutral-800">
					{(Object.keys(CATEGORIES) as CategoryKey[]).map((key) => {
						const cat = CATEGORIES[key];
						const isActive = activeCategory === key;
						const Icon = cat.icon;

						return (
							<button
								key={key}
								onMouseEnter={() => setActiveCategory(key)}
								className={cn(
									"h-14 flex items-center relative group transition-colors w-full",
									isActive
										? "bg-white dark:bg-[#1a1a1a]"
										: "bg-[#f4f4f0] dark:bg-[#111111] hover:bg-white dark:hover:bg-[#1a1a1a]",
								)}
							>
								{/* Active Indicator */}
								<div className="absolute left-0 w-1 h-full flex items-center justify-center">
									{isActive && (
										<motion.div
											layoutId="activeNav"
											className="w-1 h-8 bg-[#FF4D00] rounded-r-sm shadow-[0_0_8px_rgba(255,77,0,0.5)]"
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
												? "text-[#FF4D00]"
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
											className={`font-mono text-xs tracking-wider ml-14 whitespace-nowrap ${isActive ? "text-neutral-900 dark:text-white font-bold" : "text-neutral-500"}`}
										>
											{cat.label}
										</motion.span>
									)}
								</AnimatePresence>
							</button>
						);
					})}
				</div>

				{/* Spacer / Divider */}
				<div className="h-[1px] bg-neutral-200 dark:bg-neutral-800" />

				{/* Theme Toggle */}
				<button
					onClick={toggleTheme}
					className="h-14 flex items-center relative group hover:bg-white dark:hover:bg-[#1a1a1a] transition-colors w-full text-left bg-[#f4f4f0] dark:bg-[#111111]"
				>
					<div className="absolute left-0 w-14 flex items-center justify-center">
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
								className="font-mono text-xs tracking-wider ml-14 whitespace-nowrap text-neutral-500 flex items-center gap-3"
							>
								{theme === "dark" ? "LIGHT_MODE" : "DARK_MODE"}
								{mounted && (
									<motion.div
										initial={{ opacity: 0, x: 8 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: 8 }}
										transition={{ duration: 0.2 }}
										className="relative w-12 h-6 bg-[#e5e5e5] dark:bg-[#2a2a2a] border border-neutral-300 dark:border-neutral-700 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)]"
									>
										<div className="absolute top-1/2 left-2 right-2 h-px bg-neutral-300 dark:bg-neutral-600" />
										<motion.div
											className="absolute top-[2px] bottom-[2px] w-5 bg-[#f0f0f0] dark:bg-[#3a3a3a] border border-neutral-300 dark:border-neutral-600 shadow-[0_1px_2px_rgba(0,0,0,0.1)] flex items-center justify-center"
											animate={{
												left: theme === "dark" ? "calc(100% - 22px)" : "2px",
											}}
											transition={{
												type: "spring",
												stiffness: 600,
												damping: 35,
											}}
										>
											<div className="w-[2px] h-3 bg-[#FF4D00]" />
										</motion.div>
									</motion.div>
								)}
							</motion.span>
						)}
					</AnimatePresence>
				</button>

				{/* System Status Footer */}
				<div className="h-14 flex items-center relative bg-[#f4f4f0] dark:bg-[#111111] border-t border-neutral-200 dark:border-neutral-800 shrink-0">
					<div className="absolute left-0 w-14 flex items-center justify-center">
						<div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-800 rounded-sm flex items-center justify-center border border-neutral-300 dark:border-neutral-700">
							<div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
						</div>
					</div>
					<AnimatePresence>
						{isHovered && (
							<motion.span
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -10 }}
								className="font-mono text-xs tracking-wider ml-14 whitespace-nowrap text-neutral-500"
							>
								SYSTEM ACTIVE
							</motion.span>
						)}
					</AnimatePresence>
				</div>
			</motion.div>

			{/* Flyout Panel (The Drawer) */}
			<AnimatePresence>
				{activeCategory && (
					<motion.div
						initial={{ opacity: 0, x: -10, scale: 0.95 }}
						animate={{ opacity: 1, x: 0, scale: 1 }}
						exit={{ opacity: 0, x: -10, scale: 0.95 }}
						transition={{ duration: 0.15, ease: "easeOut" }}
						className="bg-[#f4f4f0] dark:bg-[#111111] border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-sm p-1 min-w-[180px]"
					>
						<div className="px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 mb-1">
							<span className="font-mono text-[10px] tracking-widest uppercase text-neutral-500">
								{CATEGORIES[activeCategory].label}
							</span>
						</div>

						<div className="flex flex-col gap-1 p-1">
							{CATEGORIES[activeCategory].modules.map((mod) => (
								<DraggableModule
									key={mod.type}
									icon={<mod.icon size={14} />}
									label={mod.label}
									type={mod.type}
								/>
							))}
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
			className="flex items-center gap-3 px-3 py-2 rounded-[2px] bg-white dark:bg-[#151515] border border-neutral-200 dark:border-neutral-800 hover:border-[#FF4D00] hover:shadow-md transition-all cursor-grab active:cursor-grabbing group select-none"
			draggable
			onDragStart={(event) => onDragStart(event, type)}
		>
			<div className="text-neutral-400 group-hover:text-[#FF4D00] transition-colors">
				{icon}
			</div>
			<span className="text-xs font-mono font-medium text-neutral-600 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
				{label}
			</span>
		</div>
	);
}
