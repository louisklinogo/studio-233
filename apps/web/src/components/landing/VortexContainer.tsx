"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, { useEffect, useRef, useState } from "react";
import type { KineticTrackHandle } from "./KineticTrack";
import type { VortexHeroHandle } from "./VortexHero";

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

			// --- Phase 2: The Curtain Split ---
			if (heroRef?.current) {
				const { studio, plus, numeric, surface } = heroRef.current;
				console.log("VortexContainer: Hero elements found", {
					studio,
					plus,
					numeric,
					surface,
				});

				if (studio && plus && numeric && surface) {
					// 1. Aperture Expansion
					tl.to(
						plus,
						{
							rotation: 90,
							scale: 3000,
							duration: 1.5,
							ease: "power3.inOut",
						},
						0,
					);

					tl.to(
						studio,
						{
							x: -window.innerWidth * 0.6, // Push further to ensure clearance
							duration: 1.5, // Match duration with aperture
							ease: "power2.inOut",
						},
						0,
					);

					tl.to(
						numeric,
						{
							x: window.innerWidth * 0.6, // Push further to ensure clearance
							duration: 1.5, // Match duration with aperture
							ease: "power2.inOut",
						},
						0,
					);

					// Fade out the black surface slightly later to ensure seamless white-out
					tl.to(
						surface,
						{
							opacity: 0,
							duration: 0.5,
							ease: "none",
						},
						1.0,
					);
				}
			}

			if (trackRef?.current) {
				const { track, blocks, images } = trackRef.current;

				if (track && blocks && blocks.length > 0) {
					const getScrollAmount = () => {
						const trackWidth = track.scrollWidth;
						const windowWidth = window.innerWidth;
						return -(trackWidth - windowWidth);
					};

					// ... (Keep existing setup code) ...

					// Initial State: Track is visible/centered (via CSS/Flex), but blocks are hidden
					gsap.set(track, {
						opacity: 1,
						scale: 1,
						filter: "none",
						y: 0,
					});

					// Set initial state for blocks (hidden, slightly down)
					gsap.set(blocks, {
						y: 200,
						opacity: 0,
						scale: 0.9,
						skewX: 0,
					});

					// 1. "Woah" Entry: Staggered Block Reveal (The Box Effect)
					tl.to(
						blocks,
						{
							y: 0,
							opacity: 1,
							scale: 1,
							stagger: {
								amount: 1.0,
								from: "start",
								grid: "auto",
							},
							duration: 1.0,
							ease: "back.out(1.7)",
						},
						1.2,
					);

					// 2. The Horizontal Scroll (Begins after the reveal settles)
					tl.to(
						track,
						{
							x: getScrollAmount,
							duration: 4, // Long horizontal scroll
							ease: "none",
						},
						2.5,
					);

					// 3. Parallax for Images
					if (images && images.length > 0) {
						tl.to(
							images,
							{
								xPercent: 50, // Significant parallax movement
								duration: 4,
								ease: "none",
							},
							2.5, // Sync with track scroll
						);
					}
				}
			}

			// Velocity Skew Proxy
			// We can't put onUpdate in the timeline scrollTrigger easily if we defined it above.
			// We'll create a separate ScrollTrigger just for the physics effects.
			ScrollTrigger.create({
				trigger: wrapperRef.current,
				start: "top top",
				end: "bottom bottom",
				scrub: 1,
				onUpdate: (self) => {
					if (trackRef?.current?.blocks) {
						const skew = self.getVelocity() / -500;
						const clampedSkew = Math.max(-15, Math.min(15, skew));

						// Apply skew to blocks
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
			className="relative w-full h-[500vh] bg-[#050505] z-40"
			data-testid="vortex-wrapper"
		>
			<div
				ref={viewportRef}
				className="relative h-screen w-full overflow-hidden"
				data-testid="vortex-viewport"
			>
				{children}
			</div>
		</div>
	);
};
