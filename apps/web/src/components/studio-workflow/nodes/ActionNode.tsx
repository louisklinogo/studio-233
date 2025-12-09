"use client";

import type { Node, NodeProps } from "@xyflow/react";
import { Sparkles } from "lucide-react";
import type { WorkflowNodeData } from "@/lib/studio-workflow/store";
import { cn } from "@/lib/utils";

export function ActionNode({
	data,
	selected,
}: NodeProps<Node<WorkflowNodeData>>) {
	const label = data?.label ?? "Action";
	const description = data?.description;
	return (
		<div
			className={cn(
				"rounded-md border bg-white dark:bg-[#0b0b0b] shadow-sm p-3 min-w-[200px]",
				selected
					? "border-orange-500 shadow-md"
					: "border-neutral-200 dark:border-neutral-800",
			)}
		>
			<div className="flex items-center gap-2 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
				<Sparkles className="w-4 h-4 text-orange-500" />
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
