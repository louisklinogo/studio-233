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
			if (locomotiveScroll.lenis) {
				locomotiveScroll.lenis.on("scroll", ScrollTrigger.update);
			}

			// Custom Ticker for GSAP
			const tick = (time: number) => {
				if (locomotiveScroll.lenis) {
					locomotiveScroll.lenis.raf(time * 1000);
				}
			};
			gsap.ticker.add(tick);

			gsap.ticker.lagSmoothing(0);

			(locomotiveScroll as any)._tick = tick;
		});

		return () => {
			if (locomotiveScroll) {
				if ((locomotiveScroll as any)._tick) {
					gsap.ticker.remove((locomotiveScroll as any)._tick);
				}
				locomotiveScroll.destroy();
			}
		};
	}, []);
}

export function VortexLocomotive({ children }: { children: React.ReactNode }) {
	useLocomotiveScroll();

	return <>{children}</>;
}
