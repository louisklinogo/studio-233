"use client";

import {
	motion,
	useAnimation,
	useMotionValue,
	useTransform,
} from "framer-motion";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Magnetic } from "@/components/ui/Magnetic";
import { SwissIcons } from "@/components/ui/SwissIcons";

export const LaunchKeyFooter = () => {
	const router = useRouter();
	const [isActive, setIsActive] = useState(false);
	const controls = useAnimation();
	const x = useMotionValue(0);

	// Max drag distance
	const CONSTRAINT = 280;

	// Transforms
	const progress = useTransform(x, [0, CONSTRAINT], [0, 1]);
	const glowOpacity = useTransform(x, [0, CONSTRAINT], [0, 0.5]);
	const ledColor = useTransform(x, [0, CONSTRAINT], ["#ea580c", "#10b981"]); // Orange to Emerald

	const handleDragEnd = async () => {
		if (x.get() > CONSTRAINT - 20) {
			// Success Trigger
			setIsActive(true);
			controls.start({ x: CONSTRAINT });
			setTimeout(() => {
				router.push("/login");
			}, 1000);
		} else {
			// Reset
			controls.start({ x: 0 });
		}
	};

	return (
		<section className="relative w-full min-h-[50vh] flex flex-col items-center justify-center bg-[#0a0a0a] overflow-hidden border-t border-neutral-900 select-none">
			{/* Background Texture (Subtle Noise) */}
			<div
				className="absolute inset-0 opacity-[0.03]"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
				}}
			/>

			<div className="relative z-10 flex flex-col items-center gap-16">
				{/* Engraved Branding */}
				<div className="flex flex-col items-center gap-4">
					<h1
						className="text-[18vw] md:text-[12rem] font-bold tracking-tighter leading-none text-[#151515]"
						style={{
							textShadow:
								"0px 1px 0px rgba(255,255,255,0.08), inset 0px 2px 4px rgba(0,0,0,0.9)",
						}}
					>
						STUDIO+233
					</h1>
					<div className="flex items-center gap-4 text-[10px] font-mono text-neutral-500 tracking-[0.5em] uppercase">
						<span className="flex items-center gap-2">
							<div className="w-1 h-1 bg-[#FF4D00] rounded-full" />
							SYS.VER.2.0
						</span>
						<span className="text-neutral-800">///</span>
						<span className="text-neutral-400">STATE: READY</span>
					</div>
				</div>

				{/* Braun-Style Slider Mechanism */}
				<div className="relative w-[360px] h-[88px] bg-[#111] rounded-[4px] border border-[#222] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.05)] flex items-center px-2">
					{/* Track Ruler Markings */}
					<div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between px-2 pointer-events-none">
						{Array.from({ length: 20 }).map((_, i) => (
							<div
								key={i}
								className={`w-[1px] ${i % 5 === 0 ? "h-3 bg-neutral-600" : "h-1.5 bg-neutral-800"}`}
							/>
						))}
					</div>

					{/* Progress Fill (Behind) */}
					<motion.div
						className="absolute left-2 top-2 bottom-2 bg-neutral-800/20 rounded-[2px]"
						style={{ width: x }}
					/>

					{/* The Handle (Physical Switch) */}
					<Magnetic strength={0.4} range={120}>
						<motion.div
							drag="x"
							dragConstraints={{ left: 0, right: CONSTRAINT }}
							dragElastic={0}
							dragMomentum={false}
							onDragStart={() => {
								if ("vibrate" in navigator) navigator.vibrate(20);
							}}
							onDrag={(e, info) => {
								// Precise mechanical "clicks"
								const step = 20;
								if (Math.round(info.offset.x) % step === 0) {
									if ("vibrate" in navigator) navigator.vibrate(5);
								}
							}}
							onDragEnd={handleDragEnd}
							animate={controls}
							style={{ x }}
							className="relative z-20 w-[68px] h-[76px] bg-[#1a1a1a] rounded-[2px] border-t border-l border-[#333] border-b border-r border-black shadow-[0_8px_24px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.1)] cursor-grab active:cursor-grabbing flex items-center justify-center group"
						>
							{/* Ribbed Texture (Milled Aluminum Grip) */}
							<div className="flex gap-1.5 pointer-events-none">
								{[...Array(4)].map((_, i) => (
									<div
										key={i}
										className="w-[1.5px] h-10 bg-[#050505] border-r border-[#2a2a2a]/50"
									/>
								))}
							</div>

							{/* Status LED on Handle */}
							<div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-neutral-900 overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] flex items-center justify-center">
								<motion.div
									className="w-full h-full"
									style={{
										backgroundColor: ledColor,
										boxShadow: useTransform(
											progress,
											[0.85, 1],
											["0 0 0px #ea580c", "0 0 12px #10b981"],
										),
									}}
								/>
							</div>
						</motion.div>
					</Magnetic>

					{/* Destination Label */}
					<div className="absolute right-6 text-[10px] font-mono text-neutral-500 tracking-widest pointer-events-none">
						LAUNCH
					</div>
				</div>
			</div>
		</section>
	);
};
