"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, { useLayoutEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

const Redacted = ({
	children,
	className,
	curtainClass,
}: {
	children: React.ReactNode;
	className?: string;
	curtainClass: string;
}) => (
	<span
		className={`relative inline-block whitespace-nowrap overflow-hidden align-bottom mx-1 px-1 py-1 ${className}`}
	>
		<span className="relative z-10">{children}</span>
		<span
			className={`redaction-curtain ${curtainClass} absolute inset-0 bg-[#FF4D00] z-20 origin-left`}
		/>
	</span>
);

export const ManifestoGSAP = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const textRef = useRef<HTMLDivElement>(null);
	const paragraph1Ref = useRef<HTMLDivElement>(null);
	const paragraph2Ref = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		const ctx = gsap.context(() => {
			const lines = gsap.utils.toArray(".manifesto-line") as HTMLElement[];

			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: containerRef.current,
					start: "top top",
					end: "+=650%",
					pin: true,
					pinSpacing: true,
					scrub: 1,
					anticipatePin: 1,
				},
			});

			/* =========================================
         PHASE 1: THE SPLIT
         ========================================= */
			tl.addLabel("linesSplit", 0);

			tl.to(lines[0], { x: "-20%", opacity: 0.5, duration: 0.6 }, "linesSplit")
				.to(lines[1], { x: "20%", opacity: 0.5, duration: 0.6 }, "linesSplit")
				.to(lines[2], { x: "-20%", opacity: 0.5, duration: 0.6 }, "linesSplit")
				.to(
					lines,
					{ opacity: 0, filter: "blur(12px)", duration: 0.8 },
					"linesSplit+=0.25",
				);

			/* =========================================
         PHASE 2: PARAGRAPH 01
         ========================================= */
			tl.addLabel("paragraph1Enter", "linesSplit+=0.9");

			// 2.1 Entrance
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
				// 2.2 Scroll Up
				.to(
					paragraph1Ref.current,
					{ y: -450, duration: 2, ease: "none" },
					"paragraph1Enter+=0.4",
				)
				// 2.3 Redaction Reveal (Peel back the curtain)
				.to(
					".curtain-p1",
					{
						scaleX: 0,
						duration: 0.6,
						stagger: 0.2,
						ease: "power2.inOut",
					},
					"paragraph1Enter+=0.9",
				)
				// 2.4 Exit
				.to(
					paragraph1Ref.current,
					{ opacity: 0, filter: "blur(12px)", scale: 0.94, duration: 1 },
					"paragraph1Enter+=2.2",
				);

			/* =========================================
         PHASE 3: PARAGRAPH 02
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
				// 3.3 Redaction Reveal
				.to(
					".curtain-p2",
					{
						scaleX: 0,
						duration: 0.6,
						stagger: 0.2,
						ease: "power2.inOut",
					},
					"paragraph2Enter+=0.9",
				)
				// 3.4 Exit
				.to(
					paragraph2Ref.current,
					{ opacity: 0, filter: "blur(12px)", scale: 0.94, duration: 1 },
					"paragraph2Enter+=2.0",
				);
		}, containerRef);

		return () => ctx.revert();
	}, []);

	return (
		<section
			ref={containerRef}
			className="relative z-30 min-h-[150vh] flex flex-col items-center justify-start pt-[10vh] overflow-hidden"
		>
			<div
				ref={textRef}
				className="flex flex-col gap-0 font-extrabold text-[7.5vw] tracking-tighter leading-[0.9] select-none text-neutral-900 dark:text-white w-full max-w-[95vw] mx-auto uppercase"
			>
				<div className="manifesto-line whitespace-nowrap pl-4 w-full">
					INFINITE CANVAS.
				</div>
				<div className="manifesto-line whitespace-nowrap text-right pr-4 text-[#FF4D00] w-full indent-[10vw]">
					AGENTIC INTELLIGENCE.
				</div>
				<div className="manifesto-line whitespace-nowrap pl-4 w-full text-center">
					YOUR CREATIVE ENGINE.
				</div>
			</div>

			<div className="mt-[20vh] mb-[20vh] z-20 w-full max-w-4xl px-6 md:px-12 mx-auto grid grid-cols-1 grid-rows-1 items-center justify-center pointer-events-none">
				<div
					ref={paragraph1Ref}
					className="col-start-1 row-start-1 opacity-0 w-full"
				>
					<p className="font-sans text-xl md:text-4xl lg:text-5xl text-neutral-500 dark:text-neutral-400 leading-tight text-left tracking-tight font-normal">
						Studio+233 is not just a tool. It is a
						<Redacted
							curtainClass="curtain-p1"
							className="font-mono text-neutral-900 dark:text-white font-bold"
						>
							production environment
						</Redacted>
						for the next generation of creators. Combine the freedom of an
						<Redacted
							curtainClass="curtain-p1"
							className="font-mono text-neutral-900 dark:text-white font-bold"
						>
							infinite canvas
						</Redacted>
						with the power of
						<Redacted
							curtainClass="curtain-p1"
							className="font-mono text-neutral-900 dark:text-white font-bold"
						>
							autonomous AI agents
						</Redacted>
						to scale your workflow from one to one thousand.
					</p>
				</div>

				<div
					ref={paragraph2Ref}
					className="col-start-1 row-start-1 opacity-0 w-full"
				>
					<p className="font-sans text-xl md:text-4xl lg:text-5xl text-neutral-500 dark:text-neutral-400 leading-tight text-left tracking-tight font-normal">
						Stop generating one-offs.
						<Redacted
							curtainClass="curtain-p2"
							className="font-mono text-neutral-900 dark:text-white font-bold"
						>
							Orchestrate entire campaigns
						</Redacted>
						on an infinite canvas that thinks. Drag, drop, and chain neural
						models to
						<Redacted
							curtainClass="curtain-p2"
							className="font-mono text-neutral-900 dark:text-white font-bold"
						>
							batch process 1,000+ assets
						</Redacted>
						in minutes. This isn't just a tool; it's your new
						<Redacted
							curtainClass="curtain-p2"
							className="font-mono text-neutral-900 dark:text-white font-bold"
						>
							industrial-grade creative OS
						</Redacted>
						.
					</p>
				</div>
			</div>
		</section>
	);
};
