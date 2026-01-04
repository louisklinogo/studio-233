"use client";

import { motion, useAnimation } from "framer-motion";
import React, { useEffect, useState } from "react";

const TumblerDigit = ({
	target,
	active,
	onLocked,
}: {
	target: number;
	active: boolean;
	onLocked: () => void;
}) => {
	const controls = useAnimation();
	const [locked, setLocked] = useState(false);
	const hasSpun = React.useRef(false);

	// Large array of digits to create a long "reel" feel
	const digits = Array.from({ length: 30 }, (_, i) => i % 10);

	useEffect(() => {
		if (active && !hasSpun.current) {
			hasSpun.current = true;
			const startSpin = async () => {
				const itemHeightPercent = 100 / digits.length;
				const targetIndex = target + 20; // Land on the 3rd set of digits (indices 20-29)

				// 1. Initial rapid spin to a random position slightly before target
				await controls.start({
					y: `-${(targetIndex - 5) * itemHeightPercent}%`,
					transition: {
						duration: 0.8,
						ease: "circIn",
					},
				});

				// 2. The "Snap" into position with mechanical weight
				await controls.start({
					y: `-${targetIndex * itemHeightPercent}%`,
					transition: {
						type: "spring",
						stiffness: 120,
						damping: 14,
						mass: 1.2,
						restDelta: 0.001,
					},
				});

				setLocked(true);
				onLocked();
			};
			startSpin();
		}
	}, [active, controls, target, onLocked, digits.length]);

	return (
		<div className="relative h-[15vw] w-[10vw] overflow-hidden border-x border-white/5 bg-black/20">
			<motion.div
				animate={controls}
				initial={{ y: "0%" }}
				className="flex flex-col"
			>
				{digits.map((d, i) => (
					<div
						key={i}
						className={`h-[15vw] flex items-center justify-center text-[12vw] font-black tracking-tighter tabular-nums transition-colors duration-300 ${
							locked && (i % 10 === target)
								? "text-[#FF4400]"
								: "text-[#f4f4f0]/20"
						}`}
					>
						{d}
					</div>
				))}
			</motion.div>

			{/* Cylindrical shadow effect */}
			<div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#1a1a1a] via-transparent to-[#1a1a1a] opacity-80" />

			{/* Highlight for the active row */}
			<div
				className={`absolute inset-0 border-y border-white/10 transition-opacity duration-500 ${active ? "opacity-100" : "opacity-0"}`}
			/>
		</div>
	);
};

export const BootSequence = ({ onComplete }: { onComplete: () => void }) => {
	const [phase, setPhase] = useState(0); // 0: Idle, 1: First, 2: Second, 3: Third, 4: Complete

	useEffect(() => {
		// Initial wait before starting the sequence
		const timer = setTimeout(() => setPhase(1), 500);
		return () => clearTimeout(timer);
	}, []);

	useEffect(() => {
		if (phase === 4) {
			const finishTimer = setTimeout(onComplete, 1000);
			return () => clearTimeout(finishTimer);
		}
	}, [phase, onComplete]);

	return (
		<motion.div
			className="fixed inset-0 z-[100] bg-[#1a1a1a] flex flex-col items-center justify-center overflow-hidden"
			exit={{
				y: "-100%",
				transition: {
					duration: 1.2,
					ease: [0.85, 0, 0.15, 1],
				},
			}}
		>
			{/* Persistent Industrial Background */}
			<div
				className="absolute inset-0 opacity-[0.03] pointer-events-none"
				style={{
					backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
					backgroundSize: "60px 60px",
				}}
			/>

			<div className="relative flex flex-col items-center">
				{/* Combination Housing */}
				<div className="relative flex items-center bg-[#0a0a0a] p-6 border-4 border-[#222] rounded-sm shadow-[0_50px_100px_-20px_rgba(0,0,0,1)]">
					<TumblerDigit
						target={2}
						active={phase >= 1}
						onLocked={() => setPhase(2)}
					/>
					<TumblerDigit
						target={3}
						active={phase >= 2}
						onLocked={() => setPhase(3)}
					/>
					<TumblerDigit
						target={3}
						active={phase >= 3}
						onLocked={() => setPhase(4)}
					/>

					{/* Mechanical Guide Line */}
					<div className="absolute left-0 right-0 h-px bg-white/10 z-20 pointer-events-none" />
					<motion.div
						className="absolute left-0 right-0 h-[2px] bg-[#FF4400] z-20 shadow-[0_0_15px_#FF4400]"
						initial={{ opacity: 0 }}
						animate={{ opacity: phase >= 1 ? 0.4 : 0 }}
					/>
				</div>

				{/* System Readout */}
				<div className="mt-16 flex flex-col items-center gap-4">
					<div className="flex items-center gap-4">
						<div
							className={`w-2 h-2 rounded-full transition-colors duration-300 ${phase === 4 ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-[#FF4400] animate-pulse"}`}
						/>
						<span className="font-mono text-[10px] uppercase tracking-[0.5em] text-[#f4f4f0]/40">
							{phase === 4 ? "Combination_Verified" : "Syncing_Tumblers..."}
						</span>
					</div>

					<div className="h-4 flex items-center justify-center overflow-hidden">
						<motion.span
							key={phase}
							initial={{ y: 20, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							className="font-mono text-[8px] text-[#FF4400] uppercase tracking-widest"
						>
							{phase === 1 && "Engaging_Primary_Drive..."}
							{phase === 2 && "Locking_Sequence_B..."}
							{phase === 3 && "Finalizing_Authentication..."}
							{phase === 4 && "Access_Granted"}
						</motion.span>
					</div>
				</div>
			</div>

			{/* Corner Technical Marks */}
			<div className="absolute top-12 right-12 flex flex-col items-end gap-1 opacity-20">
				<div className="w-12 h-[1px] bg-white" />
				<span className="font-mono text-[8px]">REF_STUDIO_233</span>
			</div>
		</motion.div>
	);
};
