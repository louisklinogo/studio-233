"use client";

import React, { useEffect, useRef, useState } from "react";

export const AsciiDonut = () => {
	const preRef = useRef<HTMLPreElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [isVisible, setIsVisible] = useState(false);

	// Intersection Observer to pause animation when off-screen
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

		let A = 0;
		let B = 0;
		let animationFrameId: number;

		const render = () => {
			const b: string[] = [];
			const z: number[] = [];

			// Responsive resolution
			const isMobile = window.innerWidth < 768;
			const width = isMobile ? 50 : 100;
			const height = isMobile ? 24 : 45;

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
					const scaleX = isMobile ? 20 : 40;
					const scaleY = isMobile ? 10 : 20;

					const x = Math.floor(width / 2 + scaleX * D * (l * h * m - t * n));
					const y = Math.floor(height / 2 + scaleY * D * (l * h * n + t * m));
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
	}, [isVisible]);

	return (
		<div
			ref={containerRef}
			className="relative flex items-center justify-center w-full h-full overflow-hidden bg-transparent"
			aria-hidden="true"
		>
			{/* Technical Crosshairs (HUD-Integrated) */}
			<div className="absolute inset-0 pointer-events-none opacity-[0.15]">
				<div className="absolute top-1/2 left-0 w-full h-[1px] bg-neutral-600" />
				<div className="absolute top-0 left-1/2 w-[1px] h-full bg-neutral-600" />
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-neutral-700 rounded-full opacity-20" />
			</div>

			{/* HUD Metadata Callouts (Ethereal Style) */}
			<div className="absolute top-12 left-12 flex flex-col gap-1.5 pointer-events-none">
				<div className="flex items-center gap-2">
					<div className="w-1.5 h-1.5 bg-[#FF4D00] animate-pulse" />
					<span className="font-mono text-[8px] text-neutral-400 tracking-[0.3em] uppercase">
						LINK_ESTABLISHED
					</span>
				</div>
				<span className="font-mono text-[8px] text-neutral-600 tracking-[0.2em]">
					FPS: 60.00 // TRACE_0x9
				</span>
			</div>

			<div className="absolute bottom-12 right-12 flex flex-col gap-1 items-end pointer-events-none">
				<span className="font-mono text-[8px] text-neutral-600 tracking-[0.2em] uppercase">
					MESH_BUFFER_READY
				</span>
				<div className="flex gap-1 h-1.5 mt-1">
					{[...Array(6)].map((_, i) => (
						<div key={i} className="w-2 h-[1px] bg-neutral-800" />
					))}
				</div>
			</div>

			<pre
				ref={preRef}
				className="font-mono text-[8px] sm:text-[10px] md:text-xs leading-[1.0] text-neutral-900 dark:text-neutral-200 whitespace-pre select-none relative z-10"
				style={{
					fontFamily: '"Courier New", Courier, monospace',
					letterSpacing: "0px",
					textShadow: "0 0 20px rgba(255,255,255,0.02)",
				}}
			/>
			<span className="sr-only">
				ASCII art animation of a rotating 3D donut (torus).
			</span>
		</div>
	);
};
