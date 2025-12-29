"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, { useEffect, useRef, useState } from "react";
import type { KineticTrackHandle } from "./KineticTrack";
import type { VortexHeroHandle } from "./VortexHeroV2";

interface VortexContainerProps {
	children?: React.ReactNode;
	heroRef?: React.RefObject<VortexHeroHandle | null>;
	trackRef?: React.RefObject<KineticTrackHandle | null>;
}

/**
 * VortexContainer orchestrates the "Kinetic Lock" scroll experience.
 */
export const VortexContainer: React.FC<VortexContainerProps> = ({
	children,
	heroRef,
	trackRef,
}) => {
	const [mounted, setMounted] = useState(false);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const viewportRef = useRef<HTMLDivElement>(null);

	// Act II.5 Bridge HUD Refs
	const bridgeBracketsRef = useRef<HTMLDivElement>(null);
	const coordFeedRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted) return;
		gsap.registerPlugin(ScrollTrigger);

		const ctx = gsap.context(() => {
			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: wrapperRef.current,
					start: "top top",
					end: "bottom bottom",
					scrub: 1,
					pin: viewportRef.current,
					pinSpacing: false,
					invalidateOnRefresh: true,
				},
			});

			// --- Act I: Hero & The 'Rising Stage' Handover ---
			if (heroRef?.current) {
				const { studio, plus, numeric, surface, blackBox, brackets } =
					heroRef.current;

				if (studio && plus && numeric && surface && blackBox && brackets) {
					gsap.set(surface, { zIndex: 50 });

					// Phase 1: Header/Logo Expansion (Still part of the entry)
					tl.fromTo(
						plus,
						{ rotation: 0, scale: 1, x: 0 },
						{ rotation: 90, scale: 150, duration: 1.5, ease: "power3.inOut" },
						0,
					);

					tl.fromTo(
						studio,
						{ x: 0 },
						{
							x: -window.innerWidth * 0.8,
							duration: 1.5,
							ease: "power2.inOut",
						},
						0,
					);

					// THE CORE TRANSFORMATION: 233 centers and glyphs
					tl.fromTo(
						numeric,
						{ x: 0, opacity: 1 },
						{
							x: () => {
								const rect = numeric.getBoundingClientRect();
								return window.innerWidth / 2 - rect.left - rect.width / 2;
							},
							duration: 1.5,
							ease: "power2.inOut",
						},
						0,
					);

					// Decryption Glyph Flicker (Stable for scrubbing/scroll-back)
					const keywords = ["233", "[CANVAS]", "[STUDIO]", "[AGENTIC]"];
					const glyphProxy = { i: 0 };
					tl.to(
						glyphProxy,
						{
							i: keywords.length - 1,
							roundProps: "i",
							duration: 1.5,
							ease: "none",
							onUpdate: () => {
								heroRef.current?.setGlyphText(
									keywords[Math.floor(glyphProxy.i)],
								);
							},
						},
						0,
					);

					// 1. Brackets Snap to [AGENTIC]
					tl.to(
						brackets,
						{ opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" },
						1.4,
					);

					// 2. THE RISING STAGE REVEAL (Replaces Flip & Scale)
					// We use the track container as the "Stage" that rises up
					if (trackRef?.current?.track?.parentElement) {
						const stage = trackRef.current.track.parentElement;
						gsap.set(stage, { y: "100vh", zIndex: 60 }); // Above hero

						tl.to(
							stage,
							{
								y: "0vh",
								duration: 2.5,
								ease: "power2.inOut",
							},
							1.8, // Start rising shortly after lock
						);
					}

					// Optional: Success Flash on the hero before it gets covered
					tl.to(surface, { outline: "4px solid #FF4400", duration: 0.1 }, 1.8);
					tl.to(surface, { outline: "0px solid #FF4400", duration: 0.2 }, 1.9);

					// Fade Hero elements as they are covered by the rising stage
					tl.to(
						[plus, studio, brackets, numeric],
						{ opacity: 0, duration: 0.8 },
						3.5,
					);
					tl.set(surface, { display: "none" }, 5.0);
				}
			}

			// --- Act II: The Manifesto (The Monolith Payload) ---
			if (trackRef?.current) {
				const { blocks, track } = trackRef.current;
				const stage = track?.parentElement;
				if (blocks.length > 0 && track && stage) {
					// 1. Initial Position: Payload is hidden below the stage
					gsap.set(track, { y: "100vh", opacity: 1 });

					// 2. Payload Entrance: After Stage (4.3) is locked, lift the text into center
					tl.to(
						track,
						{
							y: "0vh",
							duration: 2.0,
							ease: "power3.out",
						},
						4.5,
					);

					// 3. The 'Scanner' Reveal: Staggered shutters release
					// This starts once the payload is mostly in position
					const shutters = blocks
						.map((b) => b.querySelector(".shutter-overlay"))
						.filter(Boolean);

					tl.to(
						shutters,
						{
							scaleY: 0,
							duration: 1.5,
							stagger: {
								amount: 2.5,
								from: "start",
								grid: "auto",
							},
							ease: "power2.inOut",
						},
						6.0, // Start after the monolith is centered
					);

					// 4. Subtle Exit Drift: Removed/Shortened to prevent text from leaving viewport
					tl.to(
						track,
						{
							y: "-2vh",
							duration: 2,
							ease: "none",
						},
						8.5,
					);

					// --- Act III: Conceptual Distillation (Extraction) ---
					const debris = track.querySelectorAll(".debris-word");
					const targetThe = track.querySelector(".target-word-the");
					const targetCreative = track.querySelector(".target-word-creative");
					const targetProcess = track.querySelector(".target-word-process");
					const engineLayer =
						viewportRef.current?.querySelector(".engine-layer");

					if (targetThe && targetCreative && targetProcess) {
						// 1. Highlight Focus: The target words turn orange to signal extraction
						tl.to(
							[targetThe, targetCreative, targetProcess],
							{
								color: "#FF4400",
								duration: 1.0,
								ease: "power2.out",
							},
							9.5,
						);

						// 2. THE PURGE: All other words fall off screen quickly
						tl.to(
							debris,
							{
								y: "100vh",
								opacity: 0,
								duration: 0.8,
								stagger: {
									amount: 0.8,
									from: "random",
								},
								ease: "power2.in",
							},
							10.0,
						);

						// 3. THE LOCKUP: Organise target words into a tight centered stack
						const centerStack = [targetThe, targetCreative, targetProcess];

						// ACTIVATE IMAGE STATE for Creative & Process
						const creativeImg =
							targetCreative.querySelector("img")?.parentElement;
						const processImg =
							targetProcess.querySelector("img")?.parentElement;
						if (creativeImg && processImg) {
							tl.to(
								[creativeImg, processImg],
								{
									opacity: 1,
									scale: 1.05,
									duration: 1.5,
									ease: "expo.inOut",
								},
								11.5,
							);
						}

						centerStack.forEach((word, i) => {
							tl.to(
								word,
								{
									x: () => {
										if (!word || !track) return 0;
										// Move to Upper Left Corner (50px margin)
										const rect = (word as HTMLElement).getBoundingClientRect();
										const currentGSAPX = gsap.getProperty(word, "x") as number;
										const layoutLeft = rect.left - currentGSAPX;
										return 50 - layoutLeft;
									},
									y: () => {
										if (!word || !track) return 0;
										const rect = (word as HTMLElement).getBoundingClientRect();
										const currentGSAPY = gsap.getProperty(word, "y") as number;
										const layoutTop = rect.top - currentGSAPY;
										// Stack vertically starting at 50px, with 50px spacing (scaled)
										const targetY = 50 + i * 50;
										return targetY - layoutTop;
									},
									scale: 0.6, // Smaller watermark style
									color: "#ffffff",
									duration: 1.5,
									ease: "expo.inOut",
								},
								11.5,
							);
						});

						// 4. THE SUBSTRATE REVEAL: Production Engine comes in clear and strong
						if (engineLayer) {
							// Fade out the stage background to reveal the full engine
							tl.to(
								stage,
								{
									backgroundColor: "transparent",
									duration: 1.5,
									ease: "power2.inOut",
								},
								12.0,
							);

							tl.to(
								engineLayer,
								{
									opacity: 1,
									pointerEvents: "auto", // Enable interaction if needed
									duration: 1.5,
									ease: "power2.inOut",
								},
								12.0,
							);
						}
					}
				}
			}
		}, wrapperRef);

		return () => ctx.revert();
	}, [mounted, heroRef, trackRef]);

	return (
		<div
			ref={wrapperRef}
			className="relative w-full h-[2000vh] bg-[#f4f4f0] z-40"
			data-testid="vortex-wrapper"
		>
			{/* --- Global SVG Filters --- */}
			<svg className="hidden">
				<filter id="industrial-grain">
					<feTurbulence
						type="fractalNoise"
						baseFrequency="0.6"
						numOctaves="3"
						stitchTiles="stitch"
					/>
					<feColorMatrix type="saturate" values="0" />
					<feComponentTransfer>
						<feFuncR type="linear" slope="0.1" />
						<feFuncG type="linear" slope="0.1" />
						<feFuncB type="linear" slope="0.1" />
						<feFuncA type="linear" slope="0.05" />
					</feComponentTransfer>
				</filter>
			</svg>

			<div
				ref={viewportRef}
				className="fixed inset-0 w-full h-screen overflow-hidden bg-[#1a1a1a]"
				data-testid="vortex-viewport"
			>
				{/* Layer 0: Background Grid (Persistent) */}
				<div
					className="absolute inset-0 opacity-[0.04] pointer-events-none z-0"
					style={{
						backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
						backgroundSize: "60px 60px",
					}}
				/>

				{/* Grain Overlay */}
				<div
					className="absolute inset-0 z-[100] pointer-events-none opacity-40 mix-blend-screen"
					style={{ filter: "url(#industrial-grain)" }}
				/>

				{/* Layer 1: Mid (Manifesto/Children) */}
				<div className="absolute inset-0 z-30 pointer-events-none">
					{children}
				</div>
			</div>
		</div>
	);
};
