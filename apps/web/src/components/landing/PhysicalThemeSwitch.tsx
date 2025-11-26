"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";

export const PhysicalThemeSwitch = () => {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	if (!mounted) return <div className="w-12 h-6" />; // Placeholder

	const playClickSound = () => {
		const AudioContext =
			window.AudioContext || (window as any).webkitAudioContext;
		if (!AudioContext) return;

		const ctx = new AudioContext();
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();

		osc.connect(gain);
		gain.connect(ctx.destination);

		// Mechanical Click Synthesis
		osc.type = "square";
		osc.frequency.setValueAtTime(150, ctx.currentTime);
		osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);

		gain.gain.setValueAtTime(0.1, ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

		osc.start(ctx.currentTime);
		osc.stop(ctx.currentTime + 0.1);
	};

	const toggleTheme = () => {
		playClickSound();

		// View Transition logic (same as before)
		// @ts-ignore
		if (!document.startViewTransition) {
			setTheme(theme === "dark" ? "light" : "dark");
			return;
		}

		const x = window.innerWidth / 2;
		const y = window.innerHeight / 2;
		const endRadius = Math.hypot(
			Math.max(x, innerWidth - x),
			Math.max(y, innerHeight - y),
		);

		// @ts-ignore
		const transition = document.startViewTransition(async () => {
			setTheme(theme === "dark" ? "light" : "dark");
		});

		transition.ready.then(() => {
			const clipPath = [
				`circle(0px at ${x}px ${y}px)`,
				`circle(${endRadius}px at ${x}px ${y}px)`,
			];
			document.documentElement.animate(
				{ clipPath: clipPath },
				{
					duration: 800,
					easing: "ease-in-out",
					pseudoElement: "::view-transition-new(root)",
				},
			);
		});
	};

	return (
		<button
			onClick={toggleTheme}
			className="relative group flex items-center gap-3"
			aria-label="Toggle Theme"
		>
			{/* Label */}
			<span className="hidden md:block font-mono text-[9px] tracking-widest text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors uppercase">
				{theme === "dark" ? "LIGHT_MODE" : "DARK_MODE"}
			</span>

			{/* Physical Switch Base (Braun Style) */}
			<div className="relative w-12 h-6 bg-[#e5e5e5] dark:bg-[#2a2a2a] border border-neutral-300 dark:border-neutral-700 shadow-[inset_0_1px_3px_rgba(0,0,0,0.1)] transition-colors overflow-hidden">
				{/* Track Line */}
				<div className="absolute top-1/2 left-2 right-2 h-px bg-neutral-300 dark:bg-neutral-600" />

				{/* The Toggle Nub */}
				<motion.div
					className="absolute top-[2px] bottom-[2px] w-5 bg-[#f0f0f0] dark:bg-[#3a3a3a] border border-neutral-300 dark:border-neutral-600 shadow-[0_1px_2px_rgba(0,0,0,0.1)] flex items-center justify-center"
					animate={{
						left: theme === "dark" ? "calc(100% - 22px)" : "2px",
					}}
					transition={{ type: "spring", stiffness: 600, damping: 35 }}
				>
					{/* Orange Indicator Line */}
					<div className="w-[2px] h-3 bg-[#FF4D00]" />
				</motion.div>
			</div>
		</button>
	);
};
