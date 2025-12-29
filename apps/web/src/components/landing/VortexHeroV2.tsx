"use client";

import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { useMouseCoordinates } from "@/hooks/useMouseCoordinates";
import { ScrambleText } from "./ScrambleText";

export interface VortexHeroHandle {
	studio: HTMLSpanElement | null;
	plus: HTMLSpanElement | SVGSVGElement | null;
	numeric: HTMLSpanElement | null;
	surface: HTMLDivElement | null;
	blackBox: HTMLDivElement | null;
	brackets: HTMLDivElement | null;
	setGlyphText: (text: string) => void;
}

export const VortexHeroV2 = forwardRef<VortexHeroHandle, {}>((_props, ref) => {
	const studioRef = useRef<HTMLSpanElement>(null);
	const plusRef = useRef<SVGSVGElement>(null);
	const numericRef = useRef<HTMLSpanElement>(null);
	const surfaceRef = useRef<HTMLDivElement>(null);
	const blackBoxRef = useRef<HTMLDivElement>(null);
	const bracketsRef = useRef<HTMLDivElement>(null);

	const [glyphText, setGlyphText] = useState("233");

	const mousePos = useMouseCoordinates();

	// Target Group Rotation Logic
	const [targetGroup, setTargetGroup] = useState("CREATIVES");
	const groups = [
		"CREATIVES",
		"AGENCIES",
		"MEDIA_TEAMS",
		"DESIGNERS",
		"PRODUCERS",
	];

	useEffect(() => {
		let i = 0;
		const interval = setInterval(() => {
			i = (i + 1) % groups.length;
			setTargetGroup(groups[i]);
		}, 3000);
		return () => clearInterval(interval);
	}, []);

	useImperativeHandle(ref, () => ({
		studio: studioRef.current,
		plus: plusRef.current,
		numeric: numericRef.current,
		surface: surfaceRef.current,
		blackBox: blackBoxRef.current,
		brackets: bracketsRef.current,
		setGlyphText: (text: string) => setGlyphText(text),
	}));

	return (
		<div
			ref={surfaceRef}
			className="absolute inset-0 z-10 bg-[#f4f4f0] flex flex-col justify-between p-8 lg:p-12 overflow-hidden select-none font-sans"
			data-testid="hero-surface"
		>
			<style jsx>{`
				@keyframes terminal-blink {
					0%, 100% { opacity: 1; }
					50% { opacity: 0; }
				}
				.animate-terminal-blink {
					animation: terminal-blink 1s step-end infinite;
				}
				@keyframes assembly-slide {
					from { transform: translateY(0); }
					to { transform: translateY(-50%); }
				}
				.animate-assembly-slide {
					animation: assembly-slide 4s linear infinite;
				}
				.mask-fade-y {
					mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent);
				}
			`}</style>
			{/* --- Background Elements --- */}
			<div
				className="absolute inset-0 opacity-[0.03] pointer-events-none"
				style={{
					backgroundImage: `linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)`,
					backgroundSize: "40px 40px",
				}}
			/>

			{/* --- The Matte Black Core (Central Box) --- */}
			<div
				ref={blackBoxRef}
				className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] bg-[#1a1a1a] z-[5] opacity-0 will-change-transform backface-hidden border border-white/5 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
				style={{ transform: "rotateX(-90deg) translate(-50%, -50%)" }}
			/>

			{/* --- Corner Brackets (Targeting UI) --- */}
			<div
				ref={bracketsRef}
				className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160px] h-[160px] z-[6] opacity-0 pointer-events-none"
			>
				{/* Top Left */}
				<div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/40" />
				{/* Top Right */}
				<div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/40" />
				{/* Bottom Left */}
				<div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/40" />
				{/* Bottom Right */}
				<div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/40" />
			</div>

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
						VORTEX_STREAM_v3.0
					</span>
				</div>
				<div className="text-right">
					<span className="text-[9px] font-hal text-neutral-400 uppercase tracking-widest block">
						Status: Active_Handshake
					</span>
					<span className="text-[9px] font-hal text-[#FF4400] uppercase tracking-widest font-bold">
						ACCELERATED_HANDSHAKE
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
					<span className="flex items-center relative">
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

						{/* 3D Handover Container */}
						<span className="relative flex items-center perspective-1000">
							<span
								ref={numericRef}
								className="inline-block will-change-transform"
								data-testid="hero-numeric"
							>
								{glyphText.split("+").map((part, i, arr) => (
									<React.Fragment key={i}>
										{part}
										{i < arr.length - 1 && (
											<span className="text-[#FF4400] ml-[0.07em] mr-[0.05em] tracking-normal">
												+
											</span>
										)}
									</React.Fragment>
								))}
							</span>
						</span>

						<span className="text-[4vw] font-medium align-top mt-[1.2vw] ml-[0.5vw]">
							™
						</span>
					</span>
				</h1>

				<p className="font-satoshi text-[1.1vw] md:text-[1.3vw] lg:text-[0.9vw] text-neutral-400 uppercase tracking-[0.4em] mt-20 max-w-[60vw] leading-relaxed">
					Industrial-grade AI orchestration engine <br />
					for high-volume creative production
					<span className="inline-flex items-center ml-6 text-[#1a1a1a] font-bold tracking-normal">
						<span className="mr-2 text-neutral-300">//</span>
						_FOR
						<span className="text-[#FF4400] ml-2">
							<ScrambleText
								key={targetGroup}
								text={targetGroup}
								triggerOnce={false}
								scrambleSpeed={20}
							/>
						</span>
						<span className="animate-terminal-blink ml-1 text-[#FF4400]">
							|
						</span>
					</span>
				</p>
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
						{["01_DECRYPT", "02_ASSEMBLY", "03_MANIFESTO"].map((chapter) => (
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
