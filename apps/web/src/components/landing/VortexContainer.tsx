"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, { useEffect, useRef, useState } from "react";
import type { KineticTrackHandle } from "./KineticTrack";
import type { VortexHeroHandle } from "./VortexHeroV2";
import { WorkflowEngine, WorkflowEngineHandle } from "./WorkflowEngine";

interface VortexContainerProps {
	children?: React.ReactNode;
	heroRef?: React.RefObject<VortexHeroHandle | null>;
	trackRef?: React.RefObject<KineticTrackHandle | null>;
}

const Redacted = ({
	children,
	className,
	curtainClass,
}: {
	children: React.ReactNode;
	className?: string;
	curtainClass: string;
}) => (
	<span
		className={`relative inline-block whitespace-nowrap overflow-hidden align-bottom mx-1 px-1 py-1 ${className}`}
	>
		<span className="relative z-10">{children}</span>
		<span
			className={`redaction-curtain ${curtainClass} absolute inset-0 bg-[#FF4400] z-20 origin-left`}
		/>
	</span>
);

/**
 * VortexContainer acts as the primary orchestrator for the horizontal scroll experience.
 * It manages the global ScrollTrigger timeline and provides a pinned viewport for its children.
 */
export const VortexContainer: React.FC<VortexContainerProps> = ({
	children,
	heroRef,
	trackRef,
}) => {
	const [mounted, setMounted] = useState(false);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const viewportRef = useRef<HTMLDivElement>(null);
	const engineRef = useRef<WorkflowEngineHandle>(null);
	const readoutRef = useRef<HTMLDivElement>(null);
	const bootLogsRef = useRef<HTMLDivElement>(null);
	const bracketLeftRef = useRef<HTMLSpanElement>(null);
	const bracketRightRef = useRef<HTMLSpanElement>(null);
	const loadTextRef = useRef<HTMLSpanElement>(null);

	// Story Act Refs
	const storyHeadlineRef = useRef<HTMLDivElement>(null);
	const paragraph1Ref = useRef<HTMLDivElement>(null);
	const paragraph2Ref = useRef<HTMLDivElement>(null);

	// Bridge Refs
	const bridgeBracketsRef = useRef<HTMLDivElement>(null);
	const coordFeedRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted) return;
		gsap.registerPlugin(ScrollTrigger);

		const ctx = gsap.context(() => {
			// --- 1. Initial State Setup (The Unified Stack) ---
			// Ensure all layers are prepared for their entrance
			if (engineRef.current?.container) {
				gsap.set(engineRef.current.container, {
					opacity: 0,
					scale: 0.8,
					zIndex: 10,
					visibility: "hidden",
				});
			}

			// Main Orchestration Timeline
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

			// --- 2. Act I: The Gate (Hero) Peel Back ---
			if (heroRef?.current) {
				const { studio, plus, numeric, surface } = heroRef.current;
				if (studio && plus && numeric && surface) {
					gsap.set(surface, { zIndex: 50 });
					tl.fromTo(
						plus,
						{ rotation: 0, scale: 1 },
						{ rotation: 90, scale: 150, duration: 1.5, ease: "power3.inOut" },
						0,
					);
					tl.fromTo(
						studio,
						{ x: 0 },
						{
							x: -window.innerWidth * 0.7,
							duration: 1.5,
							ease: "power2.inOut",
						},
						0,
					);
					tl.fromTo(
						numeric,
						{ x: 0 },
						{ x: window.innerWidth * 0.7, duration: 1.5, ease: "power2.inOut" },
						0,
					);

					tl.fromTo(
						surface,
						{ opacity: 1, scaleY: 1 },
						{
							opacity: 0,
							scaleY: 2,
							duration: 1.2,
							ease: "power2.inOut",
							pointerEvents: "none",
							transformOrigin: "center center",
						},
						0.8,
					);
				}
			}

			// --- 3. Act II: The Manifesto (Track) Sequence ---
			if (trackRef?.current) {
				const { track, blocks, images } = trackRef.current;
				if (track && blocks.length > 0) {
					const getScrollAmount = () =>
						-(track.scrollWidth - window.innerWidth);

					// Setup Track Layer
					gsap.set(track.parentElement!, { zIndex: 30 }); // KineticTrack container
					gsap.set(blocks, { y: 100, opacity: 0 });

					// Reveal & Scroll
					tl.to(
						blocks,
						{
							y: 0,
							opacity: 1,
							stagger: 0.1,
							duration: 1.0,
							ease: "back.out(1.5)",
						},
						1.2,
					);
					// Horizontal Scroll
					tl.to(
						track,
						{
							x: getScrollAmount,
							duration: 4,
							ease: "none",
						},
						2.5,
					);

					// --- Act II.5: The Blueprint Resolution (Stable Stack) ---

					if (blocks.length >= 3) {
						const lastThree = blocks.slice(-3);

						const others = blocks.slice(0, -3);

						// 1. Others fly away

						tl.to(
							others,
							{
								y: -window.innerHeight,

								opacity: 0,

								stagger: 0.03,

								duration: 1.0,

								ease: "power3.in",
							},
							6.5,
						);

						// 2. 'the creative process.' locks and centers

						// Order: 'creative' first, then 'the'. 'process.' stays/moves to center.

						tl.to(
							lastThree[1],
							{
								// 'creative'

								x: () => {
									const trackX = gsap.getProperty(track, "x") as number;

									const rect = lastThree[1].getBoundingClientRect();

									return (
										-trackX +
										window.innerWidth / 2 -
										(rect.left - trackX) -
										rect.width / 2
									);
								},

								y: () => {
									const rect = lastThree[1].getBoundingClientRect();

									return window.innerHeight / 2 - rect.top - rect.height / 2;
								},

								scale: 1.5,

								duration: 1.5,

								ease: "power4.inOut",
							},
							6.5,
						);

						tl.to(
							lastThree[0],
							{
								// 'the'

								x: () => {
									const trackX = gsap.getProperty(track, "x") as number;

									const rect = lastThree[0].getBoundingClientRect();

									return (
										-trackX +
										window.innerWidth / 2 -
										(rect.left - trackX) -
										rect.width / 2
									);
								},

								y: () => {
									const rect = lastThree[0].getBoundingClientRect();

									return window.innerHeight / 2 - rect.top - rect.height / 2;
								},

								scale: 1.5,

								duration: 1.5,

								ease: "power4.inOut",
							},
							6.7,
						); // Follows 'creative'

						tl.to(
							lastThree[2],
							{
								// 'process.'

								x: () => {
									const trackX = gsap.getProperty(track, "x") as number;

									const rect = lastThree[2].getBoundingClientRect();

									return (
										-trackX +
										window.innerWidth / 2 -
										(rect.left - trackX) -
										rect.width / 2
									);
								},

								y: () => {
									const rect = lastThree[2].getBoundingClientRect();

									return window.innerHeight / 2 - rect.top - rect.height / 2;
								},

								scale: 1.5,

								duration: 1.5,

								ease: "power4.inOut",
							},
							6.5,
						);

						// 3. Snap Brackets & Coord Feed

						tl.fromTo(
							bridgeBracketsRef.current,

							{ opacity: 0, scale: 1.5 },

							{ opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" },

							8.0,
						);

						tl.fromTo(
							coordFeedRef.current,

							{ opacity: 0 },

							{ opacity: 0.4, duration: 0.5 },

							8.2,
						);

						// 4. THE RESOLUTION: Words scramble and expand into Story Headline

						tl.to(
							lastThree,
							{
								opacity: 0,

								filter: "blur(10px)",

								scale: 2,

								duration: 0.8,

								ease: "power2.in",
							},
							9.0,
						);

						tl.fromTo(
							storyHeadlineRef.current,
							{ opacity: 0, scale: 0.5, filter: "blur(20px)" },
							{
								opacity: 1,
								scale: 1,
								filter: "blur(0px)",
								duration: 1.0,
								ease: "power4.out",
							},
							8.5,
						);

						tl.to(
							[bridgeBracketsRef.current, coordFeedRef.current],
							{
								opacity: 0,
								duration: 0.5,
							},
							9.0,
						);
					}

					// --- Act III: The Story ---
					const storyLines =
						storyHeadlineRef.current?.querySelectorAll(".manifesto-line");
					if (storyLines) {
						// Split the already revealed headline
						tl.to(
							storyLines[0],
							{ x: "-10%", opacity: 0.5, duration: 0.8 },
							10.0,
						);
						tl.to(
							storyLines[1],
							{ x: "10%", opacity: 0.5, duration: 0.8 },
							10.0,
						);
						tl.to(
							storyLines,
							{ opacity: 0, filter: "blur(12px)", y: -50, duration: 0.8 },
							11.0,
						);
					}
					// 2. Paragraph 01 Reveal
					tl.fromTo(
						paragraph1Ref.current,
						{ opacity: 0, y: 100, filter: "blur(10px)" },
						{
							opacity: 1,
							y: 0,
							filter: "blur(0px)",
							duration: 1.0,
							ease: "power3.out",
						},
						9.0,
					);

					// Redaction reveal P1
					tl.to(
						".curtain-p1",
						{ scaleX: 0, duration: 0.6, stagger: 0.2, ease: "power2.inOut" },
						9.8,
					);

					tl.to(
						paragraph1Ref.current,
						{ opacity: 0, y: -100, filter: "blur(10px)", duration: 1.0 },
						12.0,
					);

					// 3. Paragraph 02 Reveal
					tl.fromTo(
						paragraph2Ref.current,
						{ opacity: 0, y: 100, filter: "blur(10px)" },
						{
							opacity: 1,
							y: 0,
							filter: "blur(0px)",
							duration: 1.0,
							ease: "power3.out",
						},
						12.5,
					);

					// Redaction reveal P2
					tl.to(
						".curtain-p2",
						{ scaleX: 0, duration: 0.6, stagger: 0.2, ease: "power2.inOut" },
						13.3,
					);

					tl.to(
						paragraph2Ref.current,
						{ opacity: 0, y: -100, filter: "blur(10px)", duration: 1.0 },
						15.5,
					);

					// --- Act IV: System Boot ---
					if (bootLogsRef.current) {
						const logs = bootLogsRef.current.children;
						tl.set(bootLogsRef.current, { opacity: 1 }, 16.5);
						tl.fromTo(
							logs,
							{ opacity: 0, x: -10 },
							{
								opacity: 1,
								x: 0,
								stagger: 0.1,
								duration: 0.4,
								ease: "power2.out",
							},
							16.7,
						);
					}

					// Central Brackets Reveal
					tl.fromTo(
						[
							bracketLeftRef.current,
							bracketRightRef.current,
							loadTextRef.current,
						],
						{ opacity: 0, scale: 0.8 },
						{
							opacity: 1,
							scale: 1,
							duration: 0.5,
							stagger: 0.1,
							ease: "back.out(2)",
						},
						17.5,
					);

					// THE ASSEMBLY
					tl.to(loadTextRef.current, { opacity: 0, duration: 0.3 }, 18.5);
					tl.to(
						bracketLeftRef.current,
						{
							x: -window.innerWidth * 0.4,
							scaleY: 20,
							duration: 1.2,
							ease: "expo.inOut",
						},
						18.8,
					);
					tl.to(
						bracketRightRef.current,
						{
							x: window.innerWidth * 0.4,
							scaleY: 20,
							duration: 1.2,
							ease: "expo.inOut",
						},
						18.8,
					);

					tl.to(bootLogsRef.current, { opacity: 0, duration: 0.5 }, 19.5);
				}
			}

			// --- Phase 5: The Machine (Act V) ---
			if (engineRef.current) {
				const { container, canvas } = engineRef.current;
				if (container && canvas) {
					tl.fromTo(
						container,
						{ opacity: 0, scale: 0.95, visibility: "hidden" },
						{
							opacity: 1,
							scale: 1,
							visibility: "visible",
							duration: 1.0,
							ease: "power2.out",
							pointerEvents: "auto",
						},
						20.0,
					);

					tl.call(
						() => {
							if (canvas.setInteractive) canvas.setInteractive(true);
						},
						[],
						21.0,
					);
				}
			}

			// Shared Velocity Physics
			ScrollTrigger.create({
				trigger: wrapperRef.current,
				start: "top top",
				end: "bottom bottom",
				onUpdate: (self) => {
					if (trackRef?.current?.blocks) {
						const skew = self.getVelocity() / -600;
						gsap.to(trackRef.current.blocks, {
							skewX: Math.max(-10, Math.min(10, skew)),
							duration: 0.2,
							overwrite: "auto",
						});
					}
				},
			});
		}, wrapperRef);

		return () => ctx.revert();
	}, [mounted, heroRef, trackRef]);

	return (
		<div
			ref={wrapperRef}
			className="relative w-full h-[2500vh] bg-[#f4f4f0] z-40"
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
				className="fixed inset-0 w-full h-screen overflow-hidden"
				data-testid="vortex-viewport"
			>
				{/* --- Shared Industrial Canvas Background --- */}
				<div
					className="absolute inset-0 opacity-[0.04] pointer-events-none z-0"
					style={{
						backgroundImage: `linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)`,
						backgroundSize: "60px 60px",
					}}
				/>

				{/* Grid Anchors (+) */}
				<div
					className="absolute inset-0 opacity-[0.02] pointer-events-none z-0"
					style={{
						backgroundImage: `radial-gradient(#FF4400 1px, transparent 0)`,
						backgroundSize: "60px 60px",
						backgroundPosition: "-0.5px -0.5px",
					}}
				/>

				{/* Grain Overlay */}
				<div
					className="absolute inset-0 z-[100] pointer-events-none opacity-40 mix-blend-multiply"
					style={{ filter: "url(#industrial-grain)" }}
				/>

				{/* Layer 1: Base (Engine) */}
				<WorkflowEngine ref={engineRef} />

				{/* Layer 2: Mid (Manifesto/Children) */}
				<div className="absolute inset-0 z-30 pointer-events-none">
					{children}
				</div>

				{/* --- Act II.5: The Bridge UI --- */}
				<div
					ref={bridgeBracketsRef}
					className="absolute inset-0 z-50 pointer-events-none opacity-0"
				>
					{/* Corner Brackets */}
					<div className="absolute top-1/2 left-1/2 -translate-x-[250px] -translate-y-[150px] w-8 h-8 border-t-2 border-l-2 border-[#FF4400]" />
					<div className="absolute top-1/2 left-1/2 translate-x-[218px] -translate-y-[150px] w-8 h-8 border-t-2 border-r-2 border-[#FF4400]" />
					<div className="absolute top-1/2 left-1/2 -translate-x-[250px] translate-y-[118px] w-8 h-8 border-b-2 border-l-2 border-[#FF4400]" />
					<div className="absolute top-1/2 left-1/2 translate-x-[218px] translate-y-[118px] w-8 h-8 border-b-2 border-r-2 border-[#FF4400]" />
				</div>

				<div
					ref={coordFeedRef}
					className="absolute inset-0 z-50 pointer-events-none opacity-0 flex items-center justify-center"
				>
					<div className="w-[600px] flex justify-between px-12">
						<div className="flex flex-col gap-1">
							{["X_COORD: 12.04", "Y_COORD: 88.10", "Z_INDEX: 400"].map(
								(t, i) => (
									<span
										key={i}
										className="text-[8px] font-mono text-[#1a1a1a] uppercase"
									>
										{t}
									</span>
								),
							)}
						</div>
						<div className="flex flex-col gap-1 text-right">
							{["STATE: REFINING", "MODE: BLUEPRINT", "REF_ID: 233"].map(
								(t, i) => (
									<span
										key={i}
										className="text-[8px] font-mono text-[#1a1a1a] uppercase"
									>
										{t}
									</span>
								),
							)}
						</div>
					</div>
				</div>

				{/* --- Act III: The Story (Ported from ManifestoGSAP) --- */}
				<div className="absolute inset-0 z-40 flex flex-col items-center justify-start pt-[20vh] pointer-events-none">
					<div
						ref={storyHeadlineRef}
						className="flex flex-col gap-0 font-extrabold text-[7.5vw] tracking-tighter leading-[0.9] select-none text-[#1a1a1a] w-full max-w-[95vw] mx-auto uppercase opacity-0"
					>
						<div className="manifesto-line whitespace-nowrap pl-4 w-full">
							INFINITE CANVAS.
						</div>
						<div className="manifesto-line whitespace-nowrap text-right pr-4 text-[#FF4400] w-full indent-[10vw]">
							AGENTIC INTELLIGENCE.
						</div>
						<div className="manifesto-line whitespace-nowrap pl-4 w-full text-center">
							YOUR CREATIVE ENGINE.
						</div>
					</div>

					<div className="mt-[15vh] z-20 w-full max-w-4xl px-6 md:px-12 mx-auto grid grid-cols-1 grid-rows-1 items-center justify-center">
						<div
							ref={paragraph1Ref}
							className="col-start-1 row-start-1 opacity-0 w-full"
						>
							<p className="font-sans text-xl md:text-3xl lg:text-4xl text-neutral-500 leading-tight text-left tracking-tight font-medium uppercase">
								Studio+233 is not just a tool. It is a
								<Redacted
									curtainClass="curtain-p1"
									className="font-mono text-[#1a1a1a] font-bold"
								>
									production environment
								</Redacted>
								for the next generation of creators. Combine the freedom of an
								<Redacted
									curtainClass="curtain-p1"
									className="font-mono text-[#1a1a1a] font-bold"
								>
									infinite canvas
								</Redacted>
								with the power of
								<Redacted
									curtainClass="curtain-p1"
									className="font-mono text-[#1a1a1a] font-bold"
								>
									autonomous AI agents
								</Redacted>
								to scale your workflow from one to one thousand.
							</p>
						</div>

						<div
							ref={paragraph2Ref}
							className="col-start-1 row-start-1 opacity-0 w-full"
						>
							<p className="font-sans text-xl md:text-3xl lg:text-4xl text-neutral-500 leading-tight text-left tracking-tight font-medium uppercase">
								Stop generating one-offs.
								<Redacted
									curtainClass="curtain-p2"
									className="font-mono text-[#1a1a1a] font-bold"
								>
									Orchestrate entire campaigns
								</Redacted>
								on an infinite canvas that thinks. Drag, drop, and chain neural
								models to
								<Redacted
									curtainClass="curtain-p2"
									className="font-mono text-[#1a1a1a] font-bold"
								>
									batch process 1,000+ assets
								</Redacted>
								in minutes. This isn't just a tool; it's your new
								<Redacted
									curtainClass="curtain-p2"
									className="font-mono text-[#1a1a1a] font-bold"
								>
									industrial-grade creative OS
								</Redacted>
								.
							</p>
						</div>
					</div>
				</div>

				{/* --- Act IV: System Boot UI --- */}
				<div
					ref={bootLogsRef}
					className="absolute top-12 left-12 z-40 flex flex-col gap-1 opacity-0 pointer-events-none"
				>
					{[
						"> MOUNTING_CORE_FILESYSTEM...",
						"> CHECKING_LATENT_SPACE...",
						"> INITIALIZING_STUDIO_V2.5...",
						"> ESTABLISHING_HANDSHAKE...",
						"> BOOT_SEQUENCE_COMPLETE",
					].map((log, i) => (
						<span
							key={i}
							className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest"
						>
							{log}
						</span>
					))}
				</div>

				{/* Central Brackets Assembler */}
				<div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
					<div className="relative flex items-center justify-center gap-8">
						<span
							ref={bracketLeftRef}
							className="text-6xl md:text-8xl font-light text-[#1a1a1a] opacity-0"
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
							className="text-6xl md:text-8xl font-light text-[#1a1a1a] opacity-0"
						>
							]
						</span>
					</div>
				</div>

				{/* Act IV: Bridge Overlay (Optional cleanup) */}
			</div>
		</div>
	);
};
