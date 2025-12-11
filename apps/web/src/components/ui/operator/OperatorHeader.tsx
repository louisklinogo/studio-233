"use client";

import Link from "next/link";
import React from "react";
import type { OperatorMode } from "@/components/studio-workflow/StudioOperatorClient";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { cn } from "@/lib/utils";

interface OperatorHeaderProps {
	title?: string;
	mode: OperatorMode | "canvas" | "studio";
	setMode?: (mode: OperatorMode) => void;
	isLive?: boolean;
	setIsLive?: (live: boolean) => void;
	onTitleClick?: () => void;
	user?: {
		name: string | null;
		image?: string | null;
	};
}

export function OperatorHeader({
	title,
	mode,
	setMode,
	isLive,
	setIsLive,
	onTitleClick,
	user,
}: OperatorHeaderProps) {
	const modes: { id: OperatorMode; label: string }[] = [
		{ id: "build", label: "Build" },
		{ id: "run", label: "Run" },
		{ id: "data", label: "Data" },
	];

	return (
		<header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#f4f4f0] dark:bg-[#111111] border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center px-4 pointer-events-auto">
			{/* LEFT MODULE: Navigation & Context */}
			<div className="flex items-center gap-4">
				<Link
					href="/dashboard"
					className="flex items-center gap-1 text-xs font-mono text-neutral-500 hover:text-[#FF4D00] transition-colors uppercase tracking-wider"
				>
					<div className="w-3 h-3 flex items-center justify-center -rotate-90">
						<SwissIcons.ArrowDown size={12} />
					</div>
					Dashboard
				</Link>

				<div className="h-4 w-px bg-neutral-200 dark:border-neutral-800" />

				<button
					onClick={onTitleClick}
					className="flex items-center gap-2 group hover:bg-neutral-100 dark:hover:bg-neutral-800 px-2 py-1 rounded-[2px] transition-colors"
				>
					<span className="text-sm font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
						{title || "Untitled Workflow"}
					</span>
					<div className="text-neutral-400 group-hover:text-[#FF4D00] transition-colors">
						<SwissIcons.ChevronDown size={10} />
					</div>
				</button>
			</div>

			{/* CENTER MODULE: Mode Switch (Physical Toggle) */}
			{setMode && (
				<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
					<div className="flex items-center p-1 bg-neutral-200 dark:bg-neutral-900 rounded-[4px] border border-neutral-300 dark:border-neutral-800 shadow-inner">
						{modes.map((m) => (
							<button
								key={m.id}
								onClick={() => setMode(m.id)}
								className={cn(
									"relative px-4 py-1.5 text-xs font-mono font-medium uppercase tracking-wide rounded-[2px] transition-all duration-200",
									mode === m.id
										? "bg-white dark:bg-[#222] text-[#FF4D00] shadow-sm ring-1 ring-black/5 dark:ring-white/5"
										: "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300",
								)}
							>
								{/* Active Indicator LED */}
								{mode === m.id && (
									<span className="absolute top-1.5 right-1.5 w-1 h-1 bg-[#FF4D00] rounded-full shadow-[0_0_4px_#FF4D00]" />
								)}
								{m.label}
							</button>
						))}
					</div>
				</div>
			)}

			{/* RIGHT MODULE: System & Status */}
			<div className="flex items-center gap-4">
				{/* Version Toggle */}
				{setIsLive && (
					<div className="flex items-center gap-2 mr-2">
						<span
							className={cn(
								"text-[10px] font-mono uppercase tracking-widest transition-colors",
								!isLive
									? "text-neutral-900 dark:text-white"
									: "text-neutral-400",
							)}
						>
							Draft
						</span>
						<button
							onClick={() => setIsLive(!isLive)}
							className={cn(
								"w-10 h-5 rounded-full relative transition-colors duration-300 focus:outline-none border border-neutral-300 dark:border-neutral-700 shadow-inner",
								isLive ? "bg-[#FF4D00]" : "bg-neutral-200 dark:bg-neutral-800",
							)}
						>
							<div
								className={cn(
									"absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-md transition-transform duration-300",
									isLive ? "translate-x-5" : "translate-x-0",
								)}
							/>
						</button>
						<span
							className={cn(
								"text-[10px] font-mono uppercase tracking-widest transition-colors",
								isLive
									? "text-[#FF4D00] font-bold shadow-[#FF4D00]"
									: "text-neutral-400",
							)}
						>
							Live
						</span>
					</div>
				)}

				<div className="h-4 w-px bg-neutral-200 dark:border-neutral-800" />

				{/* Cost Meter */}
				<div className="hidden md:flex flex-col items-end">
					<span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest">
						Est. Cost
					</span>
					<span className="text-xs font-mono text-neutral-900 dark:text-neutral-200">
						450 CR
					</span>
				</div>

				<button className="w-8 h-8 flex items-center justify-center rounded-[2px] bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-[#FF4D00] transition-colors group">
					{/* Placeholder for User Icon - Using simple circle for now until SwissIcons has User/Profile */}
					<div className="w-4 h-4 rounded-full border border-neutral-500 group-hover:border-[#FF4D00]" />
				</button>
			</div>
		</header>
	);
}
