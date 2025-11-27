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

interface ChatTriggerProps {
	isOpen: boolean;
	onClick: () => void;
}

export const ChatTrigger: React.FC<ChatTriggerProps> = ({
	isOpen,
	onClick,
}) => {
	return (
		<div className="absolute top-4 right-4 z-50">
			<TooltipProvider delayDuration={0}>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							onClick={onClick}
							className={cn(
								"w-12 h-12 rounded-sm shadow-xl transition-all duration-300",
								"border border-neutral-200 dark:border-neutral-800",
								isOpen
									? "bg-[#3B4B59] text-white hover:bg-[#3B4B59]/90"
									: "bg-[#f4f4f0] dark:bg-[#111111] text-neutral-500 hover:text-[#3B4B59] hover:bg-white dark:hover:bg-[#1a1a1a]",
							)}
						>
							<SwissIcons.Sparkles
								className={cn(
									"w-5 h-5 transition-transform duration-500",
									isOpen && "rotate-90",
								)}
							/>
							<span className="sr-only">Toggle AI Communicator</span>
						</Button>
					</TooltipTrigger>
					<TooltipContent
						side="left"
						className="flex items-center gap-2 bg-[#3B4B59] text-white border border-[#3B4B59] rounded-sm shadow-xl"
					>
						<span className="font-mono text-[10px] uppercase tracking-wider">
							Communicator
						</span>
						<span className="text-[9px] text-[#3B4B59] bg-[#BFA07A] px-1.5 py-0.5 rounded-sm font-mono font-bold">
							⌘K
						</span>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</div>
	);
};
