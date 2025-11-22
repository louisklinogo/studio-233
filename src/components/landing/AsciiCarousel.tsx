"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { AsciiDonut } from "@/components/landing/AsciiDonut";
import { AsciiFluid } from "@/components/landing/AsciiFluid";
import { AsciiHypercube } from "@/components/landing/AsciiHypercube";

const COMPONENTS = [
	{ id: "donut", component: AsciiDonut, label: "GEOMETRY.TORUS" },
	{ id: "hypercube", component: AsciiHypercube, label: "DIMENSION.TESSERACT" },
	{ id: "fluid", component: AsciiFluid, label: "ORGANIC.FLUID" },
];

export const AsciiCarousel = () => {
	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentIndex((prev) => (prev + 1) % COMPONENTS.length);
		}, 8000); // Cycle every 8 seconds

		return () => clearInterval(interval);
	}, []);

	const CurrentComponent = COMPONENTS[currentIndex].component;

	return (
		<div className="relative w-full min-h-[40vh] grid grid-cols-2 gap-0">
			{/* Left: ASCII Carousel */}
			<div className="relative flex items-center justify-center group border-r border-neutral-200 dark:border-neutral-800">
				<AnimatePresence mode="wait">
					<motion.div
						key={currentIndex}
						initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
						animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
						exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
						transition={{ duration: 0.8, ease: "easeInOut" }}
						className="absolute inset-0"
					>
						<CurrentComponent />
					</motion.div>
				</AnimatePresence>

				{/* Label Overlay */}
				<div className="absolute bottom-4 left-4 pointer-events-none">
					<motion.p
						key={currentIndex}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						className="font-mono text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-widest"
					>
						{COMPONENTS[currentIndex].label}
					</motion.p>
				</div>

				{/* Dots */}
				<div className="absolute bottom-4 right-4 flex gap-2">
					{COMPONENTS.map((_, idx) => (
						<div
							key={idx}
							className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${
								idx === currentIndex
									? "bg-[#FF4D00] shadow-[0_0_10px_#FF4D00]"
									: "bg-neutral-800 dark:bg-neutral-700"
							}`}
						/>
					))}
				</div>
			</div>

			{/* Right: Empty space for now */}
			<div className="relative flex items-center justify-center">
				{/* You can add content here */}
			</div>
		</div>
	);
};
