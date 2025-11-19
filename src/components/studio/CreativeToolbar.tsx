import { LayoutGrid, Pencil, Plus, Square, Type } from "lucide-react";
import React from "react";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToolButton } from "./toolbar/ToolButton";

export type ToolType = "text" | "shape" | "draw" | "add";

interface CreativeToolbarProps {
	activeTool?: ToolType;
	setActiveTool: (tool: ToolType) => void;
	onAddClick: () => void;
}

export const CreativeToolbar: React.FC<CreativeToolbarProps> = ({
	activeTool,
	setActiveTool,
	onAddClick,
}) => {
	return (
		<TooltipProvider delayDuration={0}>
			<div className="hidden md:flex flex-col gap-2 p-2 bg-background/80 backdrop-blur-md border rounded-2xl shadow-lg absolute top-1/2 -translate-y-1/2 left-4 z-20">
				<div className="flex flex-col gap-1">
					<ToolButton
						icon={Plus}
						label="Add Assets"
						onClick={onAddClick}
						shortcut="A"
					/>
				</div>

				<Separator className="my-1 w-8 mx-auto" />

				<div className="flex flex-col gap-1">
					<ToolButton
						icon={Type}
						label="Text (Coming Soon)"
						isActive={activeTool === "text"}
						onClick={() => setActiveTool("text")}
						shortcut="T"
						disabled={true}
					/>
					<ToolButton
						icon={Square}
						label="Shapes (Coming Soon)"
						isActive={activeTool === "shape"}
						onClick={() => setActiveTool("shape")}
						shortcut="R"
						disabled={true}
					/>
					<ToolButton
						icon={Pencil}
						label="Draw (Coming Soon)"
						isActive={activeTool === "draw"}
						onClick={() => setActiveTool("draw")}
						shortcut="P"
						disabled={true}
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
