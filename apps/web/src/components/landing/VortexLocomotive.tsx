"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export function useLocomotiveScroll() {
	useEffect(() => {
		let locomotiveScroll: any;

		import("locomotive-scroll").then((LocomotiveScroll) => {
			locomotiveScroll = new LocomotiveScroll.default({
				lenisOptions: {
					duration: 1.2,
					easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
					orientation: "vertical",
					gestureOrientation: "vertical",
					smoothWheel: true,
					wheelMultiplier: 1,
					touchMultiplier: 2,
					lerp: 0.1,
				},
			});

			// Sync with GSAP ScrollTrigger
			locomotiveScroll.on("scroll", ScrollTrigger.update);

			// Custom Ticker for GSAP
			gsap.ticker.add((time) => {
				locomotiveScroll.raf(time * 1000);
			});

			gsap.ticker.lagSmoothing(0);
		});

		return () => {
			if (locomotiveScroll) locomotiveScroll.destroy();
		};
	}, []);
}

export function VortexLocomotive({ children }: { children: React.ReactNode }) {
	useLocomotiveScroll();

	return <>{children}</>;
}
