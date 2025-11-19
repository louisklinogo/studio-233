import { ChevronUp, Hand, MessageSquare, MousePointer2 } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export type ToolType = "select" | "pan";

interface BottomToolbarProps {
	activeTool: ToolType;
	setActiveTool: (tool: ToolType) => void;
	isChatOpen: boolean;
	onChatToggle: () => void;
	chatCount: number;
	imagesCount: number;
	onRunAll: () => void;
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({
	activeTool,
	setActiveTool,
	isChatOpen,
	onChatToggle,
	chatCount,
	imagesCount,
	onRunAll,
}) => {
	return (
		<div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
			{/* Left Pill: Tool Selection */}
			<div className="flex items-center bg-background/80 backdrop-blur-md border rounded-full p-1 shadow-lg h-12">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							className="h-10 rounded-l-full rounded-r-none px-3 hover:bg-accent/50"
						>
							<div className="flex items-center gap-2">
								{activeTool === "select" ? (
									<MousePointer2 className="h-4 w-4" />
								) : (
									<Hand className="h-4 w-4" />
								)}
							</div>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						side="top"
						align="start"
						className="w-[140px] rounded-xl"
					>
						<DropdownMenuItem
							onClick={() => setActiveTool("select")}
							className="gap-2"
						>
							<MousePointer2 className="h-4 w-4" />
							<span>Select</span>
							<span className="ml-auto text-xs text-muted-foreground">V</span>
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => setActiveTool("pan")}
							className="gap-2"
						>
							<Hand className="h-4 w-4" />
							<span>Hand tool</span>
							<span className="ml-auto text-xs text-muted-foreground">H</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

				<Separator orientation="vertical" className="h-6 mx-1" />

				<Button
					variant="ghost"
					size="icon"
					className={cn(
						"h-10 w-10 rounded-full hover:bg-accent/50",
						isChatOpen && "bg-accent text-accent-foreground",
					)}
					onClick={onChatToggle}
				>
					<MessageSquare className="h-5 w-5" />
				</Button>
			</div>

			{/* Right Pill: Run/Status (Only visible if there are queued items) */}
			{(chatCount > 0 || imagesCount > 0) && (
				<div className="flex items-center bg-background/80 backdrop-blur-md border rounded-full p-1 shadow-lg h-12 animate-in fade-in slide-in-from-bottom-2">
					<div className="flex items-center gap-4 px-4 text-sm font-medium">
						<span className="text-muted-foreground">{chatCount} Chats</span>
						<Separator orientation="vertical" className="h-4" />
						<span className="text-muted-foreground">{imagesCount} images</span>
					</div>
					<Button className="h-10 rounded-full px-6 ml-1" onClick={onRunAll}>
						Run All
					</Button>
				</div>
			)}
		</div>
	);
};
