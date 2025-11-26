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

			{/* Physical Switch Base */}
			<div className="relative w-12 h-6 rounded-sm bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 shadow-inner transition-colors">
				{/* Screw Heads (Decoration) */}
				<div className="absolute top-1/2 -translate-y-1/2 left-0.5 w-0.5 h-0.5 rounded-full bg-neutral-400" />
				<div className="absolute top-1/2 -translate-y-1/2 right-0.5 w-0.5 h-0.5 rounded-full bg-neutral-400" />

				{/* The Toggle Nub */}
				<motion.div
					className="absolute top-0.5 bottom-0.5 w-5 bg-white dark:bg-neutral-600 border border-neutral-300 dark:border-neutral-500 rounded-sm shadow-sm"
					animate={{
						left: theme === "dark" ? "calc(100% - 22px)" : "2px",
						backgroundColor: theme === "dark" ? "#404040" : "#ffffff",
					}}
					transition={{ type: "spring", stiffness: 500, damping: 30 }}
				>
					{/* Grip Lines on Nub */}
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-0.5">
						<div className="w-px h-2 bg-neutral-300 dark:bg-neutral-500" />
						<div className="w-px h-2 bg-neutral-300 dark:bg-neutral-500" />
						<div className="w-px h-2 bg-neutral-300 dark:bg-neutral-500" />
					</div>
				</motion.div>
			</div>
		</button>
	);
};
