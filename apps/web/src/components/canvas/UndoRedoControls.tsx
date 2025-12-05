"use client";

import React from "react";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { cn } from "@/lib/utils";

interface UndoRedoControlsProps {
	undo: () => void;
	redo: () => void;
	canUndo: boolean;
	canRedo: boolean;
}

export const UndoRedoControls: React.FC<UndoRedoControlsProps> = ({
	undo,
	redo,
	canUndo,
	canRedo,
}) => {
	return (
		<div className="absolute bottom-6 right-6 z-20 flex items-center gap-[1px] bg-neutral-200 dark:bg-neutral-800 rounded-sm shadow-xl border border-neutral-300 dark:border-neutral-700 overflow-hidden">
			<button
				type="button"
				onClick={undo}
				disabled={!canUndo}
				className={cn(
					"w-10 h-10 flex items-center justify-center transition-colors",
					"bg-[#f4f4f0] dark:bg-[#111111]",
					"text-neutral-500 dark:text-neutral-400",
					"hover:bg-white dark:hover:bg-[#1a1a1a] hover:text-neutral-900 dark:hover:text-white",
					"disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#f4f4f0] dark:disabled:hover:bg-[#111111] disabled:hover:text-neutral-500",
					"active:bg-neutral-100 dark:active:bg-black",
				)}
				title="Undo (Ctrl+Z)"
			>
				<SwissIcons.Undo size={16} strokeWidth={1.5} />
			</button>
			<button
				type="button"
				onClick={redo}
				disabled={!canRedo}
				className={cn(
					"w-10 h-10 flex items-center justify-center transition-colors",
					"bg-[#f4f4f0] dark:bg-[#111111]",
					"text-neutral-500 dark:text-neutral-400",
					"hover:bg-white dark:hover:bg-[#1a1a1a] hover:text-neutral-900 dark:hover:text-white",
					"disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#f4f4f0] dark:disabled:hover:bg-[#111111] disabled:hover:text-neutral-500",
					"active:bg-neutral-100 dark:active:bg-black",
				)}
				title="Redo (Ctrl+Y)"
			>
				<SwissIcons.Redo size={16} strokeWidth={1.5} />
			</button>
		</div>
	);
};
