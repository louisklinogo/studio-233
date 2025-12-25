"use client";

import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { AgentGrid } from "@/components/landing/AgentGrid";
import { NeuralCore3D } from "@/components/landing/NeuralCore3D";

export const AsciiCarousel = () => {
	return (
		<div className="relative w-full h-[500px] grid grid-cols-1 md:grid-cols-2 gap-0 border-y border-neutral-200 dark:border-neutral-800 overflow-hidden">
			{/* Left: The Totem (NeuralCore3D) */}
			<div className="relative flex items-center justify-center overflow-hidden border-r border-neutral-200 dark:border-neutral-800 min-h-[400px]">
				{/* Background Grid */}
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

				<div className="relative z-10 w-full h-full">
					<NeuralCore3D />
				</div>

				{/* Label */}
				<div className="absolute bottom-6 left-6 pointer-events-none z-20">
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5 }}
						className="flex flex-col gap-1"
					>
						<span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">
							Fig. 01
						</span>
						<span className="font-mono text-xs text-neutral-900 dark:text-white font-medium tracking-[0.2em] uppercase">
							Neural.Engine_v2.5
						</span>
					</motion.div>
				</div>
			</div>

			{/* Right: The Agent Grid */}
			<div className="relative min-h-[400px]">
				<AgentGrid />
			</div>
		</div>
	);
};
