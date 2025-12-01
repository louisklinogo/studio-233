"use client";

import React from "react";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { cn } from "@/lib/utils";

export type ShapeType = "rectangle" | "circle" | "triangle";

interface StudioShapeSelectorProps {
	value: ShapeType;
	onChange: (value: ShapeType) => void;
}

export const StudioShapeSelector: React.FC<StudioShapeSelectorProps> = ({
	value,
	onChange,
}) => {
	const shapes: { type: ShapeType; icon: any; label: string }[] = [
		{ type: "rectangle", icon: SwissIcons.Square, label: "RECT" },
		{ type: "circle", icon: SwissIcons.Circle, label: "CIRCLE" },
		{ type: "triangle", icon: SwissIcons.Triangle, label: "TRIANGLE" },
	];

	return (
		<div className="flex items-center gap-[1px] bg-neutral-200 dark:bg-neutral-800 p-[1px] rounded-sm overflow-hidden">
			{shapes.map((shape) => (
				<button
					key={shape.type}
					onClick={() => onChange(shape.type)}
					className={cn(
						"h-7 px-2 flex items-center justify-center gap-1.5 transition-colors",
						value === shape.type
							? "bg-white dark:bg-[#1a1a1a] text-neutral-900 dark:text-white"
							: "bg-[#f4f4f0] dark:bg-[#111111] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-white dark:hover:bg-[#1a1a1a]",
					)}
					title={shape.label}
				>
					<shape.icon size={14} className="stroke-[1.5px]" />
				</button>
			))}
		</div>
	);
};
