"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

export const SystemHUD: React.FC = () => {
	const { scrollYProgress } = useScroll();
	const scaleX = useSpring(scrollYProgress, {
		stiffness: 100,
		damping: 30,
		restDelta: 0.001,
	});

	const [mode, setMode] = useState<"MANUAL" | "MANIFESTO" | "ENGINE">("MANUAL");

	// Mode switching logic based on scroll progress
	useEffect(() => {
		return scrollYProgress.on("change", (latest) => {
			if (latest > 0.4) {
				setMode("MANIFESTO");
			} else {
				setMode("MANUAL");
			}
		});
	}, [scrollYProgress]);

	return (
		<div className="fixed bottom-0 left-0 right-0 z-[100] h-12 border-t border-neutral-200 dark:border-neutral-800 bg-[#f4f4f0]/80 dark:bg-[#050505]/80 backdrop-blur-md px-6 md:px-12 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500">
			{/* Left Side: Mode & Progress Bar */}
			<div className="flex items-center gap-8 flex-1">
				<div className="flex items-center gap-3">
					<div
						className={`w-1.5 h-1.5 rounded-full ${mode === "MANIFESTO" || mode === "ENGINE" ? "bg-[#D81E05] shadow-[0_0_8px_#D81E05]" : "bg-neutral-400"} transition-all duration-300 animate-pulse`}
					/>
					<span
						className={
							mode !== "MANUAL" ? "text-neutral-900 dark:text-white" : ""
						}
					>
						SYS_MODE: {mode}
					</span>
				</div>

				<div className="relative h-[1px] flex-1 max-w-[200px] bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
					<motion.div
						style={{ scaleX }}
						className="absolute inset-0 bg-[#D81E05] origin-left"
					/>
				</div>
			</div>

			{/* Center: Scroll Percentage */}
			<div className="flex-1 text-center hidden md:block">
				SCROLL_POS:{" "}
				<motion.span>
					{useTransform(scrollYProgress, [0, 1], [0, 100])}
				</motion.span>
				%
			</div>

			{/* Right Side: Secure Entry Key */}
			<div className="flex items-center gap-8 flex-1 justify-end">
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2">
						<span className="w-1 h-1 bg-green-500 rounded-full" />
						<span className="text-green-500 hidden sm:inline">OPTIMAL</span>
					</div>
				</div>
			</div>
		</div>
	);
};
