"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

const SAMPLES = [
	"/samples/077b8fd4-b483-4032-b4bb-16e97300d431.jpg",
	"/samples/0d26b6ad9803b55c02649b269411db07.jpg",
	"/samples/15bd5e486b8711c761ed385eafa4948c.jpg",
	"/samples/1a9ffc22a6bc418fd161578ca525a769.jpg",
	"/samples/329597df4e8b308c85ec490a0a2567be.jpg",
	"/samples/510da59cd8a63f4690f8868787df87ff.jpg",
	"/samples/5950210e5984e10fdc5842bfae90ae0c.jpg",
	"/samples/5b298b19195d804a1589d6c5ab49a464.jpg",
	"/samples/5f23f01a-cf87-4d96-9aa3-08ecee07f68a.jpeg",
	"/samples/69086693c2ad1c14c7a7dbeb660aa851.jpg",
	"/samples/8208979666545e33e1bf36ba3e5b34ca.jpg",
	"/samples/8ea7a5cb-15b4-4419-be46-a629eb9684cc.jpeg",
];

const Column = ({
	images,
	y,
	speed = 1,
}: {
	images: string[];
	y: any;
	speed?: number;
}) => {
	return (
		<motion.div style={{ y }} className="flex flex-col gap-4 w-full">
			{/* Triple the array to ensure infinite loop illusion */}
			{[...images, ...images, ...images].map((src, i) => (
				<div key={i} className="relative aspect-[3/4] w-full overflow-hidden">
					{/* Full Color Image (The Processed Result) */}
					<img
						src={src}
						alt="Batch Asset"
						className="absolute inset-0 w-full h-full object-cover"
					/>

					{/* Raw Input Overlay (Grayscale + Pixelated) */}
					{/* We use a mask on the container to reveal the color version below the scanner line */}
					{/* But since this whole column moves, the 'line' is fixed in the viewport relative to the container */}
					{/* Actually, easier approach: CSS Filter transition based on position is hard. */}
					{/* Better: Two fixed viewport layers. One Grayscale (Top), One Color (Bottom). */}
				</div>
			))}
		</motion.div>
	);
};

export const BatchRefinery = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [offset, setOffset] = useState(0);

	// Auto-scroll logic
	useEffect(() => {
		let animId: number;
		const loop = () => {
			setOffset((prev) => prev - 0.5); // Constant speed
			animId = requestAnimationFrame(loop);
		};
		loop();
		return () => cancelAnimationFrame(animId);
	}, []);

	// Virtual offset for the infinite loop
	// We wrap the offset around a certain height to reset silently
	const WRAP_HEIGHT = 2000; // Approx height of one set
	const y1 = offset % WRAP_HEIGHT;
	const y2 = (offset * 1.2) % WRAP_HEIGHT; // Parallax speed

	return (
		<div
			ref={containerRef}
			className="relative w-full h-full bg-neutral-950 overflow-hidden border-l border-neutral-800"
		>
			{/* HUD Scanner Line - The "Transformation Point" */}
			<div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#FF4D00] z-30 shadow-[0_0_15px_#FF4D00]">
				<div className="absolute right-2 -top-2 text-[9px] font-mono text-[#FF4D00] bg-black px-1">
					BATCH_THRESHOLD_01
				</div>
			</div>

			{/* The "Mask" Concept:
          We render the SAME content twice.
          Layer 1 (Bottom): Full Color. Visible ONLY below the line (top: 50%).
          Layer 2 (Top): Grayscale/Wireframe. Visible ONLY above the line (bottom: 50%).
      */}

			{/* LAYER 1: PROCESSED (COLOR) - Bottom Half */}
			<div className="absolute inset-0 z-10 clip-path-bottom">
				<div className="flex gap-4 p-4 h-full">
					<div className="w-1/2 relative">
						<motion.div
							className="flex flex-col gap-4"
							style={{ transform: `translateY(${y1}px)` }}
						>
							{[...SAMPLES, ...SAMPLES, ...SAMPLES].map((src, i) => (
								<img
									key={i}
									src={src}
									className="w-full aspect-[3/4] object-cover opacity-80 contrast-125"
								/>
							))}
						</motion.div>
					</div>
					<div className="w-1/2 relative">
						<motion.div
							className="flex flex-col gap-4"
							style={{ transform: `translateY(${y2}px)` }}
						>
							{[...SAMPLES, ...SAMPLES, ...SAMPLES].map((src, i) => (
								<img
									key={i}
									src={src}
									className="w-full aspect-[3/4] object-cover opacity-80 contrast-125"
								/>
							))}
						</motion.div>
					</div>
				</div>
			</div>

			{/* LAYER 2: RAW (GRAYSCALE / BLUEPRINT) - Top Half */}
			<div className="absolute inset-0 z-20 clip-path-top bg-neutral-950">
				<div className="flex gap-4 p-4 h-full">
					<div className="w-1/2 relative">
						<motion.div
							className="flex flex-col gap-4"
							style={{ transform: `translateY(${y1}px)` }}
						>
							{[...SAMPLES, ...SAMPLES, ...SAMPLES].map((src, i) => (
								<div key={i} className="relative w-full aspect-[3/4]">
									<img
										src={src}
										className="w-full h-full object-cover grayscale brightness-50 contrast-150 pixelated"
									/>
									{/* Wireframe Overlay Effect */}
									<div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-30 bg-[size:10px_10px]" />
									<div className="absolute top-2 left-2 text-[8px] font-mono text-white/50 bg-black/50 px-1">
										RAW_INPUT
									</div>
								</div>
							))}
						</motion.div>
					</div>
					<div className="w-1/2 relative">
						<motion.div
							className="flex flex-col gap-4"
							style={{ transform: `translateY(${y2}px)` }}
						>
							{[...SAMPLES, ...SAMPLES, ...SAMPLES].map((src, i) => (
								<div key={i} className="relative w-full aspect-[3/4]">
									<img
										src={src}
										className="w-full h-full object-cover grayscale brightness-50 contrast-150 pixelated"
									/>
									<div className="absolute top-2 left-2 text-[8px] font-mono text-white/50 bg-black/50 px-1">
										RAW_INPUT
									</div>
								</div>
							))}
						</motion.div>
					</div>
				</div>

				{/* Vignette for the top to fade in inputs */}
				<div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-neutral-950 to-transparent z-30" />
			</div>

			<style jsx>{`
				.clip-path-top {
					clip-path: polygon(0 0, 100% 0, 100% 50%, 0 50%);
				}
				.clip-path-bottom {
					clip-path: polygon(0 50%, 100% 50%, 100% 100%, 0 100%);
				}
				.pixelated {
					image-rendering: pixelated;
				}
			`}</style>
		</div>
	);
};
