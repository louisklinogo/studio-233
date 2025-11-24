import {
	Maximize,
	Minus,
	MousePointer2,
	Plus,
	Redo2,
	Undo2,
} from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export type ToolType = "select" | "pan" | "text" | "shape" | "draw" | "add";

interface BottomToolbarProps {
	undo: () => void;
	redo: () => void;
	canUndo: boolean;
	canRedo: boolean;
	zoom: number;
	setZoom: (zoom: number) => void;
	onFitToScreen: () => void;
	selectedCount: number;
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({
	undo,
	redo,
	canUndo,
	canRedo,
	zoom,
	setZoom,
	onFitToScreen,
	selectedCount,
}) => {
	return (
		<div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
			<div className="flex items-center gap-1 p-1.5 bg-background/80 backdrop-blur-md border rounded-2xl shadow-lg animate-in fade-in slide-in-from-bottom-2">
				{/* History Controls */}
				<div className="flex items-center gap-0.5">
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={undo}
						disabled={!canUndo}
						title="Undo (Ctrl+Z)"
					>
						<Undo2 className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={redo}
						disabled={!canRedo}
						title="Redo (Ctrl+Y)"
					>
						<Redo2 className="h-4 w-4" />
					</Button>
				</div>

				<Separator orientation="vertical" className="h-6 mx-1" />

				{/* Zoom Controls */}
				<div className="flex items-center gap-0.5">
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
						title="Zoom Out (-)"
					>
						<Minus className="h-3 w-3" />
					</Button>

					<span className="text-xs font-medium w-12 text-center tabular-nums">
						{Math.round(zoom * 100)}%
					</span>

					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={() => setZoom(Math.min(5, zoom + 0.1))}
						title="Zoom In (+)"
					>
						<Plus className="h-3 w-3" />
					</Button>
				</div>

				<Separator orientation="vertical" className="h-6 mx-1" />

				{/* View Controls */}
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8"
					onClick={onFitToScreen}
					title="Fit to Screen"
				>
					<Maximize className="h-3 w-3" />
				</Button>

				{/* Selection Status (only visible if items selected) */}
				{selectedCount > 0 && (
					<>
						<Separator orientation="vertical" className="h-6 mx-1" />
						<div className="flex items-center gap-2 px-2 text-xs font-medium text-muted-foreground">
							<MousePointer2 className="h-3 w-3" />
							<span>{selectedCount} Selected</span>
						</div>
					</>
				)}
			</div>
		</div>
	);
};
