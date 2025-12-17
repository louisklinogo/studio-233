"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";

const SPECS = [
	{
		id: "01",
		label: "GENERATIVE_ENGINE",
		description: "High-fidelity parametric rendering",
		value: "98.4%",
	},
	{
		id: "02",
		label: "BATCH_PROCESSOR",
		description: "Parallel asset generation queue",
		value: "1.2ms",
	},
	{
		id: "03",
		label: "NEURAL_ORCHESTRATION",
		description: "Multi-agent workflow execution",
		value: "ACTIVE",
	},
];

const ScrambleText = ({ text, trigger }: { text: string; trigger: number }) => {
	const [display, setDisplay] = useState(text);
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";

	useEffect(() => {
		let iteration = 0;
		const interval = setInterval(() => {
			setDisplay(
				text
					.split("")
					.map((char, index) => {
						if (index < iteration) {
							return text[index];
						}
						return chars[Math.floor(Math.random() * chars.length)];
					})
					.join(""),
			);

			if (iteration >= text.length) {
				clearInterval(interval);
			}

			iteration += 1 / 2;
		}, 30);

		return () => clearInterval(interval);
	}, [text, trigger]);

	return <span>{display}</span>;
};

export const SystemSpecs = () => {
	const [activeIndex, setActiveIndex] = useState(0);

	useEffect(() => {
		const timer = setInterval(() => {
			setActiveIndex((prev) => (prev + 1) % SPECS.length);
		}, 4000);
		return () => clearInterval(timer);
	}, []);

	const next = () => setActiveIndex((prev) => (prev + 1) % SPECS.length);

	return (
		<div className="w-full h-full flex flex-col justify-center px-12 py-12 relative overflow-hidden">
			{/* The Aperture Container */}
			<div className="relative h-[240px] w-full max-w-2xl pl-16 overflow-hidden flex items-center">
				<AnimatePresence mode="popLayout">
					<motion.div
						key={activeIndex}
						initial={{ y: "100%", filter: "blur(4px)" }}
						animate={{ y: "0%", filter: "blur(0px)" }}
						exit={{ y: "-100%", filter: "blur(4px)" }}
						transition={{
							duration: 0.6,
							ease: [0.25, 1, 0.5, 1], // Heavy mechanical ease
						}}
						className="flex flex-col gap-2 w-full"
					>
						{/* Huge Index (Background Anchor) */}
						<span className="font-mono text-[120px] font-black text-neutral-200/50 dark:text-neutral-800/50 leading-none select-none absolute -left-8 -top-12 -z-10 tracking-tighter">
							{SPECS[activeIndex].id}
						</span>

						<div className="flex flex-col gap-4 relative z-10">
							{/* Label Plate */}
							<div className="flex items-center gap-3">
								<div className="w-3 h-3 bg-[#FF4D00]" />
								<h3 className="font-sans text-sm font-bold tracking-widest uppercase text-neutral-900 dark:text-white">
									{SPECS[activeIndex].label}
								</h3>
							</div>

							{/* Value Ticker */}
							<div className="font-mono text-6xl text-[#FF4D00] font-medium tracking-tighter">
								<ScrambleText
									text={SPECS[activeIndex].value}
									trigger={activeIndex}
								/>
							</div>

							{/* Description */}
							<p className="font-sans text-sm text-neutral-500 max-w-md leading-relaxed">
								{SPECS[activeIndex].description}
							</p>
						</div>
					</motion.div>
				</AnimatePresence>
			</div>

			{/* Manual Advance (Mechanical Button) REMOVED */}

			{/* Static Decor */}
			<div className="absolute top-8 right-8 font-mono text-[9px] text-neutral-400 tracking-widest">
				FIG. {SPECS[activeIndex].id}
			</div>
		</div>
	);
};
