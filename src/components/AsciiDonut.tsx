"use client";

import React, { useEffect, useRef } from "react";

export const AsciiDonut = () => {
	const preRef = useRef<HTMLPreElement>(null);

	useEffect(() => {
		let A = 0;
		let B = 0;
		let animationFrameId: number;

		const render = () => {
			// ASCII frame buffer
			const b: string[] = [];
			const z: number[] = [];

			// Config
			const width = 80;
			const height = 24; // Reduced height for tighter fit

			// Initialize buffer with spaces
			for (let k = 0; k < width * height; k++) {
				b[k] = " ";
				z[k] = 0;
			}

			// Torus calculation
			// Theta (j) goes around the cross-sectional circle of a torus
			// Phi (i) goes around the center of revolution of a torus
			for (let j = 0; j < 6.28; j += 0.07) {
				for (let i = 0; i < 6.28; i += 0.02) {
					const c = Math.sin(i);
					const d = Math.cos(j);
					const e = Math.sin(A);
					const f = Math.sin(j);
					const g = Math.cos(A);
					const h = d + 2;
					const D = 1 / (c * h * e + f * g + 5);
					const l = Math.cos(i);
					const m = Math.cos(B);
					const n = Math.sin(B);
					const t = c * h * g - f * e;

					// Project 3D coordinates (x,y,z) to 2D (x,y)
					const x = Math.floor(width / 2 + 30 * D * (l * h * m - t * n));
					const y = Math.floor(height / 2 + 12 * D * (l * h * n + t * m));
					const o = x + width * y;

					// Luminance index (0..11)
					const N = Math.floor(
						8 * ((f * e - c * d * g) * m - c * d * e - f * g - l * d * n),
					);

					if (height > y && y > 0 && x > 0 && width > x && D > z[o]) {
						z[o] = D;
						// Characters from dim to bright
						b[o] = ".,-~:;=!*#$@"[N > 0 ? N : 0];
					}
				}
			}

			if (preRef.current) {
				// Join the array into a single string with newlines
				// We construct it manually to ensure strict grid adherence
				let output = "";
				for (let i = 0; i < height; i++) {
					output += b.slice(i * width, (i + 1) * width).join("") + "\n";
				}
				preRef.current.innerText = output;
			}

			A += 0.04; // Rotation speed X
			B += 0.02; // Rotation speed Y
			animationFrameId = requestAnimationFrame(render);
		};

		render();

		return () => {
			cancelAnimationFrame(animationFrameId);
		};
	}, []);

	return (
		<div className="flex items-center justify-center w-full h-full min-h-[400px] overflow-hidden">
			<pre
				ref={preRef}
				className="font-mono text-[10px] sm:text-[12px] md:text-xs leading-[1.0] text-neutral-900 dark:text-white whitespace-pre select-none"
				style={{
					fontFamily: '"Courier New", Courier, monospace',
					lineHeight: "10px", // Force tight line height for square-ish aspect ratio
					letterSpacing: "0px",
				}}
			/>
		</div>
	);
};
