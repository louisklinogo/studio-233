"use client";

import React, { useEffect, useRef } from "react";
import { createNoise3D } from "simplex-noise";

export const AsciiFluid = () => {
	const preRef = useRef<HTMLPreElement>(null);

	useEffect(() => {
		let t = 0;
		let animationFrameId: number;
		const noise3D = createNoise3D();

		// Configuration
		const width = 100; // Increased from 80
		const height = 50; // Increased from 40
		const speed = 0.005;
		const noiseScale = 0.08;

		// Density Ramp (Dark to Light)
		// const chars = " .:-=+*#%@";
		// const chars = " .`'.,^:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
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
	}, []);

	return (
		<div className="flex items-center justify-center w-full h-full overflow-hidden">
			<pre
				ref={preRef}
				className="font-mono text-[8px] sm:text-[10px] md:text-xs leading-[1.0] text-neutral-900 dark:text-white whitespace-pre select-none opacity-80"
				style={{
					fontFamily: '"Courier New", Courier, monospace',
					lineHeight: "10px",
					letterSpacing: "0px",
				}}
			/>
		</div>
	);
};
