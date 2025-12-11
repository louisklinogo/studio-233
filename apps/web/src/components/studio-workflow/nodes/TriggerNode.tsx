"use client";

import { Handle, type NodeProps, Position } from "@xyflow/react";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { cn } from "@/lib/utils";

// Types
export type TriggerNodeData = {
	label: string;
	triggerType: "manual" | "cron" | "webhook" | "event";
	schedule?: string; // e.g. "Every Friday at 02:00"
	nextRun?: string; // e.g. "T-minus 4h 20m"
	onDelete?: () => void;
	onDuplicate?: () => void;
};

export function TriggerNode({ data, selected }: NodeProps<TriggerNodeData>) {
	const isCron = data.triggerType === "cron";

	return (
		<div
			className={cn(
				"group relative flex items-center gap-2 p-1 pr-3 rounded-full border transition-all duration-200 min-w-[150px]",
				"bg-[#f4f4f0] dark:bg-[#111111]", // Surface
				selected
					? "border-[#FF4D00] shadow-[0_0_0_1px_#FF4D00]"
					: "border-neutral-300 dark:border-neutral-700 shadow-sm hover:border-neutral-400 dark:hover:border-neutral-600",
			)}
		>
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

			{/* Icon Circle (The "Button") */}

			<div
				className={cn(
					"w-8 h-8 rounded-full flex items-center justify-center border",
					"bg-white dark:bg-[#222] border-neutral-200 dark:border-neutral-700",
					selected
						? "text-[#FF4D00]"
						: "text-neutral-600 dark:text-neutral-400",
				)}
			>
				{isCron ? (
					<SwissIcons.History size={14} />
				) : (
					<SwissIcons.Upload size={14} />
				)}
			</div>

			{/* Label & Info */}
			<div className="flex flex-col">
				<span className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
					{data.label}
				</span>
				{/* Smart Source Status */}
				{data.triggerType === "manual" ? (
					<span className="text-[8px] font-mono text-neutral-500 truncate max-w-[100px]">
						Source: <span className="text-[#FF4D00]">Direct Upload</span>
					</span>
				) : (
					<>
						{data.schedule && (
							<span className="text-[8px] font-mono text-neutral-500 truncate max-w-[100px]">
								{data.schedule}
							</span>
						)}
						{data.nextRun && (
							<span className="text-[8px] font-mono text-[#FF4D00] mt-0.5">
								Next: {data.nextRun}
							</span>
						)}
					</>
				)}
			</div>

			{/* Output Port (Source only) */}
			<Handle
				type="source"
				position={Position.Right}
				className="!w-2.5 !h-2.5 !bg-[#FF4D00] !border-2 !border-[#f4f4f0] dark:!border-[#111111] transition-transform hover:scale-125"
			/>
		</div>
	);
}
