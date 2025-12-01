"use client";

import React from "react";
import { HexColorPicker } from "react-colorful";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface StudioColorPickerProps {
	color: string;
	onChange: (color: string) => void;
	className?: string;
	label?: string;
}

export const StudioColorPicker: React.FC<StudioColorPickerProps> = ({
	color,
	onChange,
	className,
	label,
}) => {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					className={cn(
						"h-8 px-2 flex items-center gap-2 min-w-[80px]",
						"bg-white dark:bg-[#1a1a1a]",
						"border border-neutral-200 dark:border-neutral-800",
						"hover:bg-neutral-50 dark:hover:bg-neutral-800",
						"transition-colors rounded-sm group",
						className,
					)}
				>
					<div
						className="w-3 h-3 rounded-[1px] border border-neutral-200 dark:border-neutral-700 shadow-sm"
						style={{ backgroundColor: color }}
					/>
					<span className="text-[10px] font-mono uppercase tracking-wider text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white">
						{label || color.toUpperCase()}
					</span>
				</button>
			</PopoverTrigger>
			<PopoverContent
				className="w-auto p-3 rounded-sm border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a]"
				side="bottom"
				align="start"
				sideOffset={4}
			>
				<div className="flex flex-col gap-3">
					<HexColorPicker color={color} onChange={onChange} />
					<div className="flex items-center gap-2">
						<div
							className="w-6 h-6 rounded-[2px] border border-neutral-200 dark:border-neutral-700"
							style={{ backgroundColor: color }}
						/>
						<input
							type="text"
							value={color.toUpperCase()}
							onChange={(e) => onChange(e.target.value)}
							className="flex-1 h-6 px-2 text-[10px] font-mono uppercase border border-neutral-200 dark:border-neutral-800 rounded-[2px] bg-transparent focus:outline-none focus:border-neutral-400"
						/>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
};
