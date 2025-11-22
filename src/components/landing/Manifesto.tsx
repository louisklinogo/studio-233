"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import React, { useRef } from "react";
import { ScrambleText } from "@/components/landing/ScrambleText";

export const Manifesto = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start end", "end start"],
	});

	// Parallax X movement
	const x1 = useTransform(scrollYProgress, [0, 1], [0, 100]); // Move Right
	const x2 = useTransform(scrollYProgress, [0, 1], [0, -100]); // Move Left
	const x3 = useTransform(scrollYProgress, [0, 1], [0, 100]); // Move Right

	// Scroll-linked Blur & Opacity
	// As the user scrolls past the center, blur the text out
	const blurAmount = useTransform(scrollYProgress, [0.4, 0.8], [0, 10]);
	const filter = useTransform(blurAmount, (v) => `blur(${v}px)`);
	const opacity = useTransform(scrollYProgress, [0.4, 0.9], [1, 0]);

	return (
		<section
			ref={containerRef}
			className="relative z-10 py-24 md:py-32 overflow-hidden border-b border-neutral-200 dark:border-neutral-800"
		>
			<motion.div
				style={{ filter, opacity }}
				className="flex flex-col gap-4 md:gap-8 font-bold text-4xl md:text-7xl lg:text-9xl tracking-tighter leading-[0.8] select-none text-neutral-900 dark:text-white opacity-90"
			>
				<motion.div style={{ x: x1 }} className="whitespace-nowrap pl-4">
					INFINITE CANVAS.
				</motion.div>
				<motion.div
					style={{ x: x2 }}
					className="whitespace-nowrap text-right pr-4 text-[#FF4D00]"
				>
					AGENTIC INTELLIGENCE.
				</motion.div>
				<motion.div style={{ x: x3 }} className="whitespace-nowrap pl-4">
					YOUR CREATIVE ENGINE.
				</motion.div>
			</motion.div>

			<div className="container mx-auto px-6 mt-12 md:mt-24 max-w-2xl">
				<p className="font-mono text-sm md:text-base text-neutral-500 dark:text-neutral-400 leading-relaxed uppercase tracking-wide">
					<span className="text-[#FF4D00] mr-2">//</span>
					<ScrambleText
						text="Studio+233 is not just a tool. It is a production environment for the next generation of creators. Combine the freedom of an infinite canvas with the power of autonomous AI agents to scale your workflow from one to one thousand."
						revealSpeed={30}
					/>
				</p>
			</div>
		</section>
	);
};
