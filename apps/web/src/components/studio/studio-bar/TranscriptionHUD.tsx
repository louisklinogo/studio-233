"use client";

import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TranscriptionHUDProps {
	isRecording: boolean;
	transcription: string;
	onStop: () => void;
}

export function TranscriptionHUD({
	isRecording,
	transcription,
	onStop,
}: TranscriptionHUDProps) {
	// Mock audio levels for the visualizer
	const [levels, setLevels] = useState<number[]>(Array(12).fill(10));

	useEffect(() => {
		if (!isRecording) return;

		const interval = setInterval(() => {
			setLevels(
				Array(12)
					.fill(0)
					.map(() => Math.random() * 40 + 10),
			);
		}, 100);

		return () => clearInterval(interval);
	}, [isRecording]);

	if (!isRecording) return null;

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: 10 }}
			className="absolute inset-0 z-50 flex items-center justify-between bg-neutral-100 dark:bg-[#111] px-4 rounded-full"
		>
			{/* Live Transcription Text */}
			<div className="flex-1 font-mono text-sm text-neutral-900 dark:text-white truncate mr-4">
				<span className="text-orange-500 mr-2">●</span>
				{transcription || "Listening..."}
			</div>

			{/* Audio Visualizer */}
			<div className="flex items-center gap-[2px] h-4">
				{levels.map((height, i) => (
					<motion.div
						key={i}
						animate={{ height }}
						transition={{ type: "spring", stiffness: 300, damping: 20 }}
						className={cn(
							"w-[2px] rounded-full",
							i % 2 === 0
								? "bg-orange-500"
								: "bg-neutral-400 dark:bg-neutral-600",
						)}
					/>
				))}
			</div>

			{/* Stop Button (Invisible overlay on the mic button position, handled by parent but good for visual completeness if needed) */}
		</motion.div>
	);
}
