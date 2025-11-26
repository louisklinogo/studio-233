"use client";

import { motion } from "framer-motion";
import React from "react";

export const LensApertureSchematic = () => {
	return (
		<div className="relative w-[200px] h-[200px] flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity duration-500 scale-110">
			{/* Outer Ring - Static with ticks */}
			<div className="absolute inset-0 rounded-full border border-neutral-200 dark:border-neutral-800">
				{[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
					<div
						key={deg}
						className="absolute w-2 h-px bg-neutral-400 dark:bg-neutral-600 top-1/2 left-1/2 origin-left"
						style={{ transform: `rotate(${deg}deg) translateX(95px)` }}
					/>
				))}
			</div>

			{/* Middle Ring - Rotating CW */}
			<motion.div
				className="absolute w-[160px] h-[160px] rounded-full border border-dashed border-neutral-300 dark:border-neutral-700"
				animate={{ rotate: 360 }}
				transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
			/>

			{/* Inner Ring - Rotating CCW */}
			<motion.div
				className="absolute w-[110px] h-[110px] rounded-full border border-dotted border-neutral-400 dark:border-neutral-600"
				animate={{ rotate: -360 }}
				transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
			/>

			{/* Aperture Blades (Triangles) */}
			<div className="absolute w-[70px] h-[70px] overflow-hidden flex items-center justify-center">
				<motion.div
					className="w-full h-full bg-neutral-100 dark:bg-neutral-900 border border-emerald-500/50"
					animate={{ scale: [0.8, 1.2, 0.8], rotate: [0, 90, 0] }}
					transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
					style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
				/>
			</div>

			{/* Crosshair Overlay */}
			<div className="absolute w-full h-px bg-emerald-500/20" />
			<div className="absolute h-full w-px bg-emerald-500/20" />

			{/* Label */}
			<div className="absolute -bottom-6 left-0 w-full text-center">
				<span className="font-mono text-[8px] text-neutral-500 tracking-widest">
					OPTICAL_SENSOR_ARRAY
				</span>
			</div>
		</div>
	);
};
