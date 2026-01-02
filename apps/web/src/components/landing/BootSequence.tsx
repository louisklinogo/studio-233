"use client";

import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import React, { useEffect, useRef, useState } from "react";
import { ScrambleText } from "./ScrambleText";

export const BootSequence = ({ onComplete }: { onComplete: () => void }) => {
	const [isComplete, setIsComplete] = useState(false);
	const [shouldRender, setShouldRender] = useState(true);
	const [telemetry, setTelemetry] = useState<string[]>([]);
	const containerRef = useRef<HTMLDivElement>(null);
	const gridRef = useRef<HTMLDivElement>(null);
	const coreRef = useRef<HTMLDivElement>(null);

	const BOOT_LOGS = [
		"INITIALIZING_VORTEX_ENGINE...",
		"CALIBRATING_SPATIAL_GRID...",
		"ESTABLISHING_KINETIC_SYNC...",
		"BOOT_SEQUENCE_COMPLETE.",
	];

	useEffect(() => {
		// Session Check
		const hasBooted = sessionStorage.getItem("studio-booted");
		if (hasBooted) {
			setIsComplete(true);
			setShouldRender(false);
			onComplete();
			return;
		}

		const ctx = gsap.context(() => {
			const tl = gsap.timeline({
				onComplete: () => {
					setTimeout(() => {
						setIsComplete(true);
						onComplete();
						sessionStorage.setItem("studio-booted", "true");
						setTimeout(() => setShouldRender(false), 1000);
					}, 500);
				},
			});

			// 1. Grid Assembly
			tl.fromTo(
				gridRef.current,
				{ opacity: 0, scale: 1.1 },
				{ opacity: 0.05, scale: 1, duration: 2, ease: "power2.out" },
			);

			// 2. Telemetry Logs
			BOOT_LOGS.forEach((log, i) => {
				tl.add(
					() => {
						setTelemetry((prev) => [...prev, log]);
					},
					i * 0.8 + 0.5,
				);
			});

			// 3. Core Construction (The Matte Black Core)
			tl.fromTo(
				coreRef.current,
				{ scaleX: 0, scaleY: 0, opacity: 0, rotateX: -90 },
				{
					scaleX: 1,
					scaleY: 1,
					opacity: 1,
					rotateX: 0,
					duration: 1.5,
					ease: "expo.inOut",
				},
				1.5,
			);

			// 4. Success Flash
			tl.to(
				containerRef.current,
				{ backgroundColor: "#FF4D00", duration: 0.05 },
				3.5,
			);
			tl.to(
				containerRef.current,
				{ backgroundColor: "#0a0a0a", duration: 0.15 },
				3.55,
			);
		}, containerRef);

		return () => ctx.revert();
	}, [onComplete]);

	if (!shouldRender) return null;

	return (
		<AnimatePresence>
			{!isComplete && (
				<motion.div
					ref={containerRef}
					initial={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 1, ease: "easeOut" }}
					className="fixed inset-0 z-[100] bg-[#0a0a0a] flex items-center justify-center overflow-hidden"
				>
					{/* Schematic Grid */}
					<div
						ref={gridRef}
						className="absolute inset-0 opacity-0 pointer-events-none"
						style={{
							backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
							backgroundSize: "40px 40px",
						}}
					/>

					{/* The Matte Black Core (Building) */}
					<div
						ref={coreRef}
						className="w-[120px] h-[120px] bg-[#1a1a1a] border border-white/10 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] relative z-10"
					/>

					{/* Telemetry HUD */}
					<div className="absolute bottom-12 left-12 flex flex-col gap-1 font-mono text-[9px] text-[#FF4D00] tracking-widest uppercase">
						{telemetry.map((log, i) => (
							<div key={i} className="flex gap-4">
								<span className="opacity-40">
									[{i.toString().padStart(2, "0")}]
								</span>
								<ScrambleText text={log} scrambleSpeed={10} />
							</div>
						))}
					</div>

					{/* System Header */}
					<div className="absolute top-12 left-12 flex flex-col gap-1">
						<span className="font-mono text-[10px] text-white opacity-40 tracking-[0.5em] uppercase">
							System_Handshake
						</span>
						<span className="font-mono text-[8px] text-[#FF4D00] tracking-[0.3em] uppercase">
							Initializing_Vortex_Protocol_v3.0
						</span>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};
