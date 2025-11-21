"use client";

import React, { useEffect, useRef } from "react";

export const AsciiDonut = () => {
	const preRef = useRef<HTMLPreElement>(null);

	useEffect(() => {
		let A = 0;
		let B = 0;
		let animationFrameId: number;

		const render = () => {
			const b: string[] = [];
			const z: number[] = [];

			// Increased resolution for larger display
			const width = 100; // Was 80
			const height = 45; // Was 24

			for (let k = 0; k < width * height; k++) {
				b[k] = " ";
				z[k] = 0;
			}

			for (let j = 0; j < 6.28; j += 0.05) {
				// Finer steps
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

					// Scaled up projection
					const x = Math.floor(width / 2 + 40 * D * (l * h * m - t * n));
					const y = Math.floor(height / 2 + 20 * D * (l * h * n + t * m));
					const o = x + width * y;

					const N = Math.floor(
						8 * ((f * e - c * d * g) * m - c * d * e - f * g - l * d * n),
					);

					if (height > y && y > 0 && x > 0 && width > x && D > z[o]) {
						z[o] = D;
						b[o] = ".,-~:;=!*#$@"[N > 0 ? N : 0];
					}
				}
			}

			if (preRef.current) {
				let output = "";
				for (let i = 0; i < height; i++) {
					output += b.slice(i * width, (i + 1) * width).join("") + "\n";
				}
				preRef.current.innerText = output;
			}

			A += 0.04;
			B += 0.02;
			animationFrameId = requestAnimationFrame(render);
		};

		render();

		return () => cancelAnimationFrame(animationFrameId);
	}, []);

	return (
		<div className="flex items-center justify-center w-full h-full overflow-hidden">
			<pre
				ref={preRef}
				className="font-mono text-[8px] sm:text-[10px] md:text-xs leading-[1.0] text-neutral-900 dark:text-white whitespace-pre select-none"
				style={{
					fontFamily: '"Courier New", Courier, monospace',
					letterSpacing: "0px",
				}}
			/>
		</div>
	);
};
