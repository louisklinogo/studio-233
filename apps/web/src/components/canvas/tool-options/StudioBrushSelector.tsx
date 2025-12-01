"use client";

import React from "react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface StudioBrushSelectorProps {
	size: number;
	onSizeChange: (size: number) => void;
	opacity: number;
	onOpacityChange: (opacity: number) => void;
}

export const StudioBrushSelector: React.FC<StudioBrushSelectorProps> = ({
	size,
	onSizeChange,
	opacity,
	onOpacityChange,
}) => {
	return (
		<div className="flex items-center gap-4 px-2">
			{/* Size Control */}
			<div className="flex items-center gap-2 min-w-[120px]">
				<span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider w-8">
					SIZE
				</span>
				<Slider
					value={[size]}
					min={1}
					max={50}
					step={1}
					onValueChange={(vals) => onSizeChange(vals[0])}
					className="w-20"
				/>
				<span className="text-[10px] font-mono text-neutral-900 dark:text-white w-4 text-right">
					{size}
				</span>
			</div>

			<div className="w-[1px] h-4 bg-neutral-200 dark:bg-neutral-800" />

			{/* Opacity Control */}
			<div className="flex items-center gap-2 min-w-[120px]">
				<span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider w-8">
					OPAC
				</span>
				<Slider
					value={[opacity]}
					min={0}
					max={100}
					step={1}
					onValueChange={(vals) => onOpacityChange(vals[0])}
					className="w-20"
				/>
				<span className="text-[10px] font-mono text-neutral-900 dark:text-white w-6 text-right">
					{opacity}%
				</span>
			</div>
		</div>
	);
};
