"use client";

import React, { forwardRef, useImperativeHandle, useRef } from "react";

export interface VortexHeroHandle {
	studio: HTMLSpanElement | null;
	plus: HTMLSpanElement | null;
	numeric: HTMLSpanElement | null;
	surface: HTMLDivElement | null;
}

/**
 * VortexHero is a presentational component that exposes its internal elements
 * for animation via useImperativeHandle. It is intended to be orchestrated
 * by VortexContainer.
 */
export const VortexHero = forwardRef<VortexHeroHandle, {}>((_props, ref) => {
	const studioRef = useRef<HTMLSpanElement>(null);
	const plusRef = useRef<HTMLSpanElement>(null);
	const numericRef = useRef<HTMLSpanElement>(null);
	const surfaceRef = useRef<HTMLDivElement>(null);

	useImperativeHandle(ref, () => ({
		studio: studioRef.current,
		plus: plusRef.current,
		numeric: numericRef.current,
		surface: surfaceRef.current,
	}));

	return (
		<div
			ref={surfaceRef}
			className="absolute inset-0 z-10 bg-[#050505] flex items-center justify-center overflow-hidden"
		>
			{/* Background Grid */}
			<div
				className="absolute inset-0 opacity-10"
				style={{
					backgroundImage: "radial-gradient(#D81E05 0.5px, transparent 0.5px)",
					backgroundSize: "32px 32px",
				}}
			/>

			<div className="relative flex items-center justify-center font-black tracking-tighter text-[12vw] md:text-[15vw] select-none text-[#D81E05] z-20">
				{/* Left Text */}
				<span
					ref={studioRef}
					className="relative inline-block will-change-transform z-50"
				>
					STUDIO
				</span>

				{/* The Aperture (Central +) */}
				<span
					ref={plusRef}
					className="relative inline-block mx-1 md:mx-2 text-[1.2em] will-change-transform origin-center z-40"
				>
					{/* Inner element handles color to ensure it's white (the light) */}
					<span className="block text-[#f4f4f0]">+</span>
				</span>

				{/* Right Text */}
				<span
					ref={numericRef}
					className="relative inline-block will-change-transform z-50"
				>
					233
				</span>
			</div>
		</div>
	);
});

VortexHero.displayName = "VortexHero";
