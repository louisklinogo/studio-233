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
	const bootLogsRef = useRef<HTMLDivElement>(null);
	const bracketLeftRef = useRef<HTMLSpanElement>(null);
	const bracketRightRef = useRef<HTMLSpanElement>(null);
	const loadTextRef = useRef<HTMLSpanElement>(null);

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

			// --- Act I: Hero & The Kinetic Lock Handover ---
			if (heroRef?.current) {
				const { studio, plus, numeric, surface, blackBox, brackets } =
					heroRef.current;

				if (studio && plus && numeric && surface && blackBox && brackets) {
					gsap.set(surface, { zIndex: 50 });

					// Phase 1: Expansion to Orange
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

					// Decryption Glyph Flicker (Simulated in timeline)
					const keywords = ["[CANVAS]", "[STUDIO]", "[AGENTIC]", "233"];
					keywords.forEach((word, i) => {
						tl.call(
							() => heroRef.current?.setGlyphText(word),
							[],
							0.8 + i * 0.2,
						);
					});

					// 1. Brackets Snap
					tl.to(
						brackets,
						{ opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" },
						1.4,
					);

					// 2. The Kinetic Flip
					tl.to(
						numeric,
						{ rotationX: 90, duration: 0.6, ease: "power2.in" },
						1.6,
					);
					tl.to(
						blackBox,
						{ opacity: 1, rotationX: 0, duration: 0.6, ease: "power2.out" },
						1.6,
					);

					// Success Flash (1px orange border already in V2 logic or via GSAP)
					tl.to(blackBox, { outline: "1px solid #FF4400", duration: 0.1 }, 2.2);
					tl.to(
						blackBox,
						{ outline: "1px solid rgba(255,68,0,0)", duration: 0.2 },
						2.3,
					);

					// 3. Massive Expansion
					tl.to(blackBox, { scale: 100, duration: 2.5, ease: "expo.in" }, 2.5);

					// Fade Hero elements as we enter the dark environment
					tl.to([plus, studio, brackets], { opacity: 0, duration: 0.8 }, 2.8);
					tl.set(surface, { display: "none" }, 5.0);
				}
			}

			// --- Act II: The Manifesto (Vertical Magazine) ---
			if (trackRef?.current) {
				const { blocks } = trackRef.current;
				if (blocks.length > 0) {
					gsap.set(trackRef.current.track!.parentElement!, { zIndex: 30 });

					// Initialize ALL blocks to the bottom (hidden)
					gsap.set(blocks, {
						x: 0,
						y: window.innerHeight * 0.8,
						opacity: 0,
						position: "absolute",
						left: "50%",
						top: "50%",
						xPercent: -50,
						yPercent: -50,
					});

					blocks.forEach((block, i) => {
						const start = 4.0 + i * 1.5;
						const shutter = block.querySelector(".shutter-overlay");

						// 1. Rise up into focal area
						tl.to(
							block,
							{ y: 0, opacity: 1, duration: 1.2, ease: "power3.out" },
							start,
						);

						// 2. Shutter Reveal (Slide down)
						if (shutter) {
							tl.to(
								shutter,
								{ scaleY: 0, duration: 0.8, ease: "expo.inOut" },
								start + 0.4,
							);
						}

						// 3. Move out (Upward)
						tl.to(
							block,
							{
								y: -window.innerHeight * 0.8,
								opacity: 0,
								duration: 1.0,
								ease: "power3.in",
							},
							start + 1.5,
						);
					});
				}
			}

			// --- Act III: The Story & System Boot (Existing Acts) ---
			if (bootLogsRef.current) {
				const logs = bootLogsRef.current.children;
				tl.set(bootLogsRef.current, { opacity: 1 }, 18.0);
				tl.fromTo(
					logs,
					{ opacity: 0, x: -10 },
					{ opacity: 1, x: 0, stagger: 0.1, duration: 0.4, ease: "power2.out" },
					18.2,
				);
			}

			tl.fromTo(
				[bracketLeftRef.current, bracketRightRef.current, loadTextRef.current],
				{ opacity: 0, scale: 0.8 },
				{
					opacity: 1,
					scale: 1,
					duration: 0.5,
					stagger: 0.1,
					ease: "back.out(2)",
				},
				19.0,
			);

			tl.to(loadTextRef.current, { opacity: 0, duration: 0.3 }, 20.0);
			tl.to(
				[bracketLeftRef.current, bracketRightRef.current],
				{
					x: (i) =>
						i === 0 ? -window.innerWidth * 0.4 : window.innerWidth * 0.4,
					scaleY: 20,
					duration: 1.2,
					ease: "expo.inOut",
				},
				20.5,
			);

			if (bootLogsRef.current) {
				tl.to(bootLogsRef.current, { opacity: 0, duration: 0.5 }, 21.5);
			}
		}, wrapperRef);

		return () => ctx.revert();
	}, [mounted, heroRef, trackRef]);

	return (
		<div
			ref={wrapperRef}
			className="relative w-full h-[3000vh] bg-[#f4f4f0] z-40"
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

				{/* Act IV: System Boot UI (Brackets) */}
				<div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
					<div className="relative flex items-center justify-center gap-8">
						<span
							ref={bracketLeftRef}
							className="text-6xl md:text-8xl font-light text-white opacity-0"
						>
							[
						</span>
						<span
							ref={loadTextRef}
							className="text-xs font-mono text-[#FF4400] uppercase tracking-[0.5em] font-bold opacity-0"
						>
							Load_Engine
						</span>
						<span
							ref={bracketRightRef}
							className="text-6xl md:text-8xl font-light text-white opacity-0"
						>
							]
						</span>
					</div>
				</div>

				{/* System Boot Logs */}
				<div
					ref={bootLogsRef}
					className="absolute top-12 left-12 z-40 flex flex-col gap-1 opacity-0 pointer-events-none"
				>
					{[
						"> MOUNTING_CORE_FILESYSTEM...",
						"> CHECKING_LATENT_SPACE...",
						"> INITIALIZING_STUDIO_V3.0...",
						"> ESTABLISHING_HANDSHAKE...",
						"> BOOT_SEQUENCE_COMPLETE",
					].map((log, i) => (
						<span
							key={i}
							className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest"
						>
							{log}
						</span>
					))}
				</div>
			</div>
		</div>
	);
};
