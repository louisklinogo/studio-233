"use client";

import { motion } from "framer-motion";
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DeckButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	isActive?: boolean;
	icon?: React.ReactNode;
	tooltip?: string;
	variant?: "default" | "danger" | "ghost";
}

export const DeckButton = React.forwardRef<HTMLButtonElement, DeckButtonProps>(
	(
		{
			className,
			isActive,
			icon,
			tooltip,
			variant = "default",
			onClick,
			disabled,
			...props
		},
		ref,
	) => {
		const playClickSound = () => {
			const AudioContext =
				window.AudioContext || (window as any).webkitAudioContext;
			if (!AudioContext) return;

			const ctx = new AudioContext();
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();

			osc.connect(gain);
			gain.connect(ctx.destination);

			osc.type = "square";
			osc.frequency.setValueAtTime(150, ctx.currentTime);
			osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.08);

			gain.gain.setValueAtTime(0.1, ctx.currentTime);
			gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

			osc.start(ctx.currentTime);
			osc.stop(ctx.currentTime + 0.08);
		};

		const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
			if (!disabled) {
				playClickSound();
				onClick?.(e);
			}
		};

		return (
			<Button
				ref={ref}
				variant="ghost"
				size="sm"
				onClick={handleClick}
				disabled={disabled}
				title={tooltip}
				className={cn(
					// Base "Module" dimensions
					"w-12 h-12 p-0 rounded-none transition-colors relative",
					// Colors matching MobileToolbar / CanvasPalette
					"bg-[#f4f4f0] dark:bg-[#111111]",
					variant === "danger"
						? "hover:bg-red-50 dark:hover:bg-red-900/10"
						: isActive
							? "bg-white dark:bg-[#1a1a1a]"
							: "hover:bg-white dark:hover:bg-[#1a1a1a]",
					// Text/Icon Colors
					variant === "danger"
						? "text-neutral-500 hover:text-red-500"
						: isActive
							? "text-neutral-900 dark:text-white"
							: "text-neutral-500 hover:text-neutral-900 dark:hover:text-white",
					className,
				)}
				{...props}
			>
				{/* Active Indicator (Recessed LED on Left - Matching CanvasPalette) */}
				<div className="absolute left-0 w-1 h-full flex items-center justify-center pointer-events-none">
					{isActive && (
						<motion.div
							layoutId="activeDeckAction"
							className="w-1 h-6 bg-[#FF4D00] rounded-r-sm shadow-[0_0_8px_rgba(255,77,0,0.5)]"
						/>
					)}
				</div>

				{icon}
			</Button>
		);
	},
);

DeckButton.displayName = "DeckButton";
