"use client";

import React, { useEffect, useRef, useState } from "react";
import { createNoise3D } from "simplex-noise";

export const AsciiFluid = () => {
	const preRef = useRef<HTMLPreElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [isVisible, setIsVisible] = useState(false);

	// Intersection Observer
	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				setIsVisible(entry.isIntersecting);
			},
			{ threshold: 0.1 },
		);

		if (containerRef.current) {
			observer.observe(containerRef.current);
		}

		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (!isVisible) return;

		let t = 0;
		let animationFrameId: number;
		const noise3D = createNoise3D();

		// Responsive Configuration
		const isMobile = window.innerWidth < 768;
		const width = isMobile ? 50 : 100;
		const height = isMobile ? 25 : 50;
		const speed = 0.005;
		const noiseScale = 0.08;

		// Density Ramp (Dark to Light)
		// Swiss style ramp:
		const chars = " .-+*#@";

		const render = () => {
			let output = "";

			for (let y = 0; y < height; y++) {
				for (let x = 0; x < width; x++) {
					// Calculate noise value at this coordinate
					// x, y are spatial, t is time
					const value = noise3D(x * noiseScale, y * noiseScale * 0.5, t);

					// Normalize -1...1 to 0...1
					const n = (value + 1) / 2;

					// Map to character index
					const charIdx = Math.floor(n * (chars.length - 1));
					output += chars[charIdx];
				}
				output += "\n";
			}

			if (preRef.current) {
				preRef.current.innerText = output;
			}

			t += speed;
			animationFrameId = requestAnimationFrame(render);
		};

		render();

		return () => cancelAnimationFrame(animationFrameId);
	}, [isVisible]);

	return (
		<div
			ref={containerRef}
			className="flex items-center justify-center w-full h-full overflow-hidden"
			aria-hidden="true"
		>
			<pre
				ref={preRef}
				className="font-mono text-[8px] sm:text-[10px] md:text-xs leading-[1.0] text-neutral-900 dark:text-white whitespace-pre select-none opacity-80"
				style={{
					fontFamily: '"Courier New", Courier, monospace',
					lineHeight: "10px",
					letterSpacing: "0px",
				}}
			/>
			<span className="sr-only">
				ASCII art animation of fluid noise patterns.
			</span>
		</div>
	);
};
