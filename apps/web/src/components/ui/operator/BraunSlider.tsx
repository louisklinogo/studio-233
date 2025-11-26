"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import React from "react";
import { cn } from "@/lib/utils";

interface BraunSliderProps
	extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
	label?: string;
	valueDisplay?: string | number;
}

export const BraunSlider = React.forwardRef<
	React.ElementRef<typeof SliderPrimitive.Root>,
	BraunSliderProps
>(({ className, label, valueDisplay, ...props }, ref) => (
	<div className="flex flex-col gap-2 w-full">
		{(label || valueDisplay) && (
			<div className="flex justify-between items-end">
				{label && (
					<span className="font-mono text-[9px] tracking-widest uppercase text-neutral-500">
						{label}
					</span>
				)}
				{valueDisplay && (
					<span className="font-mono text-[10px] text-[#FF4D00]">
						{valueDisplay}
					</span>
				)}
			</div>
		)}
		<SliderPrimitive.Root
			ref={ref}
			className={cn(
				"relative flex w-full touch-none select-none items-center",
				className,
			)}
			{...props}
		>
			{/* Track (Recessed Channel) */}
			<SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden bg-[#e5e5e5] dark:bg-[#1a1a1a] shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] border-b border-white/10">
				<SliderPrimitive.Range className="absolute h-full bg-[#FF4D00]/20" />

				{/* Tick Marks */}
				<div className="absolute inset-0 w-full h-full flex justify-between px-1">
					{[...Array(11)].map((_, i) => (
						<div key={i} className="w-[1px] h-full bg-neutral-400/20" />
					))}
				</div>
			</SliderPrimitive.Track>

			{/* Thumb (Physical Fader Cap) */}
			<SliderPrimitive.Thumb className="block h-6 w-3 bg-[#d4d4d4] dark:bg-[#2a2a2a] border border-neutral-400 dark:border-neutral-600 shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing relative group">
				{/* Center Groove */}
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-4 bg-[#FF4D00]" />
			</SliderPrimitive.Thumb>
		</SliderPrimitive.Root>
	</div>
));
BraunSlider.displayName = SliderPrimitive.Root.displayName;
