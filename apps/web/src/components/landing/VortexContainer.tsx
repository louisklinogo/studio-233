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
					// 1. Aperture Expansion
					tl.to(
						plus,
						{ rotation: 90, scale: 3000, duration: 1.5, ease: "power3.inOut" },
						0,
					);
					tl.to(
						studio,
						{
							x: -window.innerWidth * 0.6,
							duration: 1.5,
							ease: "power2.inOut",
						},
						0,
					);
					tl.to(
						numeric,
						{ x: window.innerWidth * 0.6, duration: 1.5, ease: "power2.inOut" },
						0,
					);
					tl.to(surface, { opacity: 0, duration: 0.5, ease: "none" }, 1.0);
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

					// Parallax
					if (images && images.length > 0) {
						tl.to(images, { xPercent: 50, duration: 4, ease: "none" }, 2.5);
					}
				}
			}

			// --- Phase 4: The Machine (Act III) ---
			if (engineRef.current) {
				const { container, canvas } = engineRef.current;

				if (container && canvas?.canvasGroup) {
					// 1. Reveal Engine Container (Fade in over manifesto)
					tl.to(
						container,
						{
							opacity: 1,
							scale: 1,
							duration: 1.5,
							ease: "power2.inOut",
							pointerEvents: "auto",
						},
						6.5,
					); // Starts after manifesto scroll finishes

					// 2. Zoom In Schematic
					tl.fromTo(
						canvas.canvasGroup,
						{ scale: 2.0, opacity: 0 },
						{ scale: 1.0, opacity: 1, duration: 1.5, ease: "power3.inOut" },
						"<+=0.5",
					);

					// 3. Camera Pan Sequence (Simulated Data Flow)
					// Pan to Input
					tl.to(
						canvas.canvasGroup,
						{
							x: 150,
							scale: 1.1,
							duration: 1.5,
							ease: "power2.inOut",
						},
						"+=0.2",
					);

					// Pan to Processor
					tl.to(
						canvas.canvasGroup,
						{
							x: -150,
							scale: 1.2,
							duration: 1.5,
							ease: "power2.inOut",
						},
						"+=0.5",
					);

					// Pan to Output
					tl.to(
						canvas.canvasGroup,
						{
							x: -450,
							scale: 1.2,
							duration: 1.5,
							ease: "power2.inOut",
						},
						"+=0.5",
					);

					// 4. Reveal Product (If accessible, or simulate via stage setter)
					// We'll use a call to trigger the internal state change in the canvas component
					tl.call(
						() => {
							if (canvas.setProductStage) canvas.setProductStage("render");
						},
						[],
						"+=0.5",
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
				<WorkflowEngine ref={engineRef} />
			</div>
		</div>
	);
};
