"use client";

import { motion } from "framer-motion";
import React from "react";
import { cn } from "@/lib/utils";

interface BraunAssetStagingProps {
	isHovered?: boolean;
}

export function BraunAssetStaging({
	isHovered: externalHover = false,
}: BraunAssetStagingProps) {
	const [internalHover, setInternalHover] = React.useState(false);
	const isHovered = externalHover || internalHover;

	return (
		<div
			className="relative w-32 h-32 flex items-center justify-center perspective-1000 group/staging"
			onMouseEnter={() => setInternalHover(true)}
			onMouseLeave={() => setInternalHover(false)}
		>
			{/* The Staging Tray (Recessed Base) */}
			<div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] overflow-hidden transition-colors duration-500 group-hover/staging:bg-neutral-200 dark:group-hover/staging:bg-neutral-800">
				{/* Technical Grid on the tray surface */}
				<div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.1]">
					<div className="grid grid-cols-4 grid-rows-4 h-full w-full">
						{Array.from({ length: 16 }).map((_, i) => (
							<div
								key={i}
								className="border border-neutral-900 dark:border-white"
							/>
						))}
					</div>
				</div>
				{/* Ambient Light Sweep */}
				<motion.div
					className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full"
					animate={isHovered ? { x: ["100%", "-100%"] } : {}}
					transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
				/>
			</div>

			{/* Floating Identity Plates (The Assets) */}
			<div className="relative w-16 h-16 transform-style-3d">
				{/* Plate 3 (Bottom/Offset) */}
				<motion.div
					className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-sm shadow-sm"
					animate={{
						y: isHovered ? -15 : 0,
						x: isHovered ? 10 : 0,
						rotateZ: isHovered ? 8 : 0,
						rotateX: isHovered ? -5 : 0,
					}}
					transition={{ type: "spring", stiffness: 200, damping: 20 }}
				/>

				{/* Plate 2 (Middle/Offset) */}
				<motion.div
					className="absolute inset-0 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-sm shadow-md"
					animate={{
						y: isHovered ? -30 : 0,
						x: isHovered ? -5 : 0,
						rotateZ: isHovered ? -4 : 0,
						rotateX: isHovered ? -5 : 0,
					}}
					transition={{
						type: "spring",
						stiffness: 200,
						damping: 20,
						delay: 0.02,
					}}
				/>

				{/* Plate 1 (Top/Primary) */}
				<motion.div
					className="absolute inset-0 bg-white dark:bg-neutral-600 border border-neutral-200 dark:border-neutral-500 rounded-sm shadow-lg flex flex-col p-2 gap-1.5"
					animate={{
						y: isHovered ? -45 : 0,
						scale: isHovered ? 1.1 : 1,
						rotateX: isHovered ? -5 : 0,
					}}
					transition={{
						type: "spring",
						stiffness: 200,
						damping: 20,
						delay: 0.04,
					}}
				>
					{/* Abstract "Logo" mark on the plate */}
					<motion.div
						className="w-4 h-4 bg-[#FF4D00] rounded-[1px]"
						animate={isHovered ? { opacity: [0.6, 1, 0.6] } : { opacity: 0.8 }}
						transition={{ duration: 2, repeat: Infinity }}
					/>
					<div className="w-full h-1 bg-neutral-200 dark:bg-neutral-500 rounded-full" />
					<div className="w-2/3 h-1 bg-neutral-100 dark:bg-neutral-50 rounded-full opacity-50" />

					{/* Corner technical mark */}
					<div className="absolute bottom-1 right-1 font-mono text-[5px] text-neutral-400 opacity-50">
						REF_V01
					</div>
				</motion.div>
			</div>

			{/* Status LED (External to the tray) */}
			<motion.div
				className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2 py-1 bg-white/90 dark:bg-black/90 backdrop-blur-sm border border-neutral-200 dark:border-neutral-800 rounded-full shadow-sm z-30"
				animate={isHovered ? { y: 2, opacity: 1 } : { y: 0, opacity: 0.8 }}
			>
				<div className="w-1 h-1 rounded-full bg-[#FF4D00] animate-pulse" />
				<span className="font-mono text-[6px] text-neutral-500 uppercase tracking-tighter">
					Awaiting_Input
				</span>
			</motion.div>
		</div>
	);
}
