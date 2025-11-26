import React from "react";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { cn } from "@/lib/utils";
import { ToolButton } from "./toolbar/ToolButton";

interface AddMenuProps {
	onUploadImage: () => void;
	onUploadVideo: () => void;
	onOpenImageGenerator: () => void;
	onOpenVideoGenerator: () => void;
	onAddFrame: () => void;
	trigger?: React.ReactNode;
}

export const AddMenu: React.FC<AddMenuProps> = ({
	onUploadImage,
	onUploadVideo,
	onOpenImageGenerator,
	onOpenVideoGenerator,
	onAddFrame,
	trigger,
}) => {
	return (
		<HoverCard openDelay={0} closeDelay={300}>
			<HoverCardTrigger asChild>
				{trigger || (
					<div className="inline-block">
						<ToolButton
							icon={SwissIcons.Plus}
							label="Add"
							onClick={() => {}}
							showTooltip={false}
						/>
					</div>
				)}
			</HoverCardTrigger>
			<HoverCardContent
				side="right"
				align="start"
				sideOffset={16}
				className="w-56 p-1 rounded-xl border bg-background/95 backdrop-blur-sm shadow-xl"
			>
				<div className="text-xs font-medium text-muted-foreground px-2 py-1.5 font-outfit">
					Add to Canvas
				</div>

				<div className="space-y-1">
					<button
						onClick={onUploadImage}
						className="w-full flex items-center gap-2 px-2 py-2 text-sm cursor-pointer rounded-lg hover:bg-accent hover:text-accent-foreground font-outfit transition-colors text-left"
					>
						<SwissIcons.Image className="h-4 w-4" />
						<span>Upload Image</span>
					</button>

					<button
						onClick={onUploadVideo}
						className="w-full flex items-center gap-2 px-2 py-2 text-sm cursor-pointer rounded-lg hover:bg-accent hover:text-accent-foreground font-outfit transition-colors text-left"
					>
						<SwissIcons.Video className="h-4 w-4" />
						<span>Upload Video</span>
					</button>
				</div>

				<div className="h-px bg-border my-1" />

				<div className="space-y-1">
					<button
						onClick={onOpenImageGenerator}
						className="w-full flex items-center justify-between px-2 py-2 text-sm cursor-pointer rounded-lg hover:bg-accent hover:text-accent-foreground font-outfit group transition-colors text-left"
					>
						<div className="flex items-center gap-2">
							<SwissIcons.Zap className="h-4 w-4" />
							<span>Image Generator</span>
						</div>
						<span className="text-[10px] font-mono text-muted-foreground opacity-50">
							A
						</span>
					</button>

					<button
						onClick={onOpenVideoGenerator}
						className="w-full flex items-center gap-2 px-2 py-2 text-sm cursor-pointer rounded-lg hover:bg-accent hover:text-accent-foreground font-outfit transition-colors text-left"
					>
						<SwissIcons.Film className="h-4 w-4" />
						<span>Video Generator</span>
					</button>
				</div>

				<div className="h-px bg-border my-1" />

				<button
					onClick={onAddFrame}
					className="w-full flex items-center justify-between px-2 py-2 text-sm cursor-pointer rounded-lg hover:bg-accent hover:text-accent-foreground font-outfit transition-colors text-left"
				>
					<div className="flex items-center gap-2">
						<SwissIcons.Frame className="h-4 w-4" />
						<span>Frame</span>
					</div>
					<span className="text-[10px] font-mono text-muted-foreground opacity-50">
						F
					</span>
				</button>
			</HoverCardContent>
		</HoverCard>
	);
};
