"use client";

import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";

export interface VortexHeroHandle {
	studio: HTMLSpanElement | null;
	plus: HTMLSpanElement | null;
	numeric: HTMLSpanElement | null;
	surface: HTMLDivElement | null;
}

/**
 * VortexHeroV2 - Act I: The System Manual
 * A high-fidelity, typography-driven hero inspired by industrial Swiss design.
 */
export const VortexHeroV2 = forwardRef<VortexHeroHandle, {}>((_props, ref) => {
	const studioRef = useRef<HTMLSpanElement>(null);
	const plusRef = useRef<HTMLSpanElement>(null);
	const numericRef = useRef<HTMLSpanElement>(null);
	const surfaceRef = useRef<HTMLDivElement>(null);

	const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

	useImperativeHandle(ref, () => ({
		studio: studioRef.current,
		plus: plusRef.current,
		numeric: numericRef.current,
		surface: surfaceRef.current,
	}));

	useEffect(() => {
		const handleMove = (e: MouseEvent) => {
			setMousePos({
				x: (e.clientX / window.innerWidth) * 100,
				y: (e.clientY / window.innerHeight) * 100,
			});
		};
		window.addEventListener("mousemove", handleMove);
		return () => window.removeEventListener("mousemove", handleMove);
	}, []);

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

			{/* Mouse Coordinates HUD */}
			<div className="absolute top-1/2 left-8 -translate-y-1/2 flex flex-col gap-1 pointer-events-none opacity-40">
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
					<span className="text-[10px] font-mono text-neutral-400 uppercase tracking-[0.4em] mb-1">
						System_Ref
					</span>
					<span className="text-[12px] font-mono text-[#1a1a1a] uppercase tracking-widest font-bold">
						VORTEX_STREAM_v2.5
					</span>
				</div>
				<div className="text-right">
					<span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest block">
						Status: Active_Handshake
					</span>
					<span className="text-[9px] font-mono text-[#FF4400] uppercase tracking-widest font-bold">
						P_PROTOCOL_STABLE
					</span>
				</div>
			</div>

			{/* --- Main Headline (Act I) --- */}
			<div className="relative z-20 mt-12">
				<h1 className="text-[13vw] font-black tracking-tighter leading-[0.8] flex flex-col text-[#1a1a1a]">
					<span
						ref={studioRef}
						className="flex items-center gap-[0.02em] will-change-transform"
					>
						STUDIO{" "}
						<span className="text-neutral-300 font-light opacity-50">©</span>
					</span>
					<span className="flex items-center">
						<span
							ref={plusRef}
							className="inline-block mx-[0.05em] text-[#FF4400] origin-center will-change-transform"
						>
							+
						</span>
						<span ref={numericRef} className="will-change-transform">
							233
						</span>
						<span className="text-[4vw] font-medium align-top mt-[1.2vw] ml-[0.5vw]">
							™
						</span>
					</span>
				</h1>
				<div className="mt-4 flex items-center gap-4">
					<div className="h-[1px] w-24 bg-[#FF4400]" />
					<span className="text-[10px] font-mono uppercase tracking-[0.5em] text-neutral-500">
						The_Kinetic_Manual
					</span>
				</div>
			</div>

			{/* --- Bottom Interface --- */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-auto items-end z-20">
				{/* Barcode / Visualizer */}
				<div className="lg:col-span-4 space-y-4">
					<div className="flex flex-col">
						<span className="text-[8px] font-mono text-neutral-400 uppercase tracking-[0.5em] mb-2">
							Internal_Logic
						</span>
						<span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#1a1a1a]">
							Industrial_Substrate
						</span>
					</div>
					<div className="flex items-end h-16 gap-[2px]">
						{[...Array(24)].map((_, i) => (
							<div
								key={i}
								className="bg-[#1a1a1a] transition-all duration-300"
								style={{
									width: i % 6 === 0 ? "3px" : "1px",
									height: `${20 + (Math.sin(i + mousePos.x * 0.1) * 40 + 40)}%`,
									opacity: 0.1 + (i / 24) * 0.4,
								}}
							/>
						))}
					</div>
				</div>

				{/* Abstract Section */}
				<div className="lg:col-span-4 lg:pl-12 border-l border-neutral-200">
					<div className="flex items-center gap-2 mb-4">
						<div className="w-1.5 h-1.5 bg-[#FF4400]"></div>
						<span className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">
							Act_I_Substrate
						</span>
					</div>
					<p className="text-xs lg:text-sm text-neutral-500 leading-relaxed max-w-sm font-medium uppercase tracking-wider">
						A recursive framework for the calibration and deployment of
						stand-out digital substrates. High-fidelity motion performance as
						standard.
					</p>
				</div>

				{/* Active Chapters */}
				<div className="lg:col-span-4 flex justify-end">
					<div className="text-right space-y-1">
						<span className="text-[8px] font-mono text-neutral-400 uppercase tracking-[0.4em] block mb-2">
							Active_Chapters
						</span>
						{["01_SCHEMATIC", "02_PROCESSING", "03_RENDER"].map((chapter) => (
							<span
								key={chapter}
								className="text-[10px] font-mono block text-[#1a1a1a] tracking-wider hover:text-[#FF4400] transition-colors cursor-crosshair"
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
