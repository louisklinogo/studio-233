"use client";

import { Handle, type NodeProps, Position } from "@xyflow/react";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { cn } from "@/lib/utils";

// Types
export type GateNodeData = {
	label: string;
	condition?: string; // e.g. "Confidence > 0.8"
	onDelete?: () => void;
	onDuplicate?: () => void;
};

export function GateNode({ data, selected }: NodeProps<GateNodeData>) {
	return (
		<div
			className={cn(
				"group relative min-w-[150px] rounded-[2px] border transition-all duration-200",
				"bg-[#f4f4f0] dark:bg-[#111111]",
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

			{/* Input Port */}
			<Handle
				type="target"
				position={Position.Left}
				className="!w-2.5 !h-2.5 !bg-neutral-400 !border-2 !border-[#f4f4f0] dark:!border-[#111111]"
			/>

			{/* Header */}
			<div className="px-2.5 py-1.5 flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-[#1a1a1a]">
				<SwissIcons.Filter className="text-neutral-500" size={12} />
				<span className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
					{data.label || "Quality Gate"}
				</span>
			</div>

			{/* Body */}
			<div className="p-2 flex flex-col gap-3">
				{/* Condition Display */}
				<div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 p-1 rounded-[2px]">
					<code className="text-[8px] font-mono text-neutral-600 dark:text-neutral-400 block text-center">
						{data.condition || "IF condition == TRUE"}
					</code>
				</div>

				{/* Output Labels */}
				<div className="flex flex-col gap-2 items-end">
					<div className="flex items-center gap-2 h-3.5">
						<span className="text-[8px] font-mono font-bold text-[#00C040] uppercase tracking-widest">
							Pass
						</span>
						{/* PASS Handle */}
						<Handle
							type="source"
							position={Position.Right}
							id="pass"
							className="!w-2.5 !h-2.5 !bg-[#00C040] !border-2 !border-[#f4f4f0] dark:!border-[#111111] !right-[-11px] !relative !transform-none"
						/>
					</div>
					<div className="flex items-center gap-2 h-3.5">
						<span className="text-[8px] font-mono font-bold text-[#E03C31] uppercase tracking-widest">
							Fail
						</span>
						{/* FAIL Handle */}
						<Handle
							type="source"
							position={Position.Right}
							id="fail"
							className="!w-2.5 !h-2.5 !bg-[#E03C31] !border-2 !border-[#f4f4f0] dark:!border-[#111111] !right-[-11px] !relative !transform-none"
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
