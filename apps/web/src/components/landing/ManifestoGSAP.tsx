"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, { useLayoutEffect, useRef } from "react";
import { ScrambleText } from "@/components/ui/ScrambleText";

gsap.registerPlugin(ScrollTrigger);

export const ManifestoGSAP = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const textRef = useRef<HTMLDivElement>(null);
	const paragraphRef = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		const ctx = gsap.context(() => {
			const lines = gsap.utils.toArray(".manifesto-line") as HTMLElement[];

			// Create a unified timeline that handles pinning and all animations
			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: containerRef.current,
					start: "top top",
					end: "+=250%", // Optimized duration for smooth animation flow
					pin: true,
					pinSpacing: true,
					scrub: 1,
					anticipatePin: 1,
				},
			});

			// Phase 1: Split the big text away (starts at 0)
			tl.to(lines[0], { x: "-20%", opacity: 0.5 }, 0)
				.to(lines[1], { x: "20%", opacity: 0.5 }, 0)
				.to(lines[2], { x: "-20%", opacity: 0.5 }, 0);

			// Phase 2: Fade out big text completely (starts at 0.2)
			// This ensures it's gone before the paragraph tries to be readable
			tl.to(lines, { opacity: 0, filter: "blur(10px)" }, 0.2);

			// Phase 3: Reveal the paragraph (starts at 0.3)
			tl.fromTo(
				paragraphRef.current,
				{ scale: 0.9, opacity: 0, filter: "blur(10px)", y: 100 },
				{ scale: 1, opacity: 1, filter: "blur(0px)", y: 0 },
				0.3,
			);

			// Phase 3.5: Move paragraph upward (starts at 0.35)
			tl.to(paragraphRef.current, { y: -400, ease: "none" }, 0.35);

			// Phase 4: Highlight the power words (starts at 0.5)
			// Paragraph is fully visible now, so we animate the highlights
			tl.to(
				".kinetic-highlight",
				{
					color: "#FF4D00",
					fontWeight: 900,
					duration: 0.3,
					stagger: 0.1,
				},
				0.5,
			);

			// Phase 5: Fade out everything at the end (starts at 2.0)
			tl.to(
				[textRef.current, paragraphRef.current],
				{
					opacity: 0,
					filter: "blur(10px)",
					scale: 0.95,
				},
				2.0,
			);
		}, containerRef);

		return () => ctx.revert();
	}, []);

	return (
		<section
			ref={containerRef}
			className="relative z-30 min-h-[200vh] flex flex-col items-center justify-start pt-[5vh] overflow-hidden"
		>
			<div
				ref={textRef}
				className="flex flex-col gap-2 md:gap-4 font-black text-[7vw] tracking-tighter leading-[0.8] select-none text-neutral-900 dark:text-white opacity-90 w-full max-w-[90vw] mx-auto"
			>
				<div className="manifesto-line whitespace-nowrap pl-4 w-full">
					INFINITE CANVAS.
				</div>
				<div className="manifesto-line whitespace-nowrap text-right pr-4 text-[#FF4D00] w-full">
					AGENTIC INTELLIGENCE.
				</div>
				<div className="manifesto-line whitespace-nowrap pl-4 w-full">
					YOUR CREATIVE ENGINE.
				</div>
			</div>

			<div
				ref={paragraphRef}
				className="mt-[40vh] mb-[40vh] flex justify-center z-20 max-w-5xl px-6 md:px-12 opacity-0 mx-auto"
			>
				<p className="font-mono text-2xl md:text-4xl lg:text-5xl text-neutral-800 dark:text-neutral-200 leading-tight text-justify tracking-tight uppercase font-bold">
					Studio+233 is not just a tool. It is a{" "}
					<ScrambleText
						text="production environment"
						className="kinetic-highlight transition-colors duration-300"
					/>{" "}
					for the next generation of creators. Combine the freedom of an{" "}
					<ScrambleText
						text="infinite canvas"
						className="kinetic-highlight transition-colors duration-300"
					/>{" "}
					with the power of{" "}
					<ScrambleText
						text="autonomous AI agents"
						className="kinetic-highlight transition-colors duration-300"
					/>{" "}
					to scale your workflow from one to one thousand.
				</p>
			</div>
		</section>
	);
};
