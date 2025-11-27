"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import React from "react";
import { cn } from "@/lib/utils";

interface DeckSliderProps {
	value: number[];
	onValueChange: (value: number[]) => void;
	min?: number;
	max?: number;
	step?: number;
	className?: string;
}

export const DeckSlider: React.FC<DeckSliderProps> = ({
	value,
	onValueChange,
	min = 0,
	max = 100,
	step = 1,
	className,
}) => {
	return (
		<div
			className={cn(
				"flex items-center justify-center h-10 px-3 bg-[#f4f4f0] dark:bg-[#111111]",
				className,
			)}
		>
			<SliderPrimitive.Root
				value={value}
				onValueChange={onValueChange}
				min={min}
				max={max}
				step={step}
				className="relative flex items-center select-none touch-none w-24 h-full"
			>
				{/* Track */}
				<SliderPrimitive.Track className="relative h-1 grow bg-neutral-300 dark:bg-neutral-700 overflow-hidden">
					<SliderPrimitive.Range className="absolute h-full bg-[#FF4D00]" />
				</SliderPrimitive.Track>

				{/* Thumb - Machined Block */}
				<SliderPrimitive.Thumb className="block w-3 h-3 bg-[#FF4D00] shadow-sm transition-transform hover:scale-110 focus:outline-none" />
			</SliderPrimitive.Root>
		</div>
	);
};
