"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export function SwissToggle({ onToggle }: { onToggle: () => void }) {
	const [active, setActive] = useState(false);

	const handleClick = () => {
		if (active) return;
		setActive(true);

		// Play sound
		const AudioContext =
			window.AudioContext || (window as any).webkitAudioContext;
		if (AudioContext) {
			const ctx = new AudioContext();
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.connect(gain);
			gain.connect(ctx.destination);
			osc.type = "sawtooth";
			osc.frequency.setValueAtTime(220, ctx.currentTime);
			osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
			gain.gain.setValueAtTime(0.2, ctx.currentTime);
			gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
			osc.start(ctx.currentTime);
			osc.stop(ctx.currentTime + 0.3);
		}

		setTimeout(() => {
			onToggle();
		}, 600);
	};

	return (
		<div className="flex flex-col gap-4">
			<button
				onClick={handleClick}
				className="relative w-64 h-24 bg-[#e5e5e5] dark:bg-[#1a1a1a] border border-neutral-300 dark:border-neutral-800 shadow-inner overflow-hidden group cursor-pointer"
			>
				{/* Track */}
				<div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
					<span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">
						Standby
					</span>
					<span className="font-mono text-[10px] text-[#FF4D00] uppercase tracking-widest font-bold">
						Active
					</span>
				</div>

				{/* Sliding Block */}
				<motion.div
					initial={{ x: "0%" }}
					animate={{ x: active ? "100%" : "0%" }}
					transition={{
						type: "spring",
						stiffness: 300,
						damping: 30,
					}}
					className="absolute top-1 bottom-1 w-[50%] bg-white dark:bg-[#2a2a2a] shadow-[0_2px_10px_rgba(0,0,0,0.1)] border border-neutral-200 dark:border-neutral-700 flex items-center justify-center z-10"
					style={{ left: 0 }} // Explicit left to work with x transform
				>
					{/* Grip Lines */}
					<div className="flex gap-1">
						<div className="w-[2px] h-8 bg-neutral-300 dark:bg-neutral-600" />
						<div className="w-[2px] h-8 bg-neutral-300 dark:bg-neutral-600" />
						<div className="w-[2px] h-8 bg-neutral-300 dark:bg-neutral-600" />
					</div>
				</motion.div>
			</button>

			<p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest text-center">
				{active ? "Engaging..." : "Slide to Initialize"}
			</p>
		</div>
	);
}
