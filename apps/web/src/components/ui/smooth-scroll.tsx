"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect, useLayoutEffect } from "react";

export function SmoothScroll() {
	useLayoutEffect(() => {
		// Register ScrollTrigger to ensure it's available
		gsap.registerPlugin(ScrollTrigger);

		const lenis = new Lenis({
			duration: 1.2,
			easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential easing
			orientation: "vertical",
			gestureOrientation: "vertical",
			smoothWheel: true,
			wheelMultiplier: 1,
			touchMultiplier: 2,
			infinite: false,
		});

		// Update ScrollTrigger on Lenis scroll event
		lenis.on("scroll", ScrollTrigger.update);

		// Integrate Lenis's ticker into GSAP's ticker for perfect synchronization
		const update = (time: number, deltaTime: number, frame: number) => {
			lenis.raf(time * 1000);
		};

		gsap.ticker.add(update);

		// Disable lag smoothing in GSAP to prevent jumps during heavy scrolling
		gsap.ticker.lagSmoothing(0);

		return () => {
			gsap.ticker.remove(update);
			lenis.destroy();
		};
	}, []);

	return null;
}
