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
	icon: LucideIcon;
	label: string;
	isActive?: boolean;
	onClick: () => void;
	shortcut?: string;
	disabled?: boolean;
}

export const ToolButton: React.FC<ToolButtonProps> = ({
	icon: Icon,
	label,
	isActive,
	onClick,
	shortcut,
	disabled,
}) => {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className={cn(
						"w-10 h-10 rounded-xl transition-all duration-200",
						isActive
							? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
							: "text-muted-foreground hover:bg-muted hover:text-foreground",
						disabled && "opacity-50 cursor-not-allowed",
					)}
					onClick={onClick}
					disabled={disabled}
				>
					<Icon className="w-5 h-5" />
				</Button>
			</TooltipTrigger>
			<TooltipContent side="right" className="flex items-center gap-2">
				<span>{label}</span>
				{shortcut && (
					<span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
						{shortcut}
					</span>
				)}
			</TooltipContent>
		</Tooltip>
	);
};
