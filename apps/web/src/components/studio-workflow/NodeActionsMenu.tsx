"use client";

import { NodeToolbar, Position } from "@xyflow/react";
import { SwissIcons } from "@/components/ui/SwissIcons";

interface NodeActionsMenuProps {
	nodeId: string;
	onDelete: () => void;
	onDuplicate: () => void;
	isVisible: boolean;
}

export function NodeActionsMenu({
	nodeId,
	onDelete,
	onDuplicate,
	isVisible,
}: NodeActionsMenuProps) {
	return (
		<NodeToolbar
			isVisible={isVisible}
			position={Position.Top}
			offset={16}
			className="flex items-center gap-1 bg-white dark:bg-[#1a1a1a] p-1 rounded-full border border-neutral-200 dark:border-neutral-800 shadow-xl"
		>
			<ActionButton
				icon={<SwissIcons.Copy size={12} />}
				onClick={onDuplicate}
				label="Duplicate"
			/>
			<div className="w-[1px] h-3 bg-neutral-200 dark:bg-neutral-800 mx-0.5" />
			<ActionButton
				icon={<SwissIcons.Trash size={12} />}
				onClick={onDelete}
				label="Delete"
				variant="destructive"
			/>
		</NodeToolbar>
	);
}

function ActionButton({
	icon,
	onClick,
	label,
	variant = "default",
}: {
	icon: React.ReactNode;
	onClick: () => void;
	label: string;
	variant?: "default" | "destructive";
}) {
	const colors =
		variant === "destructive"
			? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
			: "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800";

	return (
		<button
			onClick={(e) => {
				e.stopPropagation();
				onClick();
			}}
			className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${colors}`}
			title={label}
		>
			{icon}
		</button>
	);
}
