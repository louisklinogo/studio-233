"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BraunInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
}

export const BraunInput = React.forwardRef<HTMLInputElement, BraunInputProps>(
	({ className, label, ...props }, ref) => {
		return (
			<div className="flex flex-col gap-1.5 w-full group">
				{label && (
					<label className="font-mono text-[9px] tracking-widest uppercase text-neutral-500 group-focus-within:text-[#FF4D00] transition-colors">
						{label}
					</label>
				)}
				<div className="relative">
					<input
						ref={ref}
						className={cn(
							"w-full bg-[#f4f4f0] dark:bg-[#0a0a0a] text-neutral-900 dark:text-white font-mono text-sm",
							"border-b-2 border-neutral-300 dark:border-neutral-700",
							"px-0 py-2",
							"placeholder:text-neutral-400",
							"focus:outline-none focus:border-[#FF4D00] transition-colors",
							className,
						)}
						{...props}
					/>
					{/* Active Indicator (small LED) */}
					<div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-transparent group-focus-within:bg-[#FF4D00] transition-colors" />
				</div>
			</div>
		);
	},
);
BraunInput.displayName = "BraunInput";
