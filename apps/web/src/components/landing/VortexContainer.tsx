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
				const { studio, plus, numeric } = heroRef.current;

				if (studio && plus && numeric) {
					tl.to(
						plus,
						{
							rotation: 90,
							duration: 1,
							ease: "power2.inOut",
						},
						0,
					);

					tl.to(
						studio,
						{
							x: -window.innerWidth * 0.4,
							duration: 1,
							ease: "power2.inOut",
						},
						0,
					);

					tl.to(
						numeric,
						{
							x: window.innerWidth * 0.4,
							duration: 1,
							ease: "power2.inOut",
						},
						0,
					);
				}
			}

			// --- Phase 3: The Kinetic Stream (Horizontal Scroll) ---
			if (trackRef?.current) {
				const { track } = trackRef.current;

				if (track) {
					// We calculate how much we need to scroll horizontally
					// This should be the width of the track minus the viewport width
					// Using a function to ensure it's calculated on refresh/resize
					const getScrollAmount = () => {
						const trackWidth = track.offsetWidth;
						const windowWidth = window.innerWidth;
						return -(trackWidth - windowWidth);
					};

					tl.to(
						track,
						{
							x: getScrollAmount,
							duration: 3,
							ease: "none",
						},
						0.5,
					);
				}
			}
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
