"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, { useEffect, useRef, useState } from "react";
import type { KineticTrackHandle } from "./KineticTrack";
import type { VortexHeroHandle } from "./VortexHero";
import { WorkflowEngine, WorkflowEngineHandle } from "./WorkflowEngine";

interface VortexContainerProps {
	children?: React.ReactNode;
	heroRef?: React.RefObject<VortexHeroHandle | null>;
	trackRef?: React.RefObject<KineticTrackHandle | null>;
}

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

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted) return;
		gsap.registerPlugin(ScrollTrigger);

		const ctx = gsap.context(() => {
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

			// --- Phase 2: The Curtain Split (Act I -> Act II) ---
			if (heroRef?.current) {
				const { studio, plus, numeric, surface } = heroRef.current;

				if (studio && plus && numeric && surface) {
					// Prepare for performance
					gsap.set([studio, plus, numeric], { willChange: "transform" });

					// 1. Aperture Expansion (Using fromTo for stable scrubbing)
					tl.fromTo(
						plus,
						{ rotation: 0, scale: 1 },
						{ rotation: 90, scale: 150, duration: 1.5, ease: "power3.inOut" }, // Reduced scale from 3000 to 150 (safer)
						0,
					);

					tl.fromTo(
						studio,
						{ x: 0 },
						{
							x: -window.innerWidth * 0.6,
							duration: 1.5,
							ease: "power2.inOut",
						},
						0,
					);

					tl.fromTo(
						numeric,
						{ x: 0 },
						{ x: window.innerWidth * 0.6, duration: 1.5, ease: "power2.inOut" },
						0,
					);

					tl.fromTo(
						surface,
						{ opacity: 1 },
						{ opacity: 0, duration: 0.5, ease: "none" },
						1.0,
					);
				}
			}

			// --- Phase 3: The Manifesto (Act II) ---
			if (trackRef?.current) {
				const { track, blocks, images } = trackRef.current;

				if (track && blocks && blocks.length > 0) {
					const getScrollAmount = () =>
						-(track.scrollWidth - window.innerWidth);

					// Initial State
					gsap.set(track, { opacity: 1, scale: 1, filter: "none", y: 0 });
					gsap.set(blocks, { y: 200, opacity: 0, scale: 0.9, skewX: 0 });

					// Reveal Blocks
					tl.to(
						blocks,
						{
							y: 0,
							opacity: 1,
							scale: 1,
							stagger: { amount: 1.0, from: "start", grid: "auto" },
							duration: 1.0,
							ease: "back.out(1.7)",
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

					// 4. "The Drop": Select the last block ("process.") and drop it
					const lastBlock = blocks[blocks.length - 1];
					if (lastBlock) {
						tl.to(
							lastBlock,
							{
								y: window.innerHeight * 0.4,
								rotation: 5,
								opacity: 0,
								duration: 1.2,
								ease: "power2.in",
							},
							6.5,
						);

						// Act IV: The Bridge - Explanatory Text
						if (readoutRef.current) {
							tl.fromTo(
								readoutRef.current,
								{ opacity: 0, y: 20 },
								{ opacity: 1, y: 0, duration: 1.0, ease: "power2.out" },
								6.8,
							);
							tl.to(
								readoutRef.current,
								{ opacity: 0, y: -20, duration: 1.0, ease: "power2.in" },
								8.5,
							);
						}
					}

					// Parallax
					if (images && images.length > 0) {
						tl.to(images, { xPercent: 50, duration: 4, ease: "none" }, 2.5);
					}
				}
			}

			// --- Phase 4: The Machine (Act III/V) ---
			if (engineRef.current) {
				const { container, canvas } = engineRef.current;

				if (container && canvas?.canvasGroup) {
					// 1. Reveal Engine Container (Fade in as 'process' drops)
					tl.to(
						container,
						{
							opacity: 1,
							scale: 1,
							duration: 1.5,
							ease: "power3.out",
							pointerEvents: "auto",
						},
						9.0,
					); // Delay slightly more to let bridge text finish

					// 2. Zoom In Schematic
					tl.fromTo(
						canvas.canvasGroup,
						{ scale: 2.0, opacity: 0 },
						{ scale: 1.0, opacity: 1, duration: 1.5, ease: "power3.inOut" },
						"<+=0.5",
					);

					// 3. Camera Pan Sequence
					tl.to(
						canvas.canvasGroup,
						{ x: 150, scale: 1.1, duration: 1.5, ease: "power2.inOut" },
						"+=0.2",
					);
					tl.to(
						canvas.canvasGroup,
						{ x: -150, scale: 1.2, duration: 1.5, ease: "power2.inOut" },
						"+=0.5",
					);
					tl.to(
						canvas.canvasGroup,
						{ x: -450, scale: 1.2, duration: 1.5, ease: "power2.inOut" },
						"+=0.5",
					);

					// 4. Reveal Product
					tl.call(
						() => {
							if (canvas.setProductStage) canvas.setProductStage("render");
						},
						[],
						"+=0.5",
					);

					// 5. UNLOCK INTERACTIVITY (Option 2)
					tl.call(
						() => {
							if (canvas.setIsInteractive) canvas.setIsInteractive(true);
						},
						[],
						"+=1.0",
					);
				}
			}

			// Velocity Skew Proxy (Manifesto only)
			ScrollTrigger.create({
				trigger: wrapperRef.current,
				start: "top top",
				end: "bottom bottom",
				scrub: 1,
				onUpdate: (self) => {
					if (trackRef?.current?.blocks) {
						const skew = self.getVelocity() / -500;
						const clampedSkew = Math.max(-15, Math.min(15, skew));
						gsap.to(trackRef.current.blocks, {
							skewX: clampedSkew,
							duration: 0.1,
							ease: "power1.out",
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
			className="relative w-full h-[800vh] bg-[#050505] z-40"
			data-testid="vortex-wrapper"
		>
			<div
				ref={viewportRef}
				className="relative h-screen w-full overflow-hidden"
				data-testid="vortex-viewport"
			>
				{children}

				{/* Act IV: The Bridge Readout */}
				<div
					ref={readoutRef}
					className="absolute inset-0 flex items-center justify-center pointer-events-none z-50 opacity-0"
				>
					<div className="flex flex-col items-center gap-4 text-center">
						<span className="text-[10px] font-mono text-[#FF4400] uppercase tracking-[0.5em] font-bold">
							Initializing_Logic_Engine
						</span>
						<h2 className="text-4xl md:text-6xl font-black text-[#1a1a1a] uppercase tracking-tighter">
							Deterministic Output
						</h2>
						<div className="flex gap-2 items-center text-[9px] font-mono text-neutral-400 uppercase tracking-widest">
							<span>Status: Calibration</span>
							<div className="w-1 h-1 bg-[#FF4400] rounded-full animate-pulse" />
							<span>v2.5_STABLE</span>
						</div>
					</div>
				</div>

				<WorkflowEngine ref={engineRef} />
			</div>
		</div>
	);
};
