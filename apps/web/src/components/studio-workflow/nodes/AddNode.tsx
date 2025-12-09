"use client";

import type { Node, NodeProps } from "@xyflow/react";
import { Plus } from "lucide-react";
import type { WorkflowNodeData } from "@/lib/studio-workflow/store";
import { cn } from "@/lib/utils";

export function AddNode({ data, selected }: NodeProps<Node<WorkflowNodeData>>) {
	const label = data?.label ?? "Add step";
	const description = data?.description;
	return (
		<div
			className={cn(
				"rounded-md border-dashed border-2 bg-white/60 dark:bg-[#0b0b0b]/60 p-3 min-w-[200px] cursor-pointer",
				selected
					? "border-orange-500"
					: "border-neutral-300 dark:border-neutral-700",
			)}
		>
			<div className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-200">
				<Plus className="w-4 h-4" />
				<span>{label}</span>
			</div>
			{description ? (
				<p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
					{description}
				</p>
			) : null}
		</div>
	);
}
