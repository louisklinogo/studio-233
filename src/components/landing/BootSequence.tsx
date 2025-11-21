"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";

const BOOT_LOGS = [
	"INITIALIZING KERNEL...",
	"LOADING ASSETS...",
	"VERIFYING INTEGRITY...",
	"MOUNTING VIRTUAL DOM...",
	"ALLOCATING MEMORY BLOCK 0x84F...",
	"CONNECTING TO STUDIO+ NETWORK...",
	"SYSTEM READY.",
];

export const BootSequence = ({ onComplete }: { onComplete: () => void }) => {
	const [logs, setLogs] = useState<string[]>([]);
	const [isComplete, setIsComplete] = useState(false);

	useEffect(() => {
		let currentIndex = 0;

		const interval = setInterval(() => {
			if (currentIndex >= BOOT_LOGS.length) {
				clearInterval(interval);
				setTimeout(() => setIsComplete(true), 500);
				setTimeout(onComplete, 1000); // Wait for fade out
				return;
			}

			setLogs((prev) => [...prev, BOOT_LOGS[currentIndex]]);
			currentIndex++;
		}, 150); // Speed of log appearing

		return () => clearInterval(interval);
	}, [onComplete]);

	return (
		<AnimatePresence>
			{!isComplete && (
				<motion.div
					initial={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.5, ease: "easeInOut" }}
					className="fixed inset-0 z-[100] bg-black flex items-end p-8 md:p-12 font-mono text-xs md:text-sm text-neutral-400 cursor-wait"
				>
					<div className="flex flex-col gap-1 uppercase tracking-wider">
						{logs.map((log, i) => (
							<motion.span
								key={i}
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								className={
									i === logs.length - 1 ? "text-white" : "text-neutral-600"
								}
							>
								{`> ${log}`}
							</motion.span>
						))}
						<motion.span
							animate={{ opacity: [0, 1, 0] }}
							transition={{ repeat: Infinity, duration: 0.8 }}
							className="text-primary mt-1"
						>
							_
						</motion.span>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};
