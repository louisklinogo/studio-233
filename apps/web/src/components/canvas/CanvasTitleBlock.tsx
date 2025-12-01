"use client";

import React from "react";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { cn } from "@/lib/utils";

interface CanvasTitleBlockProps {
	projectId?: string;
	canvasWidth: number;
	canvasHeight: number;
	lastSavedAt?: number | null;
}

export function CanvasTitleBlock({
	projectId,
	canvasWidth,
	canvasHeight,
	lastSavedAt,
}: CanvasTitleBlockProps) {
	const title =
		projectId && projectId !== "undefined" && projectId !== "null"
			? projectId
			: "Untitled Canvas";

	const hasSize = canvasWidth > 0 && canvasHeight > 0;
	const sizeLabel = hasSize ? `${canvasWidth} × ${canvasHeight}` : "—";
	const aspectLabel = hasSize ? (canvasWidth / canvasHeight).toFixed(2) : "—";

	let lastSavedLabel = "—";
	if (lastSavedAt) {
		const d = new Date(lastSavedAt);
		lastSavedLabel = d.toLocaleTimeString(undefined, {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		});
	}

	return (
		<div
			className={cn(
				"pointer-events-auto",
				"flex flex-col gap-[1px]",
				"bg-neutral-200 dark:bg-neutral-800",
				"rounded-sm overflow-hidden",
				"min-w-[240px] max-w-xs",
				"border border-transparent dark:border-neutral-800 shadow-sm",
			)}
		>
			{/* Header / Title Plate */}
			<div className="bg-[#f4f4f0] dark:bg-[#111111] px-4 py-3 flex flex-col gap-0.5">
				<div className="flex items-center justify-between gap-3">
					<span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/70">
						STUDIO+233 / CANVAS
					</span>
					{/* Status Indicator - Precision LED look */}
					<div className="flex items-center gap-1.5">
						<div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[inset_0_1px_1px_rgba(0,0,0,0.1),0_0_4px_rgba(16,185,129,0.4)]" />
					</div>
				</div>
				<div className="text-sm font-bold text-foreground tracking-tight truncate">
					{title}
				</div>
			</div>

			{/* Technical Specs Plate */}
			<div className="bg-[#f4f4f0] dark:bg-[#111111] px-4 py-2.5 grid grid-cols-[60px_1fr] gap-y-1 text-[10px] font-mono leading-tight">
				<span className="uppercase text-muted-foreground/60 tracking-wider">
					DIM
				</span>
				<span className="text-foreground text-right tabular-nums tracking-wide">
					{sizeLabel} <span className="text-muted-foreground/40">px</span>
				</span>

				<span className="uppercase text-muted-foreground/60 tracking-wider">
					ASPECT
				</span>
				<span className="text-foreground text-right tabular-nums tracking-wide">
					{aspectLabel}
				</span>

				<span className="uppercase text-muted-foreground/60 tracking-wider">
					LAST MOD
				</span>
				<span className="text-foreground text-right tabular-nums tracking-wide">
					{lastSavedLabel}
				</span>
			</div>
		</div>
	);
}
