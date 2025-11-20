import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export type ToolType = "select" | "pan";

interface BottomToolbarProps {
	// Tools are handled in CreativeToolbar, but keeping type for potential future use if needed
	chatCount: number;
	imagesCount: number;
	onRunAll: () => void;
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({
	chatCount,
	imagesCount,
	onRunAll,
}) => {
	// Don't render anything if there are no items in the queue
	if (chatCount === 0 && imagesCount === 0) {
		return null;
	}

	return (
		<div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
			{/* Queue Status Pill */}
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
		</div>
	);
};
