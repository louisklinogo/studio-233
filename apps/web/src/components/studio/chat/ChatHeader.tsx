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
				"flex items-center justify-between p-4 bg-muted/30 border-b border-border",
				className,
			)}
		>
			<div className="flex items-center gap-2">
				<div className="w-2 h-2 rounded-full bg-[#FF4D00]" />
				<span className="font-mono text-xs font-medium tracking-widest uppercase text-muted-foreground">
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
								className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent rounded-sm"
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
								className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent rounded-sm"
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
								className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent rounded-sm"
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
