"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import React, { useRef } from "react";

export const ProductHologram = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start end", "end start"],
	});

	// Parallax & Tilt Effects
	const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
	const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [15, 0, -15]);
	const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
	const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

	return (
		<section
			ref={containerRef}
			className="relative z-20 min-h-[120vh] flex flex-col items-center justify-center bg-[#f4f4f0] dark:bg-[#0a0a0a] overflow-hidden"
		>
			{/* Background Gradient */}
			<div className="absolute inset-0 bg-gradient-to-b from-transparent via-neutral-200/50 dark:via-neutral-900/50 to-transparent pointer-events-none" />

			{/* The "Hologram" Container */}
			<motion.div
				style={{ y, rotateX, scale, opacity }}
				className="relative w-[90vw] max-w-6xl aspect-video rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 shadow-2xl bg-black overflow-hidden perspective-[2000px]"
			>
				{/* Glass Reflection Overlay */}
				<div className="absolute inset-0 z-20 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />

				{/* The Interface Video/Mockup */}
				<div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-900">
					{/* Placeholder for high-res interface loop */}
					<div className="relative w-full h-full">
						<div className="absolute inset-0 grid grid-cols-12 gap-4 p-8 opacity-50">
							{/* Mock Sidebar */}
							<div className="col-span-2 h-full border-r border-white/10" />

							{/* Mock Canvas Area */}
							<div className="col-span-8 h-full relative">
								{/* Floating Nodes Mockup */}
								<div className="absolute top-1/4 left-1/4 w-32 h-20 border border-[#ea580c] rounded bg-[#ea580c]/10" />
								<div className="absolute top-1/2 left-1/2 w-32 h-20 border border-white/20 rounded bg-white/5" />
								<svg className="absolute inset-0 w-full h-full pointer-events-none">
									<path
										d="M 200 150 C 300 150, 300 300, 400 300"
										stroke="#ea580c"
										strokeWidth="2"
										fill="none"
									/>
								</svg>
							</div>

							{/* Mock Inspector */}
							<div className="col-span-2 h-full border-l border-white/10" />
						</div>

						{/* Center Label */}
						<div className="absolute inset-0 flex items-center justify-center">
							<span className="font-mono text-xs text-neutral-500 tracking-[0.5em] uppercase">
								Interface_Preview_v2.0
							</span>
						</div>
					</div>
				</div>

				{/* Bottom Glow */}
				<div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#ea580c]/20 to-transparent z-30" />
			</motion.div>

			{/* Caption */}
			<motion.div style={{ opacity }} className="mt-12 text-center">
				<h3 className="font-sans text-2xl font-bold tracking-tight mb-2">
					The Glass Cockpit
				</h3>
				<p className="font-mono text-xs text-neutral-500 uppercase tracking-widest">
					Complete Control Over the Latent Space
				</p>
			</motion.div>
		</section>
	);
};
