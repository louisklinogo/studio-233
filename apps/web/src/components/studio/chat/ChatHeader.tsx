import React from "react";
import { Button } from "@/components/ui/button";
import { SwissIcons } from "@/components/ui/SwissIcons";
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
				"flex items-center justify-between p-4 bg-[#f4f4f0] dark:bg-[#111111] border-b border-neutral-200 dark:border-neutral-800",
				className,
			)}
		>
			<div className="flex items-center gap-2">
				<div className="w-2 h-2 rounded-full bg-[#3B4B59]" />
				<span className="font-mono text-xs font-medium tracking-widest uppercase text-neutral-500">
					AI Communicator
				</span>
			</div>

			<div className="flex items-center gap-1">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon-sm"
								onClick={onNewChat}
								className="h-8 w-8 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-sm"
							>
								<SwissIcons.Plus className="h-4 w-4" />
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
								onClick={onToggleHistory}
								className="h-8 w-8 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-sm"
							>
								<SwissIcons.History className="h-4 w-4" />
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
								className="h-8 w-8 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-sm"
							>
								<SwissIcons.Close className="h-4 w-4" />
								<span className="sr-only">Close</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent>Close Panel</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>
		</div>
	);
};
