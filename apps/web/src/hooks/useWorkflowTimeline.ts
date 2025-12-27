"use client";

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

export interface WorkflowTimelineRefs {
	wrapper: React.RefObject<HTMLDivElement | null>;
	canvasGroup: React.RefObject<SVGGElement | null>;
	productContainer: React.RefObject<HTMLDivElement | null>;
}

export interface WorkflowTimelineControls {
	playSequence: () => void;
	resetSequence: () => void;
	isPlaying: boolean;
	progress: number;
}

/**
 * useWorkflowTimeline
 * Manages the GSAP animation sequence for the Workflow Engine.
 */
export const useWorkflowTimeline = (
	refs: WorkflowTimelineRefs,
): WorkflowTimelineControls => {
	const [isPlaying, setIsPlaying] = useState(false);
	const [progress, setProgress] = useState(0);
	const timelineRef = useRef<gsap.core.Timeline | null>(null);

	useEffect(() => {
		if (!refs.wrapper.current || !refs.canvasGroup.current) return;

		const ctx = gsap.context(() => {
			const tl = gsap.timeline({
				paused: true,
				onUpdate: () => {
					setProgress(tl.progress());
				},
				onComplete: () => {
					setIsPlaying(false);
				},
			});

			timelineRef.current = tl;

			// --- Sequence Definition ---

			// 1. Initial State (Hidden, waiting for Manifesto to finish)
			tl.set(refs.canvasGroup.current, {
				scale: 2.0, // Start zoomed out/in
				x: 0,
				y: 0,
				opacity: 0,
			});

			if (refs.productContainer.current) {
				tl.set(refs.productContainer.current, { opacity: 0, scale: 0.8 });
			}

			// 2. Act III: The Machine Awakens (Zoom In)
			tl.to(refs.canvasGroup.current, {
				scale: 1,
				opacity: 1,
				duration: 2.0,
				ease: "power4.inOut",
			});

			// 3. Data Flow (Simulated)
			// Move Camera to Input Node
			tl.to(refs.canvasGroup.current, {
				x: 150, // Shift to show input
				scale: 1.1,
				duration: 1.5,
				ease: "power2.inOut",
			});

			// Pulse Input
			tl.to({}, { duration: 0.5 }); // Wait

			// Move Camera to Processor
			tl.to(refs.canvasGroup.current, {
				x: -150, // Shift to processor
				scale: 1.2,
				duration: 1.5,
				ease: "power2.inOut",
			});

			// Processing Churn
			tl.to({}, { duration: 1.0 });

			// Move Camera to Output
			tl.to(refs.canvasGroup.current, {
				x: -450, // Shift to output
				scale: 1.2,
				duration: 1.5,
				ease: "power2.inOut",
			});

			// 4. Act V: Product Reveal
			if (refs.productContainer.current) {
				tl.to(refs.productContainer.current, {
					opacity: 1,
					scale: 1,
					duration: 1.0,
					ease: "elastic.out(1, 0.75)",
				});
			}

			// Final Hold
			tl.to({}, { duration: 1.0 });
		}, refs.wrapper);

		return () => ctx.revert();
	}, [refs.wrapper, refs.canvasGroup, refs.productContainer]);

	const playSequence = () => {
		if (timelineRef.current) {
			setIsPlaying(true);
			timelineRef.current.restart();
		}
	};

	const resetSequence = () => {
		if (timelineRef.current) {
			timelineRef.current.pause(0);
			setIsPlaying(false);
			setProgress(0);
		}
	};

	return {
		playSequence,
		resetSequence,
		isPlaying,
		progress,
	};
};
