"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, { useLayoutEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export const ManifestoGSAP = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const textRef = useRef<HTMLDivElement>(null);
	const paragraph1Ref = useRef<HTMLDivElement>(null);
	const paragraph2Ref = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		const ctx = gsap.context(() => {
			const lines = gsap.utils.toArray(".manifesto-line") as HTMLElement[];

			// Initialize the Master Timeline
			// This timeline is driven by the scroll position of the container.
			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: containerRef.current,
					start: "top top", // Start when top of container hits top of viewport
					end: "+=650%", // The animation lasts for 6.5x the viewport height
					pin: true, // Pin the container in place while scrolling
					pinSpacing: true, // Add padding to compensate for the pinned duration
					scrub: 1, // Smooth scrubbing effect (1s lag)
					anticipatePin: 1, // Prevent jitter during pinning
				},
			});

			/* =========================================
			   PHASE 1: THE SPLIT (0% - 15%)
			   The big "INFINITE CANVAS" text splits apart to reveal the content.
			   ========================================= */
			tl.addLabel("linesSplit", 0);

			tl.to(lines[0], { x: "-20%", opacity: 0.5, duration: 0.6 }, "linesSplit") // Top line moves left
				.to(lines[1], { x: "20%", opacity: 0.5, duration: 0.6 }, "linesSplit") // Middle line moves right
				.to(lines[2], { x: "-20%", opacity: 0.5, duration: 0.6 }, "linesSplit") // Bottom line moves left
				.to(
					lines,
					{ opacity: 0, filter: "blur(12px)", duration: 0.8 }, // Fade out and blur all lines
					"linesSplit+=0.25",
				);

			/* =========================================
			   PHASE 2: PARAGRAPH 01 (15% - 50%)
			   The first paragraph enters, scrolls up, highlights keywords, and exits.
			   ========================================= */
			tl.addLabel("paragraph1Enter", "linesSplit+=0.9");

			// 2.1 Entrance: Scale up and fade in from bottom
			tl.fromTo(
				paragraph1Ref.current,
				{ scale: 0.9, opacity: 0, filter: "blur(15px)", y: 140 },
				{
					scale: 1,
					opacity: 1,
					filter: "blur(0px)",
					y: 0,
					duration: 0.9,
					ease: "power3.out",
				},
				"paragraph1Enter",
			)
				// 2.2 Scroll Up: Move the paragraph upwards to simulate reading flow
				.to(
					paragraph1Ref.current,
					{ y: -450, duration: 2, ease: "none" },
					"paragraph1Enter+=0.4",
				)
				// 2.3 Kinetic Highlight: Highlight keywords in sequence
				.to(
					".highlight-p1",
					{
						backgroundColor: "#FF4D00",
						color: "#000000",
						padding: "0 0.2em",
						fontWeight: 900,
						duration: 0.8,
						stagger: 0.15, // Delay between each highlight
					},
					"paragraph1Enter+=0.9",
				)
				// 2.4 Exit: Fade out, blur, and scale down
				.to(
					paragraph1Ref.current,
					{ opacity: 0, filter: "blur(12px)", scale: 0.94, duration: 1 },
					"paragraph1Enter+=2.2",
				);

			/* =========================================
			   PHASE 3: PARAGRAPH 02 (50% - 85%)
			   The second paragraph follows the same pattern as the first.
			   ========================================= */
			tl.addLabel("paragraph2Enter", "paragraph1Enter+=2.6");

			// 3.1 Entrance
			tl.fromTo(
				paragraph2Ref.current,
				{ scale: 0.9, opacity: 0, filter: "blur(15px)", y: 140 },
				{
					scale: 1,
					opacity: 1,
					filter: "blur(0px)",
					y: 0,
					duration: 0.9,
					ease: "power3.out",
				},
				"paragraph2Enter",
			)
				// 3.2 Scroll Up
				.to(
					paragraph2Ref.current,
					{ y: -450, duration: 2, ease: "none" },
					"paragraph2Enter+=0.4",
				)
				// 3.3 Kinetic Highlight
				.to(
					".highlight-p2",
					{
						backgroundColor: "#FF4D00",
						color: "#000000",
						padding: "0 0.2em",
						fontWeight: 900,
						duration: 0.8,
						stagger: 0.15,
					},
					"paragraph2Enter+=0.9",
				)
				// 3.4 Exit
				.to(
					paragraph2Ref.current,
					{ opacity: 0, filter: "blur(12px)", scale: 0.94, duration: 1 },
					"paragraph2Enter+=2.0",
				);

			/* =========================================
			   PHASE 4: OUTRO (85% - 100%)
			   The final "SYSTEM READY" screen fades in.
			   ========================================= */
			tl.addLabel("manifestoOutro", "paragraph2Enter+=2.5");

			tl.fromTo(
				".manifesto-outro",
				{ opacity: 0, y: 80 },
				{ opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
				"manifestoOutro",
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

			<div className="mt-[40vh] mb-[40vh] z-20 w-full max-w-5xl px-6 md:px-12 mx-auto grid grid-cols-1 grid-rows-1 items-center justify-center pointer-events-none">
				{/* Grid Stacking: Both occupy row 1 / col 1 */}
				<div
					ref={paragraph1Ref}
					className="col-start-1 row-start-1 opacity-0 w-full"
				>
					<p className="font-mono text-2xl md:text-4xl lg:text-5xl text-neutral-800 dark:text-neutral-200 leading-tight text-justify tracking-tight uppercase font-bold">
						Studio+233 is not just a tool. It is a{" "}
						<span className="kinetic-highlight highlight-p1 inline-block transition-all duration-300 px-1">
							production environment
						</span>{" "}
						for the next generation of creators. Combine the freedom of an{" "}
						<span className="kinetic-highlight highlight-p1 inline-block transition-all duration-300 px-1">
							infinite canvas
						</span>{" "}
						with the power of{" "}
						<span className="kinetic-highlight highlight-p1 inline-block transition-all duration-300 px-1">
							autonomous AI agents
						</span>{" "}
						to scale your workflow from one to one thousand.
					</p>
				</div>

				<div
					ref={paragraph2Ref}
					className="col-start-1 row-start-1 opacity-0 w-full"
				>
					<p className="font-mono text-2xl md:text-4xl lg:text-5xl text-neutral-800 dark:text-neutral-200 leading-tight text-justify tracking-tight uppercase font-bold">
						Stop generating one-offs.{" "}
						<span className="kinetic-highlight highlight-p2 inline-block transition-all duration-300 px-1">
							Orchestrate entire campaigns
						</span>{" "}
						on an infinite canvas that thinks. Drag, drop, and chain neural
						models to{" "}
						<span className="kinetic-highlight highlight-p2 inline-block transition-all duration-300 px-1">
							batch process 1,000+ assets
						</span>{" "}
						in minutes. This isn't just a tool; it's your new{" "}
						<span className="kinetic-highlight highlight-p2 inline-block transition-all duration-300 px-1">
							industrial-grade creative operating system
						</span>
						.
					</p>
				</div>
			</div>

			{/* 3D Grid Outro */}
			<div className="manifesto-outro absolute bottom-0 left-0 right-0 h-[50vh] flex flex-col items-center justify-end pb-20 opacity-0 pointer-events-none">
				{/* Wireframe Floor */}
				<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(to_bottom,transparent,black)] opacity-50" />

				{/* Floating Windows (Decor) */}
				<div className="absolute inset-0 flex items-center justify-center perspective-[1000px] pointer-events-none opacity-30">
					<div className="w-[200px] h-[150px] border border-neutral-500/30" />
				</div>

				{/* Prompt */}
				<div className="relative z-10 flex flex-col items-center gap-2">
					<span className="text-[10px] font-mono text-neutral-500 tracking-[0.5em]">
						SYSTEM_READY
					</span>
					<h2 className="text-4xl md:text-6xl font-black text-neutral-900 dark:text-white tracking-tighter">
						INITIATE SEQUENCE
						<span className="animate-pulse text-orange-500">_</span>
					</h2>
				</div>
			</div>
		</section>
	);
};
