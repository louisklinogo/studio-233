"use client";

import gsap from "gsap";
import React, { useEffect, useRef, useState } from "react";

interface SystemCalibrationLoaderProps {
	onComplete?: () => void;
}

/**
 * SystemCalibrationLoader - Awwwards-level x Braun Preloader
 * Simulates an industrial system boot and aperture calibration.
 */
export const SystemCalibrationLoader: React.FC<
	SystemCalibrationLoaderProps
> = ({ onComplete }) => {
	const [progress, setProgress] = useState(0);
	const [status, setStatus] = useState("MOUNTING_CORE");
	const containerRef = useRef<HTMLDivElement>(null);
	const dotRef = useRef<HTMLDivElement>(null);
	const crosshairRef = useRef<HTMLDivElement>(null);
	const metadataRef = useRef<HTMLDivElement>(null);

	const logs = [
		"MOUNTING_CORE_FILESYSTEM",
		"ESTABLISHING_NEURAL_LINK",
		"CALIBRATING_OPTICS_V2.5",
		"SYNCHRONIZING_GRID_ARRAYS",
		"READY_FOR_HANDSHAKE",
	];

	useEffect(() => {
		const ctx = gsap.context(() => {
			const tl = gsap.timeline({
				onComplete: () => {
					if (onComplete) onComplete();
				},
			});

			// 1. Initial State: Black Screen, Dot pulse
			gsap.set(dotRef.current, { scale: 0, opacity: 1 });
			gsap.set(crosshairRef.current, { opacity: 0 });

			tl.to(dotRef.current, {
				scale: 1,
				duration: 1.5,
				ease: "expo.out",
			}).to(dotRef.current, {
				boxShadow: "0 0 40px #fff",
				repeat: 3,
				yoyo: true,
				duration: 0.4,
			});

			// 2. Crosshair Expansion
			tl.to(
				crosshairRef.current,
				{
					opacity: 0.1,
					duration: 0.8,
				},
				"-=0.5",
			);

			// 3. Progress Simulation
			const progressObj = { value: 0 };
			tl.to(
				progressObj,
				{
					value: 100,
					duration: 4,
					ease: "power2.inOut",
					onUpdate: () => {
						const p = Math.floor(progressObj.value);
						setProgress(p);
						// Update status based on progress
						const logIdx = Math.floor((p / 100) * logs.length);
						if (logs[logIdx]) setStatus(logs[logIdx]);
					},
				},
				1.0,
			);

			// 4. Glitch Focus Passes
			tl.to(
				containerRef.current,
				{
					filter: "blur(10px)",
					duration: 0.1,
					repeat: 5,
					yoyo: true,
					ease: "none",
				},
				2.5,
			);

			// 5. Final Explosion Transition
			tl.to(
				dotRef.current,
				{
					scaleX: 200,
					scaleY: 0.01,
					backgroundColor: "#FF4400",
					duration: 0.8,
					ease: "expo.inOut",
				},
				"+=0.2",
			);

			tl.to(containerRef.current, {
				opacity: 0,
				duration: 0.6,
				ease: "power2.in",
			});
		}, containerRef);

		return () => ctx.revert();
	}, [onComplete]);

	return (
		<div
			ref={containerRef}
			className="fixed inset-0 z-[200] bg-[#050505] flex flex-col items-center justify-center overflow-hidden font-sans select-none"
		>
			{/* Central Aperture Dot */}
			<div
				ref={dotRef}
				className="w-2 h-2 bg-white rounded-full relative z-10"
			/>

			{/* Technical Crosshairs */}
			<div ref={crosshairRef} className="absolute inset-0 pointer-events-none">
				<div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white" />
				<div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white" />
			</div>

			{/* Progress Metadata */}
			<div className="absolute bottom-12 left-12 flex flex-col gap-1 z-20">
				<span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
					Calibration_Sequence
				</span>
				<div className="flex items-center gap-4">
					<span className="text-xl font-mono text-white w-20">
						{progress.toString().padStart(3, "0")}%
					</span>
					<div className="h-4 w-[1px] bg-neutral-800" />
					<span className="text-[10px] font-mono text-[#FF4400] uppercase tracking-[0.4em] font-bold animate-pulse">
						{status}
					</span>
				</div>
			</div>

			{/* Floating System Data (Top Right) */}
			<div className="absolute top-12 right-12 text-right flex flex-col gap-1 opacity-20">
				<span className="text-[8px] font-mono text-white uppercase tracking-widest">
					Studio+233 // Core_Boot
				</span>
				<span className="text-[8px] font-mono text-white uppercase tracking-widest">
					Ver: 2.5.0_RC1
				</span>
			</div>
		</div>
	);
};
