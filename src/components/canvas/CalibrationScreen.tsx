"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";

const STEPS = [
	"INITIALIZING_VIEWPORT",
	"LOADING_NEURAL_ASSETS",
	"CALIBRATING_GRID",
	"SYNCING_TOOLS",
];

export const CalibrationScreen = ({
	onComplete,
}: {
	onComplete: () => void;
}) => {
	const [step, setStep] = useState(0);
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		// Progress bar animation
		const progressInterval = setInterval(() => {
			setProgress((prev) => {
				if (prev >= 100) return 100;
				return prev + 2;
			});
		}, 20);

		// Step switcher
		const stepInterval = setInterval(() => {
			setStep((prev) => {
				if (prev >= STEPS.length - 1) return prev;
				return prev + 1;
			});
		}, 400);

		// Completion
		const timeout = setTimeout(() => {
			onComplete();
		}, 1800);

		return () => {
			clearInterval(progressInterval);
			clearInterval(stepInterval);
			clearTimeout(timeout);
		};
	}, [onComplete]);

	return (
		<motion.div
			className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center font-mono text-xs tracking-wider"
			exit={{ opacity: 0 }}
			transition={{ duration: 0.5 }}
		>
			<div className="w-64 space-y-4">
				<div className="flex justify-between text-muted-foreground">
					<span>STATUS</span>
					<span>{progress}%</span>
				</div>

				{/* Progress Bar */}
				<div className="h-1 w-full bg-muted overflow-hidden relative">
					<motion.div
						className="absolute inset-y-0 left-0 bg-[#FF4D00]"
						style={{ width: `${progress}%` }}
					/>
				</div>

				<div className="h-4 flex items-center text-[#FF4D00]">
					{`> ${STEPS[step]}...`}
				</div>
			</div>
		</motion.div>
	);
};
