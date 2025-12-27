"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, { useEffect, useRef, useState } from "react";

interface HoverBlockProps {
	word: string;
	imageUrl?: string;
	index?: string;
	className?: string; // Add className prop for GSAP targeting
}

const HoverBlock: React.FC<HoverBlockProps> = ({
	word,
	imageUrl,
	index,
	className,
}) => {
	const [isHovered, setIsHovered] = useState(false);
	const isInteractive = !!imageUrl;

	return (
		<div
			onMouseEnter={() => isInteractive && setIsHovered(true)}
			onMouseLeave={() => isInteractive && setIsHovered(false)}
			className={`
                manifesto-block relative overflow-hidden px-4 py-2 sm:px-8 sm:py-4 bg-[#f4f4f0] border transition-colors duration-500
                ${isInteractive ? "cursor-switch" : "cursor-default"}
                ${isHovered ? "border-[#D81E05] z-10" : "border-neutral-300"}
                ${className || ""}
            `}
		>
			<div className="relative z-20">
				<span
					className={`
                    manifesto-text inline-block
                    text-2xl md:text-5xl lg:text-7xl font-bold tracking-tighter uppercase leading-none
                    ${isHovered && isInteractive ? "text-[#D81E05]" : "text-black"}
                    transition-colors duration-300
                `}
				>
					{word}
				</span>
			</div>

			{/* Technical Marker */}
			{isInteractive && (
				<div
					className={`absolute top-1 right-1 w-1.5 h-1.5 transition-colors duration-300 ${isHovered ? "bg-[#D81E05]" : "bg-neutral-800"}`}
				/>
			)}

			{/* Hover Image Reveal */}
			{imageUrl && (
				<div
					className={`absolute inset-0 z-10 transition-all duration-500 ease-out overflow-hidden pointer-events-none ${
						isHovered ? "opacity-100" : "opacity-0"
					}`}
				>
					<img
						src={imageUrl}
						className={`w-full h-full object-cover grayscale transition-transform duration-700 ${isHovered ? "scale-100" : "scale-125"}`}
						alt=""
					/>
					{/* Orange Overlay for interaction feedbak */}
					<div className="absolute inset-0 bg-[#D81E05] mix-blend-multiply opacity-20" />

					<div className="absolute bottom-2 left-2 text-[8px] font-mono text-white bg-black px-1 uppercase invert">
						REF_{index}
					</div>
				</div>
			)}
		</div>
	);
};

export const VortexManifesto: React.FC = () => {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		gsap.registerPlugin(ScrollTrigger);

		const ctx = gsap.context(() => {
			const blocks = gsap.utils.toArray(".manifesto-block") as HTMLElement[];

			// Initial Chaos State (Entropy)
			// We set them to be scattered, blurred, and rotated
			blocks.forEach((block) => {
				gsap.set(block, {
					x: gsap.utils.random(-100, 100),
					y: gsap.utils.random(-50, 150),
					rotation: gsap.utils.random(-15, 15),
					scale: gsap.utils.random(0.8, 1.2),
					filter: "blur(8px)",
					opacity: 0,
				});
			});

			// The Restoration Timeline (Signal Tuning)
			const tl = gsap.timeline({
				scrollTrigger: {
					trigger: wrapperRef.current,
					start: "top top",
					end: "bottom bottom",
					scrub: 1, // Smooth, heavy scrubbing feel
				},
			});

			// Animate to Order (Grid Lock)
			tl.to(blocks, {
				x: 0,
				y: 0,
				rotation: 0,
				scale: 1,
				filter: "blur(0px)", // Focus
				opacity: 1,
				duration: 1,
				stagger: {
					amount: 0.8, // Wave effect
					// "random" fits the 'entropy to order' theme better.
					// It feels like the signal is being "found" from the noise.
					from: "random",
					grid: "auto",
				},
				ease: "power2.out", // Snap into place at the end
			});
		}, wrapperRef);

		return () => ctx.revert();
	}, []);

	const sentence1 = [
		{ w: "We" },
		{ w: "build" },
		{ w: "for" },
		{ w: "the" },
		{
			w: "purity",
			img: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?auto=format&fit=crop&q=80&w=600",
			idx: "01",
		},
		{ w: "of" },
		{
			w: "logic.",
			img: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=600",
			idx: "02",
		},
	];

	const sentence2 = [
		{ w: "Restoring" },
		{ w: "the" },
		{
			w: "signal",
			img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600",
			idx: "03",
		},
		{ w: "to" },
		{ w: "the" },
		{
			w: "creative",
			img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600",
			idx: "04",
		},
		{
			w: "process.",
			img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600",
			idx: "05",
		},
	];

	return (
		// Scroll Track: Height defines the duration of the "Tuning" process
		// Matched BG #f4f4f0 to the Hero's end state
		<div ref={wrapperRef} className="relative h-[200vh] bg-[#f4f4f0] z-30">
			{/* Sticky Container */}
			<section className="sticky top-0 w-full h-screen flex flex-col items-center justify-center overflow-hidden select-none">
				<div className="max-w-7xl mx-auto px-8 lg:px-24 w-full">
					{/* Header Metadata - Fades in cleanly */}
					<div className="mb-12 flex items-center gap-6 opacity-30">
						<div className="w-8 h-px bg-black" />
						<span className="text-[10px] font-mono uppercase tracking-[0.5em] text-black">
							System_Manifesto_Sequence_v4.0
						</span>
					</div>

					{/* The Grid Workspace */}
					<div
						ref={containerRef}
						className="flex flex-col gap-4 md:gap-8 items-start perspective-1000"
					>
						<div className="flex flex-wrap gap-2 md:gap-4 justify-start">
							{sentence1.map((item, i) => (
								<HoverBlock
									key={`s1-${i}`}
									word={item.w}
									imageUrl={item.img}
									index={item.idx}
								/>
							))}
						</div>

						<div className="flex flex-wrap gap-2 md:gap-4 justify-start">
							{sentence2.map((item, i) => (
								<HoverBlock
									key={`s2-${i}`}
									word={item.w}
									imageUrl={item.img}
									index={item.idx}
								/>
							))}
						</div>
					</div>
				</div>

				{/* Act II Decorative Metadata */}
				<div className="absolute bottom-10 left-10 pointer-events-none opacity-20">
					<div className="flex flex-col gap-1">
						<div className="flex gap-1">
							{[...Array(5)].map((_, i) => (
								<div key={i} className="w-1 h-1 bg-black" />
							))}
						</div>
						<span className="text-[8px] font-mono text-black uppercase tracking-widest">
							Calibration: Valid
						</span>
					</div>
				</div>
			</section>
		</div>
	);
};
