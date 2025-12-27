"use client";

import { Handle, type Node, type NodeProps, Position } from "@xyflow/react";
import { useState } from "react";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { cn } from "@/lib/utils";

// Types for node data
export type StandardNodeData = {
	label: string;
	status?: "idle" | "running" | "success" | "error";
	config?: Record<string, unknown>;
	category?: string;
	onDelete?: () => void;
	onDuplicate?: () => void;
};

export type StandardFlowNode = Node<StandardNodeData, "standard">;

export function StandardNode({
	id,
	data,
	selected,
}: NodeProps<StandardFlowNode>) {
	const [isHovered, setIsHovered] = useState(false);

	// Status Colors
	const statusColor =
		data.status === "running"
			? "bg-[#FFB800] shadow-[0_0_8px_#FFB800]"
			: data.status === "success"
				? "bg-[#00C040] shadow-[0_0_8px_#00C040]"
				: data.status === "error"
					? "bg-[#E03C31] shadow-[0_0_8px_#E03C31]"
					: "bg-neutral-400 dark:bg-neutral-600";

	// Header Colors based on category
	const headerColor =
		data.category === "input"
			? "bg-neutral-800 text-white"
			: data.category === "output"
				? "bg-neutral-900 text-white"
				: data.category === "generation"
					? "bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white"
					: "bg-white dark:bg-[#222] text-neutral-900 dark:text-white"; // process/default

	return (
		<div
			className={cn(
				"group relative min-w-[180px] rounded-[1px] border transition-all duration-200 shadow-sm overflow-hidden",
				"bg-[#f4f4f0] dark:bg-[#111111]", // Surface matches canvas
				selected
					? "border-[#FF4400] shadow-[0_0_10px_rgba(255,68,0,0.1)]"
					: "border-neutral-300 dark:border-neutral-700 hover:border-neutral-400",
			)}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{/* Industrial Detail: Top Speaker Grill (Left) */}
			<div className="absolute top-1 left-2 flex gap-0.5 opacity-20">
				{[...Array(4)].map((_, i) => (
					<div key={i} className="w-0.5 h-0.5 rounded-full bg-black" />
				))}
			</div>

			{/* MANUAL FLOATING TOOLBAR */}
			{selected && (
				<div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white dark:bg-[#1a1a1a] p-1 rounded-full border border-neutral-200 dark:border-neutral-800 shadow-xl z-50">
					<button
						onClick={(e) => {
							e.stopPropagation();
							data.onDuplicate?.();
						}}
						className="w-6 h-6 flex items-center justify-center rounded-full transition-colors text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
						title="Duplicate"
					>
						<SwissIcons.Copy size={10} />
					</button>
					<div className="w-[1px] h-3 bg-neutral-200 dark:bg-neutral-800 mx-0.5" />
					<button
						onClick={(e) => {
							e.stopPropagation();
							data.onDelete?.();
						}}
						className="w-6 h-6 flex items-center justify-center rounded-full transition-colors text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
						title="Delete"
					>
						<SwissIcons.Trash size={10} />
					</button>
				</div>
			)}

			{/* Input Port */}
			<Handle
				type="target"
				position={Position.Left}
				className="!w-2.5 !h-2.5 !bg-neutral-400 !border-2 !border-[#f4f4f0] dark:!border-[#111111] hover:!bg-[#FF4D00] transition-colors"
			/>

			{/* Header Strip */}
			<div
				className={cn(
					"px-3 py-2 flex items-center justify-between border-b border-neutral-200 rounded-t-[1px]",
					headerColor,
				)}
			>
				<span className="text-[10px] font-mono font-bold uppercase tracking-[0.1em] truncate max-w-[120px]">
					{data.label}
				</span>
				{/* Status LED (Pulsing Orange) */}
				<div
					className={cn(
						"w-1.5 h-1.5 rounded-full",
						data.status === "running"
							? "bg-[#FF4400] animate-pulse shadow-[0_0_5px_#FF4400]"
							: "bg-neutral-300",
					)}
				/>
			</div>

			{/* Body */}
			<div className="p-2 space-y-2">
				{/* Config Preview (Monospace Data) */}
				<div className="space-y-0.5">
					<div className="flex justify-between text-[8px] font-mono text-neutral-400 uppercase">
						<span>Mode</span>
						<span>Auto</span>
					</div>
					<div className="flex justify-between text-[8px] font-mono text-neutral-400 uppercase">
						<span>Est. Time</span>
						<span>1.2s</span>
					</div>
				</div>

				{/* Controls Area (Visible on Hover/Select) */}
				<div
					className={cn(
						"pt-1.5 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between transition-opacity duration-200",
						isHovered || selected ? "opacity-100" : "opacity-50",
					)}
				>
					{/* Toggle Switch (Visual Only for now) */}
					<div className="flex items-center gap-1.5">
						<div className="w-5 h-2.5 bg-neutral-300 dark:bg-neutral-700 rounded-full relative">
							<div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
						</div>
						<span className="text-[8px] font-mono text-neutral-500 uppercase">
							Bypass
						</span>
					</div>

					{/* Test Button (Single Shot) */}
					<button
						className="flex items-center justify-center w-4 h-4 rounded-[2px] bg-white dark:bg-[#222] border border-neutral-300 dark:border-neutral-700 hover:border-[#FF4D00] hover:text-[#FF4D00] transition-colors shadow-sm"
						title="Test Run (Single Shot)"
					>
						<SwissIcons.Play size={8} />
					</button>
				</div>
			</div>

			{/* Output Port */}
			<Handle
				type="source"
				position={Position.Right}
				className="!w-2.5 !h-2.5 !bg-neutral-400 !border-2 !border-[#f4f4f0] dark:!border-[#111111] hover:!bg-[#FF4D00] transition-colors"
			/>
		</div>
	);
}
