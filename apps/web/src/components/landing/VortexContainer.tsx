import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, { useEffect, useRef, useState } from "react";
import type { VortexHeroHandle } from "./VortexHero";

interface VortexContainerProps {
	children?: React.ReactNode;
	heroRef?: React.RefObject<VortexHeroHandle | null>;
}

/**
 * VortexContainer acts as the primary orchestrator for the horizontal scroll experience.
 * It manages the global ScrollTrigger timeline and provides a pinned viewport for its children.
 */
export const VortexContainer: React.FC<VortexContainerProps> = ({
	children,
	heroRef,
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
					// 1. The "+" rotates 90 degrees (Quarter turn)
					tl.to(
						plus,
						{
							rotation: 90,
							duration: 1,
							ease: "power2.inOut",
						},
						0,
					);

					// 2. "STUDIO" moves LEFT (framing the content)
					tl.to(
						studio,
						{
							x: -window.innerWidth * 0.4, // Move towards left edge
							duration: 1,
							ease: "power2.inOut",
						},
						0,
					);

					// 3. "233" moves RIGHT (framing the content)
					tl.to(
						numeric,
						{
							x: window.innerWidth * 0.4, // Move towards right edge
							duration: 1,
							ease: "power2.inOut",
						},
						0,
					);
				}
			}
		}, wrapperRef);

		return () => ctx.revert();
	}, [mounted, heroRef]);

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
