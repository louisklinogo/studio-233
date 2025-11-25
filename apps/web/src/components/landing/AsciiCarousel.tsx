"use client";

import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { AsciiDonut } from "@/components/landing/AsciiDonut";
import { SystemSpecs } from "@/components/landing/SystemSpecs";

export const AsciiCarousel = () => {
	return (
		<div className="relative w-full h-[400px] grid grid-cols-1 md:grid-cols-2 gap-0 border-y border-neutral-200 dark:border-neutral-800 overflow-hidden">

			{/* Left: The Totem (AsciiDonut) */}
			<div className="relative flex items-center justify-center overflow-hidden border-r border-neutral-200 dark:border-neutral-800 min-h-[300px]">
				{/* Background Grid */}
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

				<div className="relative z-10 scale-110">
					<AsciiDonut />
				</div>

				{/* Label */}
				<div className="absolute bottom-6 left-6 pointer-events-none">
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
							Geometry.Torus
						</span>
					</motion.div>
				</div>
			</div>

			{/* Right: The Spec (SystemSpecs) */}
			<div className="relative min-h-[300px] border-l border-neutral-200 dark:border-neutral-800">
				{/* Background Grid */}
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

				<SystemSpecs />
			</div>
		</div>
	);
};
