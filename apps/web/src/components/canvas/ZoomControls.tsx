import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { Button } from "@/components/ui/button";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { cn } from "@/lib/utils";

interface ZoomControlsProps {
	viewport: {
		x: number;
		y: number;
		scale: number;
	};
	setViewport: (viewport: { x: number; y: number; scale: number }) => void;
	canvasSize: {
		width: number;
		height: number;
	};
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
	viewport,
	setViewport,
	canvasSize,
}) => {
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
		osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);

		gain.gain.setValueAtTime(0.1, ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

		osc.start(ctx.currentTime);
		osc.stop(ctx.currentTime + 0.1);
	};

	const handleZoomIn = () => {
		playClickSound();
		const newScale = Math.min(5, viewport.scale * 1.2);
		const centerX = canvasSize.width / 2;
		const centerY = canvasSize.height / 2;

		const mousePointTo = {
			x: (centerX - viewport.x) / viewport.scale,
			y: (centerY - viewport.y) / viewport.scale,
		};

		setViewport({
			x: centerX - mousePointTo.x * newScale,
			y: centerY - mousePointTo.y * newScale,
			scale: newScale,
		});
	};

	const handleZoomOut = () => {
		playClickSound();
		const newScale = Math.max(0.1, viewport.scale / 1.2);
		const centerX = canvasSize.width / 2;
		const centerY = canvasSize.height / 2;

		const mousePointTo = {
			x: (centerX - viewport.x) / viewport.scale,
			y: (centerY - viewport.y) / viewport.scale,
		};

		setViewport({
			x: centerX - mousePointTo.x * newScale,
			y: centerY - mousePointTo.y * newScale,
			scale: newScale,
		});
	};

	const handleResetView = () => {
		playClickSound();
		setViewport({ x: 0, y: 0, scale: 1 });
	};

	return (
		<div className="absolute top-4 right-4 z-20">
			<div
				className={cn(
					"flex flex-col items-center w-10",
					"bg-neutral-200 dark:bg-neutral-800 rounded-sm shadow-2xl",
					"gap-[1px] overflow-hidden",
					"border border-transparent dark:border-neutral-800",
				)}
			>
				{/* Zoom In (top) */}
				<Button
					variant="ghost"
					size="sm"
					onClick={handleZoomIn}
					className={cn(
						"w-full h-8 p-0 rounded-none transition-colors group",
						"bg-[#f4f4f0] dark:bg-[#111111]",
						"hover:bg-white dark:hover:bg-[#1a1a1a]",
						"text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300",
					)}
					title="Zoom In"
				>
					<SwissIcons.Plus className="h-4 w-4" />
				</Button>

				{/* Percentage Indicator (center, click to reset) */}
				<button
					onClick={handleResetView}
					className={cn(
						"w-full h-8 px-2 flex items-center justify-center transition-colors",
						"bg-[#f4f4f0] dark:bg-[#111111]",
						"hover:bg-white dark:hover:bg-[#1a1a1a]",
						"text-[10px] font-mono font-bold tracking-wider",
						"text-neutral-500 hover:text-[#FF4D00] dark:text-neutral-400",
						"cursor-pointer",
					)}
					title="Reset Zoom"
				>
					{Math.round(viewport.scale * 100)}%
				</button>

				{/* Zoom Out (bottom) */}
				<Button
					variant="ghost"
					size="sm"
					onClick={handleZoomOut}
					className={cn(
						"w-full h-8 p-0 rounded-none transition-colors group",
						"bg-[#f4f4f0] dark:bg-[#111111]",
						"hover:bg-white dark:hover:bg-[#1a1a1a]",
						"text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300",
					)}
					title="Zoom Out"
				>
					<SwissIcons.Minus className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
};
