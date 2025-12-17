"use client";

import React, { useEffect, useRef, useState } from "react";

export const AsciiPyramid = () => {
	const preRef = useRef<HTMLPreElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [isVisible, setIsVisible] = useState(false);

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
			const isMobile = window.innerWidth < 768;
			const width = isMobile ? 50 : 100;
			const height = isMobile ? 24 : 45;

			const buffer: string[] = new Array(width * height).fill(" ");
			const zBuffer: number[] = new Array(width * height).fill(0);

			const size = 20; // Adjusted size

			// Dense chars for solid look
			const chars = ".,-~:;=!*#$@";

			// Tetrahedron vertices
			// Centered at origin
			const v0 = [0, -size, 0]; // Top
			const v1 = [size, size, size]; // Base 1
			const v2 = [-size, size, size]; // Base 2
			const v3 = [0, size, -size]; // Base 3 (Back)

			// Faces (triangles) defined by 3 vertices
			const faces = [
				[v0, v1, v2],
				[v0, v2, v3],
				[v0, v3, v1],
				[v1, v3, v2], // Base
			];

			const rotate = (x: number, y: number, z: number) => {
				// Rotate X
				let y1 = y * Math.cos(A) - z * Math.sin(A);
				let z1 = y * Math.sin(A) + z * Math.cos(A);
				let x1 = x;

				// Rotate Y
				let x2 = x1 * Math.cos(B) - z1 * Math.sin(B);
				let z2 = x1 * Math.sin(B) + z1 * Math.cos(B);
				let y2 = y1;

				return [x2, y2, z2];
			};

			faces.forEach((face) => {
				const [p1, p2, p3] = face;

				// Calculate normal for lighting (before rotation)
				// Vector U = p2 - p1
				const ux = p2[0] - p1[0];
				const uy = p2[1] - p1[1];
				const uz = p2[2] - p1[2];

				// Vector V = p3 - p1
				const vx = p3[0] - p1[0];
				const vy = p3[1] - p1[1];
				const vz = p3[2] - p1[2];

				// Normal = U x V
				let nx = uy * vz - uz * vy;
				let ny = uz * vx - ux * vz;
				let nz = ux * vy - uy * vx;

				// Normalize
				const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
				nx /= len;
				ny /= len;
				nz /= len;

				// Rotate normal
				const [rnx, rny, rnz] = rotate(nx, ny, nz);

				// Lighting
				const lightX = 0;
				const lightY = 1;
				const lightZ = -1;
				let luminance = rnx * lightX + rny * lightY + rnz * lightZ;
				if (luminance < 0) luminance = 0;
				const charIdx = Math.floor(luminance * 8);
				const char = chars[Math.min(charIdx, chars.length - 1)];

				// Sample points on the triangle
				// Increased density for better resolution
				const density = 0.015;

				for (let u = 0; u <= 1; u += density) {
					for (let v = 0; v <= 1 - u; v += density) {
						const w = 1 - u - v;

						const x = u * p1[0] + v * p2[0] + w * p3[0];
						const y = u * p1[1] + v * p2[1] + w * p3[1];
						const z = u * p1[2] + v * p2[2] + w * p3[2];

						const [rx, ry, rz] = rotate(x, y, z);

						const dist = rz + 100;
						const ooz = 1 / dist;

						const xp = Math.floor(width / 2 + rx * ooz * 60 * 2);
						const yp = Math.floor(height / 2 + ry * ooz * 60);

						const idx = xp + yp * width;

						if (idx >= 0 && idx < width * height) {
							if (ooz > zBuffer[idx]) {
								zBuffer[idx] = ooz;
								buffer[idx] = char;
							}
						}
					}
				}
			});

			if (preRef.current) {
				let output = "";
				for (let i = 0; i < height; i++) {
					output += buffer.slice(i * width, (i + 1) * width).join("") + "\n";
				}
				preRef.current.innerText = output;
			}

			A += 0.02;
			B += 0.02;
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
				className="font-mono text-[8px] sm:text-[10px] md:text-xs leading-[1.0] text-neutral-900 dark:text-white whitespace-pre select-none"
				style={{
					fontFamily: '"Courier New", Courier, monospace',
					letterSpacing: "0px",
				}}
			/>
			<span className="sr-only">
				ASCII art animation of a rotating solid pyramid.
			</span>
		</div>
	);
};
