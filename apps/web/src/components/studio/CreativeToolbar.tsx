import {
	Hand,
	LayoutGrid,
	MousePointer2,
	Pencil,
	Plus,
	Square,
	Type,
} from "lucide-react";
import React from "react";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AddMenu } from "./AddMenu";
import { ToolButton } from "./toolbar/ToolButton";

export type ToolType = "select" | "pan" | "text" | "shape" | "draw" | "add";

interface CreativeToolbarProps {
	activeTool?: ToolType;
	setActiveTool: (tool: ToolType) => void;
	onAddClick: () => void; // Kept for fallback or direct upload if needed
	onUploadImage: () => void;
	onUploadVideo: () => void;
	onOpenImageGenerator: () => void;
	onOpenVideoGenerator: () => void;
	onAddFrame: () => void;
}

export const CreativeToolbar: React.FC<CreativeToolbarProps> = ({
	activeTool,
	setActiveTool,
	onAddClick,
	onUploadImage,
	onUploadVideo,
	onOpenImageGenerator,
	onOpenVideoGenerator,
	onAddFrame,
}) => {
	return (
		<TooltipProvider delayDuration={0}>
			<div className="hidden md:flex flex-col gap-1.5 p-1.5 bg-background/80 backdrop-blur-md border rounded-2xl shadow-lg absolute top-1/2 -translate-y-1/2 left-4 z-20">
				<div className="flex flex-col gap-1">
					<AddMenu
						onUploadImage={onUploadImage}
						onUploadVideo={onUploadVideo}
						onOpenImageGenerator={onOpenImageGenerator}
						onOpenVideoGenerator={onOpenVideoGenerator}
						onAddFrame={onAddFrame}
					/>
				</div>

				<Separator className="my-1 w-8 mx-auto" />

				<div className="flex flex-col gap-1">
					<ToolButton
						icon={MousePointer2}
						label="Select (V)"
						isActive={activeTool === "select"}
						onClick={() => setActiveTool("select")}
						shortcut="V"
					/>
					<ToolButton
						icon={Hand}
						label="Hand Tool (H)"
						isActive={activeTool === "pan"}
						onClick={() => setActiveTool("pan")}
						shortcut="H"
					/>
				</div>

				<Separator className="my-1 w-8 mx-auto" />

				<div className="flex flex-col gap-1">
					<ToolButton
						icon={Type}
						label="Text (T)"
						isActive={activeTool === "text"}
						onClick={() => setActiveTool("text")}
						shortcut="T"
					/>
					<ToolButton
						icon={Square}
						label="Shapes (R)"
						isActive={activeTool === "shape"}
						onClick={() => setActiveTool("shape")}
						shortcut="R"
					/>
					<ToolButton
						icon={Pencil}
						label="Draw (P)"
						isActive={activeTool === "draw"}
						onClick={() => setActiveTool("draw")}
						shortcut="P"
					/>
				</div>

				<Separator className="my-1 w-8 mx-auto" />

				<div className="flex flex-col gap-1">
					<ToolButton
						icon={LayoutGrid}
						label="Templates (Coming Soon)"
						onClick={() => {}}
						disabled={true}
					/>
				</div>
			</div>
		</TooltipProvider>
	);
};
