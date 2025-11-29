"use client";

import { type HTMLMotionProps, motion } from "framer-motion";
import React from "react";
import { cn } from "@/lib/utils";

interface BraunButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
	variant?: "primary" | "secondary" | "ghost" | "icon";
	active?: boolean;
	label?: string;
	children: React.ReactNode;
}

export const BraunButton = React.forwardRef<
	HTMLButtonElement,
	BraunButtonProps
>(
	(
		{
			className,
			variant = "primary",
			active,
			label,
			children,
			onDrag,
			...props
		},
		ref,
	) => {
		return (
			<div className="flex flex-col items-center gap-1.5 group">
				<motion.button
					ref={ref}
					whileTap={{ scale: 0.96, y: 1 }}
					onDrag={onDrag}
					className={cn(
						"relative overflow-hidden transition-all duration-200 outline-none",
						// Base Geometry
						"rounded-[2px] border select-none",
						// Variants
						variant === "primary" && [
							"bg-[#e5e5e5] dark:bg-[#1a1a1a]",
							"border-neutral-300 dark:border-neutral-800",
							"text-neutral-900 dark:text-neutral-100",
							"shadow-[0_1px_0_0_rgba(0,0,0,0.1)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)]",
							"hover:bg-white dark:hover:bg-[#252525]",
							active && "border-[#FF4D00] text-[#FF4D00]",
						],
						variant === "secondary" && [
							"bg-transparent",
							"border-neutral-200 dark:border-neutral-800",
							"text-neutral-600 dark:text-neutral-400",
							"hover:border-neutral-300 dark:hover:border-neutral-700",
							"hover:text-neutral-900 dark:hover:text-neutral-200",
							active && "bg-[#FF4D00]/10 border-[#FF4D00] text-[#FF4D00]",
						],
						variant === "icon" && [
							"w-10 h-10 flex items-center justify-center",
							"bg-[#e5e5e5] dark:bg-[#1a1a1a]",
							"border-neutral-300 dark:border-neutral-800",
							"text-neutral-700 dark:text-neutral-300",
							"shadow-[inset_0_-1px_1px_rgba(0,0,0,0.1)]", // Concave feel
							"hover:text-[#FF4D00]",
							active && "bg-[#FF4D00] text-black border-[#FF4D00] shadow-none",
						],
						className,
					)}
					{...props}
				>
					{/* Active Indicator Light (for non-icon primary buttons) */}
					{variant === "primary" && active && (
						<div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#FF4D00] shadow-[0_0_4px_#FF4D00]" />
					)}

					{/* Tactile Surface Texture */}
					<div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.05),transparent)] pointer-events-none" />

					<span className="relative z-10 flex items-center justify-center gap-2 px-4 py-2 font-mono text-xs font-medium tracking-wide uppercase">
						{children}
					</span>
				</motion.button>

				{/* External Label (Braun Style) */}
				{label && (
					<span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
						{label}
					</span>
				)}
			</div>
		);
	},
);
BraunButton.displayName = "BraunButton";
