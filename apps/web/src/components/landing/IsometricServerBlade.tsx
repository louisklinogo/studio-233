"use client";

import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";

export const IsometricServerBlade = () => {
	return (
		<div className="relative w-[240px] h-[160px] opacity-80 hover:opacity-100 transition-opacity duration-500 perspective-[1000px] scale-125">
			<div className="relative w-full h-full transform rotate-x-60 rotate-z-45 scale-75">
				{/* Blade Layers */}
				{[0, 1, 2].map((i) => (
					<motion.div
						key={i}
						className="absolute w-[160px] h-[100px] border border-neutral-400 dark:border-neutral-600 bg-neutral-100/10 dark:bg-neutral-900/20 backdrop-blur-sm"
						style={{
							top: i * -25,
							left: i * 25,
							zIndex: 3 - i,
						}}
						initial={{ y: 0 }}
						animate={{ y: [0, -5, 0] }}
						transition={{
							duration: 4,
							repeat: Infinity,
							delay: i * 0.5,
							ease: "easeInOut",
						}}
					>
						{/* Internal Circuitry Lines */}
						<div className="absolute top-2 left-2 w-8 h-px bg-neutral-300 dark:bg-neutral-700" />
						<div className="absolute top-4 left-2 w-12 h-px bg-neutral-300 dark:bg-neutral-700" />
						<div className="absolute bottom-2 right-2 w-4 h-4 border border-neutral-300 dark:border-neutral-700 rounded-full" />

						{/* Status LED */}
						<motion.div
							className="absolute top-2 right-2 w-1 h-1 bg-emerald-500 rounded-full"
							animate={{ opacity: [0.2, 1, 0.2] }}
							transition={{ duration: 1, repeat: Infinity }}
						/>
					</motion.div>
				))}

				{/* Scanning Laser Line */}
				<motion.div
					className="absolute w-[140px] h-px bg-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.8)] z-50"
					style={{ top: 0, left: 0, rotate: -45 }}
					animate={{ top: ["0%", "100%", "0%"], opacity: [0, 1, 0] }}
					transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
				/>
			</div>

			<div className="absolute -bottom-4 left-0 w-full text-center">
				<span className="font-mono text-[8px] text-neutral-500 tracking-widest">
					SERVER_BLADE_CLUSTER
				</span>
			</div>
		</div>
	);
};
