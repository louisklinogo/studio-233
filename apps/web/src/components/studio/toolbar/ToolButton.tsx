import type { LucideIcon } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ToolButtonProps {
	icon: React.ComponentType<any> | LucideIcon;
	label: string;
	isActive?: boolean;
	onClick: () => void;
	shortcut?: string;
	disabled?: boolean;
	showTooltip?: boolean;
	className?: string;
}

export const ToolButton: React.FC<ToolButtonProps> = ({
	icon: Icon,
	label,
	isActive,
	onClick,
	shortcut,
	disabled,
	showTooltip = true,
	className,
}) => {
	const button = (
		<Button
			variant="ghost"
			size="icon"
			data-active={isActive ? "true" : undefined}
			className={cn(
				"w-10 h-10 rounded-sm transition-all duration-200",
				className,
				isActive
					? "bg-[#3B4B59] text-white shadow-sm hover:bg-[#3B4B59]/90"
					: "text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100",
				disabled && "opacity-50 cursor-not-allowed",
			)}
			onClick={onClick}
			disabled={disabled}
		>
			<Icon className="w-5 h-5" />
		</Button>
	);

	if (!showTooltip) {
		return button;
	}

	return (
		<Tooltip>
			<TooltipTrigger asChild>{button}</TooltipTrigger>
			<TooltipContent
				side="right"
				className="flex items-center gap-2 bg-[#3B4B59] text-white border border-[#3B4B59] rounded-sm shadow-xl"
			>
				<span className="font-mono text-[10px] uppercase tracking-wider">
					{label}
				</span>
				{shortcut && (
					<span className="text-[9px] text-[#3B4B59] bg-[#BFA07A] px-1.5 py-0.5 rounded-sm font-mono font-bold">
						{shortcut}
					</span>
				)}
			</TooltipContent>
		</Tooltip>
	);
};
