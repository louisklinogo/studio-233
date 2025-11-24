import {
	CaretDoubleRight,
	ClockCounterClockwise,
	DotsThree,
	Plus,
	ShareFat,
	SlidersHorizontal,
} from "@phosphor-icons/react";
import React from "react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
	onNewChat: () => void;
	onToggleHistory: () => void;
	onToggleFiles: () => void;
	onCollapse: () => void;
	className?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
	onNewChat,
	onToggleHistory,
	onToggleFiles,
	onCollapse,
	className,
}) => {
	return (
		<div
			className={cn(
				"flex items-center justify-end p-3 bg-transparent",
				className,
			)}
		>
			<div className="flex items-center gap-1">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon-sm"
								onClick={onNewChat}
								className="h-8 w-8 text-muted-foreground hover:text-foreground"
							>
								<Plus size={16} weight="bold" />
								<span className="sr-only">New Chat</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent>New Chat</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon-sm"
								className="h-8 w-8 text-muted-foreground hover:text-foreground"
							>
								<SlidersHorizontal size={16} weight="regular" />
								<span className="sr-only">Controls</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent>Controls</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon-sm"
								className="h-8 w-8 text-muted-foreground hover:text-foreground"
							>
								<ShareFat size={16} weight="regular" />
								<span className="sr-only">Share</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent>Share</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon-sm"
								onClick={onToggleHistory}
								className="h-8 w-8 text-muted-foreground hover:text-foreground"
							>
								<ClockCounterClockwise size={16} weight="regular" />
								<span className="sr-only">History</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent>History</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon-sm"
								onClick={onCollapse}
								className="h-8 w-8 text-muted-foreground hover:text-foreground"
							>
								<CaretDoubleRight size={16} weight="regular" />
								<span className="sr-only">Collapse</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent>Collapse</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>
		</div>
	);
};
