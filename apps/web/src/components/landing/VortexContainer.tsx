"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, { useEffect, useRef, useState } from "react";

interface VortexContainerProps {
	children?: React.ReactNode;
}

/**
 * VortexContainer acts as the primary orchestrator for the horizontal scroll experience.
 * It manages the global ScrollTrigger timeline and provides a pinned viewport for its children.
 */
export const VortexContainer: React.FC<VortexContainerProps> = ({
	children,
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
			// The pin: true here ensures the viewport stays fixed while we scroll through the wrapper's height
			gsap.timeline({
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
		}, wrapperRef);

		return () => ctx.revert();
	}, [mounted]);

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
