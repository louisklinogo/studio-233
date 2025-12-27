"use client";

import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { useMouseCoordinates } from "@/hooks/useMouseCoordinates";

export interface VortexHeroHandle {
	studio: HTMLSpanElement | null;
	plus: HTMLSpanElement | SVGSVGElement | null;
	numeric: HTMLSpanElement | null;
	surface: HTMLDivElement | null;
}

export const VortexHeroV2 = forwardRef<VortexHeroHandle, {}>((_props, ref) => {
	const studioRef = useRef<HTMLSpanElement>(null);
	const plusRef = useRef<SVGSVGElement>(null);
	const numericRef = useRef<HTMLSpanElement>(null);
	const surfaceRef = useRef<HTMLDivElement>(null);

	const mousePos = useMouseCoordinates();

	useImperativeHandle(ref, () => ({
		studio: studioRef.current,
		plus: plusRef.current,
		numeric: numericRef.current,
		surface: surfaceRef.current,
	}));

	return (
		<div
			ref={surfaceRef}
			className="absolute inset-0 z-10 bg-[#f4f4f0] flex flex-col justify-between p-8 lg:p-12 overflow-hidden select-none font-sans"
		>
			{/* --- Background Elements --- */}
			<div
				className="absolute inset-0 opacity-[0.03] pointer-events-none"
				style={{
					backgroundImage: `linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)`,
					backgroundSize: "40px 40px",
				}}
			/>

			{/* Mouse Coordinates HUD (Restored V1 Style) */}
			<div className="absolute top-1/2 right-8 -translate-y-1/2 flex flex-col items-end gap-1 pointer-events-none opacity-40">
				<span className="text-[9px] font-mono tracking-widest text-[#1a1a1a]">
					[X].{Math.round(mousePos.x).toString().padStart(3, "0")}PX
				</span>
				<span className="text-[9px] font-mono tracking-widest text-[#1a1a1a]">
					[Y].{Math.round(mousePos.y).toString().padStart(3, "0")}PX
				</span>
			</div>

			{/* --- Top Metadata --- */}
			<div className="flex justify-between items-start z-20">
				<div className="flex flex-col">
					<span className="text-[10px] font-hal text-neutral-400 uppercase tracking-[0.4em] mb-1">
						System_Ref
					</span>
					<span className="text-[12px] font-hal text-[#1a1a1a] uppercase tracking-widest font-bold">
						VORTEX_STREAM_v2.5
					</span>
				</div>
				<div className="text-right">
					<span className="text-[9px] font-hal text-neutral-400 uppercase tracking-widest block">
						Status: Active_Handshake
					</span>
					<span className="text-[9px] font-hal text-[#FF4400] uppercase tracking-widest font-bold">
						PROTOCOL_READY
					</span>
				</div>
			</div>

			{/* --- Main Headline (Act I) --- */}
			<div className="relative z-20 mt-auto mb-auto">
				<h1 className="text-[13vw] font-black tracking-tighter leading-[0.8] flex flex-col text-[#1a1a1a]">
					<span
						ref={studioRef}
						className="flex items-center gap-[0.02em] will-change-transform"
					>
						STUDIO
					</span>
					<span className="flex items-center">
						<span className="inline-block mx-[0.05em] text-[#FF4400] origin-center will-change-transform h-[10vw] w-[10vw]">
							<svg
								ref={plusRef}
								viewBox="0 0 100 100"
								className="w-full h-full fill-current"
								style={{ shapeRendering: "geometricPrecision" }}
								data-testid="hero-plus-svg"
							>
								<rect x="35" y="0" width="30" height="100" />
								<rect x="0" y="35" width="100" height="30" />
							</svg>
						</span>
						<span ref={numericRef} className="will-change-transform">
							233
						</span>
						<span className="text-[4vw] font-medium align-top mt-[1.2vw] ml-[0.5vw]">
							™
						</span>
					</span>
				</h1>
			</div>

			{/* --- Bottom Interface (Cleaned) --- */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-auto items-end z-20">
				{/* Col 1: Empty (Removed Barcode) */}
				<div className="lg:col-span-4 h-12 flex items-end">
					{/* Optional: Minimal decorative line instead of barcode */}
					<div className="h-[1px] w-12 bg-[#FF4400]"></div>
				</div>

				{/* Col 2: Empty (Removed Abstract Text) */}
				<div className="lg:col-span-4"></div>

				{/* Col 3: Active Chapters (Kept) */}
				<div className="lg:col-span-4 flex justify-end">
					<div className="text-right space-y-1">
						<span className="text-[8px] font-hal text-neutral-400 uppercase tracking-[0.4em] block mb-2">
							Sequence
						</span>
						{["01_SCHEMATIC", "02_PROCESSING", "03_RENDER"].map((chapter) => (
							<span
								key={chapter}
								className="text-[10px] font-hal block text-[#1a1a1a] tracking-wider hover:text-[#FF4400] transition-colors cursor-crosshair"
							>
								{chapter}
							</span>
						))}
					</div>
				</div>
			</div>
		</div>
	);
});

VortexHeroV2.displayName = "VortexHeroV2";
