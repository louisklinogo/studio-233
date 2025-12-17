"use client";

import React, { useEffect, useRef, useState } from "react";

export const ScannerFooter = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [beamX, setBeamX] = useState(50); // Percentage 0-100

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const handleMouseMove = (e: MouseEvent) => {
			const rect = container.getBoundingClientRect();
			// Calculate mouse X position relative to the container as a percentage
			const x = ((e.clientX - rect.left) / rect.width) * 100;
			// Clamp between 0 and 100
			setBeamX(Math.max(0, Math.min(100, x)));
		};

		const handleMouseLeave = () => {
			// Optional: Return to center or keep auto-scan behavior
			// For now, let's leave it where it was or we can add an auto-scan mode
		};

		container.addEventListener("mousemove", handleMouseMove);
		container.addEventListener("mouseleave", handleMouseLeave);

		return () => {
			container.removeEventListener("mousemove", handleMouseMove);
			container.removeEventListener("mouseleave", handleMouseLeave);
		};
	}, []);

	return (
		<div
			ref={containerRef}
			className="w-full overflow-hidden relative cursor-crosshair group"
		>
			{/* Base Text (Dim) */}
			<h1 className="text-[20vw] leading-[0.8] font-bold tracking-tighter text-neutral-300/30 dark:text-neutral-800/30 select-none pointer-events-none whitespace-nowrap -ml-1 transition-colors duration-500 group-hover:text-neutral-300/10 dark:group-hover:text-neutral-800/10">
				■ STUDIO
				<span className="text-[0.4em] inline-block align-top -mt-2 ml-1">
					+233
				</span>
			</h1>

			{/* Scanned Text (Dynamic Reveal) */}
			<h1
				className="absolute inset-0 text-[20vw] leading-[0.8] font-bold tracking-tighter select-none pointer-events-none whitespace-nowrap -ml-1 text-[#BFFF6D]"
				style={{
					clipPath: `polygon(${beamX - 10}% 0%, ${beamX + 10}% 0%, ${beamX + 10}% 100%, ${beamX - 10}% 100%)`,
					textShadow: "0 0 20px rgba(191,255,109,0.5)",
					transition: "clip-path 0.1s ease-out",
				}}
			>
				■ STUDIO
				<span className="text-[0.4em] inline-block align-top -mt-2 ml-1">
					+233
				</span>
			</h1>

			{/* The Beam Line */}
			<div
				className="absolute inset-y-0 w-[2px] bg-[#BFFF6D] pointer-events-none shadow-[0_0_20px_#BFFF6D]"
				style={{
					left: `${beamX}%`,
					transition: "left 0.1s ease-out",
				}}
			/>

			{/* Hidden Links Reveal */}
			<div
				className="absolute top-1/2 -translate-y-1/2 flex gap-8 pointer-events-auto z-20 mix-blend-difference px-12"
				style={{
					left: `${beamX}%`,
					transform: "translate(-50%, -50%)",
					opacity: 0, // Hidden by default
					// Only show when hovering container (managed by CSS or we can force it)
				}}
			>
				{/* Links could appear here inside the beam */}
			</div>
		</div>
	);
};
