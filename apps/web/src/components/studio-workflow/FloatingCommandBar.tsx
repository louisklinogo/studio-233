"use client";

import { motion } from "framer-motion";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { cn } from "@/lib/utils";
import type { OperatorMode } from "./StudioOperatorClient";

interface FloatingCommandBarProps {
	mode: OperatorMode;
}

export function FloatingCommandBar({ mode }: FloatingCommandBarProps) {
	if (mode !== "build") return null;

	return (
		<motion.div
			initial={{ y: 100, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			exit={{ y: 100, opacity: 0 }}
			transition={{ type: "spring", stiffness: 300, damping: 25 }}
			className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-1.5 bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 rounded-[8px] shadow-lg shadow-black/5"
		>
			<CommandButton
				icon={<SwissIcons.Plus size={16} />}
				label="Add Node"
				shortcut="A"
				primary
			/>
			<div className="w-px h-6 bg-neutral-200 dark:bg-neutral-800 mx-1" />
			<CommandButton
				icon={<SwissIcons.Maximize size={16} />}
				label="Fit View"
				shortcut="F"
			/>
			<CommandButton
				icon={<SwissIcons.Undo size={16} />}
				label="Undo"
				shortcut="Z"
			/>
			<CommandButton
				icon={<SwissIcons.Redo size={16} />}
				label="Redo"
				shortcut="Y"
			/>
			<div className="w-px h-6 bg-neutral-200 dark:bg-neutral-800 mx-1" />
			<CommandButton
				icon={<SwissIcons.Play size={16} />}
				label="Test Run"
				shortcut="R"
				accent
			/>
		</motion.div>
	);
}

interface CommandButtonProps {
	icon: React.ReactNode;
	label: string;
	shortcut?: string;
	primary?: boolean;
	accent?: boolean;
}

function CommandButton({
	icon,
	label,
	shortcut,
	primary,
	accent,
}: CommandButtonProps) {
	return (
		<button
			className={cn(
				"group relative flex items-center justify-center w-9 h-9 rounded-[4px] transition-all duration-200",
				primary
					? "bg-neutral-900 dark:bg-white text-white dark:text-black shadow-md hover:scale-105"
					: accent
						? "bg-[#FF4D00] text-white shadow-md shadow-[#FF4D00]/20 hover:scale-105 hover:bg-[#FF6D00]"
						: "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200",
			)}
			title={label}
		>
			{icon}
			{shortcut && (
				<span className="absolute -bottom-6 text-[9px] font-mono text-neutral-400 bg-white dark:bg-black px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
					{label} <span className="opacity-50 ml-1">⌘{shortcut}</span>
				</span>
			)}
		</button>
	);
}
