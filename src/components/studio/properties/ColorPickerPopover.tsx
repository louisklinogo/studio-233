import React from "react";
import { HexColorPicker } from "react-colorful";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ColorPickerPopoverProps {
	color: string;
	onChange: (color: string) => void;
	className?: string;
	label?: string;
}

export const ColorPickerPopover: React.FC<ColorPickerPopoverProps> = ({
	color,
	onChange,
	className,
	label,
}) => {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<div
					className={cn(
						"flex items-center gap-2 cursor-pointer group",
						className,
					)}
				>
					{label && (
						<span className="text-xs text-muted-foreground font-medium">
							{label}
						</span>
					)}
					<div
						className="w-6 h-6 rounded-full border border-border shadow-sm transition-transform group-hover:scale-110"
						style={{ backgroundColor: color }}
					/>
				</div>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-3" side="bottom" align="center">
				<HexColorPicker color={color} onChange={onChange} />
				<div className="mt-3 flex items-center gap-2">
					<div
						className="w-6 h-6 rounded-full border border-border"
						style={{ backgroundColor: color }}
					/>
					<input
						type="text"
						value={color}
						onChange={(e) => onChange(e.target.value)}
						className="flex-1 h-8 px-2 text-xs border rounded bg-background"
					/>
				</div>
			</PopoverContent>
		</Popover>
	);
};
