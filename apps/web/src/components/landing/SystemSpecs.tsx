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

	return (
		<div className="w-full h-full flex flex-col justify-center px-8 md:px-16 py-12 relative overflow-hidden bg-transparent">
			{/* HUD Top Header (Transparent) */}
			<div className="absolute top-0 inset-x-0 h-10 border-b border-neutral-900/50 flex items-center justify-between px-8 z-20">
				<div className="flex items-center gap-4">
					<div className="flex gap-1.5 opacity-30">
						<div className="w-1 h-1 bg-[#FF4D00] rounded-full" />
						<div className="w-1 h-1 bg-neutral-800 rounded-full" />
						<div className="w-1 h-1 bg-neutral-800 rounded-full" />
					</div>
					<span className="font-mono text-[9px] text-neutral-600 tracking-[0.4em] uppercase">
						MAPPED_ENGINE_HUD
					</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="h-4 w-[1px] bg-neutral-900" />
					<span className="font-mono text-[9px] text-[#FF4D00]/80 tracking-widest">
						[ {activeIndex + 1} // {SPECS.length} ]
					</span>
				</div>
			</div>

			{/* The Aperture Container */}
			<div className="relative h-[240px] w-full max-w-2xl pl-0 overflow-hidden flex items-center">
				<AnimatePresence mode="popLayout">
					<motion.div
						key={activeIndex}
						initial={{ y: "100%", opacity: 0 }}
						animate={{ y: "0%", opacity: 1 }}
						exit={{ y: "-100%", opacity: 0 }}
						transition={{
							duration: 0.6,
							ease: [0.25, 1, 0.5, 1], // Heavy mechanical ease
						}}
						className="flex flex-col gap-4 w-full"
					>
						{/* Background Plate */}
						<div className="flex items-start gap-12">
							{/* Huge Index (Etched/HUD Style) */}
							<div className="relative flex-shrink-0">
								<span
									className="font-mono text-[160px] font-black leading-none select-none tracking-tighter text-transparent"
									style={{
										WebkitTextStroke: "1px rgba(255,255,255,0.03)",
										textShadow: "0 0 20px rgba(255,77,0,0.02)",
									}}
								>
									0{activeIndex + 1}
								</span>
								<div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-[1px] bg-[#FF4D00]/50" />
							</div>

							<div className="flex flex-col gap-6 pt-4 flex-1">
								{/* Label Plate */}
								<div className="flex flex-col gap-1.5">
									<div className="flex items-center gap-3">
										<div className="w-2 h-2 bg-[#FF4D00]/80" />
										<h3 className="font-sans text-[10px] font-bold tracking-[0.5em] uppercase text-neutral-200 leading-none">
											{SPECS[activeIndex].label}
										</h3>
									</div>
									<p className="font-mono text-[9px] text-neutral-600 uppercase tracking-widest">
										STATUS_ID:{" "}
										{Math.floor(Math.random() * 1000)
											.toString(16)
											.toUpperCase()}
										_0x1
									</p>
								</div>

								{/* Value Ticker */}
								<div className="font-mono text-7xl text-[#FF4D00] font-medium tracking-tighter leading-none py-2 border-y border-neutral-900/30">
									<ScrambleText
										text={SPECS[activeIndex].value}
										trigger={activeIndex}
									/>
								</div>

								{/* Description */}
								<div className="flex flex-col gap-4">
									<p className="font-mono text-[10px] text-neutral-500 max-w-md leading-relaxed uppercase tracking-wider">
										{SPECS[activeIndex].description}
									</p>
									<div className="flex gap-1.5 pt-1">
										{Array.from({ length: 12 }).map((_, i) => (
											<div
												key={i}
												className={`w-3 h-1 ${i < (activeIndex + 1) * 4 ? "bg-[#FF4D00]/60" : "bg-neutral-900/30"}`}
											/>
										))}
									</div>
								</div>
							</div>
						</div>
					</motion.div>
				</AnimatePresence>
			</div>

			{/* Industrial Perimeter Markings (HUD Style) */}
			<div className="absolute bottom-4 left-8 right-8 flex gap-8 items-center border-t border-neutral-900/30 pt-4">
				<div className="flex flex-col gap-1">
					<span className="font-mono text-[8px] text-neutral-700 tracking-[0.3em] uppercase">
						MODULE_ALPHA_LOCK
					</span>
					<span className="font-mono text-[9px] text-neutral-600 tracking-wider">
						X-233-ALPHA-{SPECS[activeIndex].id}
					</span>
				</div>
				<div className="h-6 w-[1px] bg-neutral-900/50" />
				<div className="flex flex-col gap-1 text-right ml-auto">
					<span className="font-mono text-[8px] text-neutral-700 tracking-[0.3em] uppercase">
						LOC_GATEWAY_COORD
					</span>
					<span className="font-mono text-[9px] text-neutral-600 tracking-wider">
						5.6037 N / 0.1870 W
					</span>
				</div>
			</div>
		</div>
	);
};
