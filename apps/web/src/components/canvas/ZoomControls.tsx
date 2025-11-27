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
		<div className="absolute bottom-6 left-6 z-20">
			<div
				className={cn(
					// Chassis
					"flex flex-row items-center h-10",
					"bg-neutral-200 dark:bg-neutral-800 rounded-sm shadow-xl",
					"gap-[1px] overflow-hidden",
					"border border-neutral-200 dark:border-neutral-800",
				)}
			>
				{/* Zoom Out */}
				<Button
					variant="ghost"
					size="sm"
					onClick={handleZoomOut}
					className="w-10 h-full p-0 rounded-none bg-[#f4f4f0] dark:bg-[#111111] hover:bg-white dark:hover:bg-[#1a1a1a] text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
					title="Zoom Out"
				>
					<SwissIcons.Minus className="h-4 w-4" />
				</Button>

				{/* Percentage Indicator (Click to Reset) */}
				<button
					onClick={handleResetView}
					className={cn(
						"h-full min-w-[52px] px-2 flex items-center justify-center",
						"bg-[#f4f4f0] dark:bg-[#111111] hover:bg-white dark:hover:bg-[#1a1a1a] transition-colors",
						"text-[10px] font-mono font-bold text-neutral-600 dark:text-neutral-400 hover:text-[#FF4D00] cursor-pointer",
					)}
					title="Reset Zoom"
				>
					{Math.round(viewport.scale * 100)}%
				</button>

				{/* Zoom In */}
				<Button
					variant="ghost"
					size="sm"
					onClick={handleZoomIn}
					className="w-10 h-full p-0 rounded-none bg-[#f4f4f0] dark:bg-[#111111] hover:bg-white dark:hover:bg-[#1a1a1a] text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
					title="Zoom In"
				>
					<SwissIcons.Plus className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
};
