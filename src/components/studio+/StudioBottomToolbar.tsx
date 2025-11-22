import { Trash2, X } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StudioBottomToolbarProps {
	selectedCount: number;
	onClear: () => void;
	onRemove: () => void;
	disabled?: boolean;
}

export const StudioBottomToolbar: React.FC<StudioBottomToolbarProps> = ({
	selectedCount,
	onClear,
	onRemove,
	disabled,
}) => {
	if (selectedCount === 0) return null;

	return (
		<div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
			<div className="flex items-center gap-1 p-1 bg-background/80 backdrop-blur-md border rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-2">
				<Button
					variant="ghost"
					size="sm"
					onClick={onClear}
					disabled={disabled}
					className="h-8 px-3 text-xs font-medium"
				>
					<X className="w-3 h-3 mr-1.5" />
					Clear
				</Button>

				<div className="w-[1px] h-4 bg-border mx-0.5" />

				<Button
					variant="ghost"
					size="sm"
					onClick={onRemove}
					disabled={disabled}
					className="h-8 px-3 text-xs font-medium text-destructive hover:text-destructive hover:bg-destructive/10"
				>
					<Trash2 className="w-3 h-3 mr-1.5" />
					Remove ({selectedCount})
				</Button>
			</div>
		</div>
	);
};
