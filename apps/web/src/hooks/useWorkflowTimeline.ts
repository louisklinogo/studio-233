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

			// 1. Initial State
			tl.set(refs.canvasGroup.current, {
				scale: 1.5,
				x: 0,
				y: 0,
				opacity: 0,
			});

			// 2. Zoom In & Reveal Schematic
			tl.to(refs.canvasGroup.current, {
				scale: 1,
				opacity: 1,
				duration: 1.5,
				ease: "power3.inOut",
			});

			// 3. Simulate Data Flow (Packet 1 -> 2)
			// Note: We'll dispatch events or use state callbacks here in a real integration,
			// but for the timeline visual, we animate the 'active' states via class or attributes if possible.
			// For this hook, we'll focus on the Camera/Canvas movements.

			// 4. Focus on Processor Node
			tl.to(
				refs.canvasGroup.current,
				{
					x: -150, // Pan to center processing nodes
					scale: 1.2,
					duration: 1.2,
					ease: "power2.inOut",
				},
				"+=0.2",
			);

			// 5. Processing Hold (Simulate calculation time)
			tl.to({}, { duration: 1.5 });

			// 6. Pan to Output Node
			tl.to(
				refs.canvasGroup.current,
				{
					x: -450,
					scale: 1.2,
					duration: 1.2,
					ease: "power2.inOut",
				},
				"+=0.1",
			);

			// 7. Reveal Product
			if (refs.productContainer.current) {
				tl.fromTo(
					refs.productContainer.current,
					{ opacity: 0, scale: 0.9 },
					{ opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.7)" },
					"-=0.5",
				);
			}

			// 8. Zoom Out to Full View
			tl.to(
				refs.canvasGroup.current,
				{
					x: 0,
					y: 0,
					scale: 1,
					duration: 1.5,
					ease: "power3.inOut",
				},
				"+=1.0",
			);
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
