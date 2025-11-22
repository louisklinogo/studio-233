"use client";

import React, { useEffect, useRef, useState } from "react";

export const AsciiHypercube = () => {
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

		const isMobile = window.innerWidth < 768;
		const width = isMobile ? 50 : 100;
		const height = isMobile ? 25 : 50;
		const scale = isMobile ? 18 : 35;
		const speed = 0.02;

		// 4D rotation matrices
		const rotateZW = (theta: number, p: number[]) => {
			const [x, y, z, w] = p;
			return [
				x,
				y,
				z * Math.cos(theta) - w * Math.sin(theta),
				z * Math.sin(theta) + w * Math.cos(theta),
			];
		};

		const rotateXW = (theta: number, p: number[]) => {
			const [x, y, z, w] = p;
			return [
				x * Math.cos(theta) - w * Math.sin(theta),
				y,
				z,
				x * Math.sin(theta) + w * Math.cos(theta),
			];
		};

		const rotateYW = (theta: number, p: number[]) => {
			const [x, y, z, w] = p;
			return [
				x,
				y * Math.cos(theta) - w * Math.sin(theta),
				z,
				y * Math.sin(theta) + w * Math.cos(theta),
			];
		};

		const render = () => {
			const buffer: string[] = new Array(width * height).fill(" ");
			const zBuffer: number[] = new Array(width * height).fill(-100);

			// Hypercube vertices (16 points)
			const vertices = [];
			for (let i = 0; i < 16; i++) {
				vertices.push([
					i & 1 ? 1 : -1,
					i & 2 ? 1 : -1,
					i & 4 ? 1 : -1,
					i & 8 ? 1 : -1,
				]);
			}

			// Edges (32 connections)
			const edges = [];
			for (let i = 0; i < 16; i++) {
				for (let j = i + 1; j < 16; j++) {
					// Check if vertices differ by exactly one coordinate (power of 2 difference)
					const diff = i ^ j;
					if ((diff & (diff - 1)) === 0) {
						edges.push([i, j]);
					}
				}
			}

			// Project and draw edges
			// Apply rotations in 4D
			const projectedVertices = vertices.map((v) => {
				let p = rotateXW(t, v);
				p = rotateYW(t * 0.5, p);
				p = rotateZW(t * 0.3, p);

				// 4D to 3D projection (perspective)
				const w = 1 / (3 - p[3]); // Perspective divide
				const p3 = [p[0] * w, p[1] * w, p[2] * w];

				// 3D rotation (standard cube spin)
				const rotX = t * 0.2;
				const rotY = t * 0.4;

				// Rotate Y
				let x = p3[0] * Math.cos(rotY) - p3[2] * Math.sin(rotY);
				let z = p3[0] * Math.sin(rotY) + p3[2] * Math.cos(rotY);
				let y = p3[1];

				// Rotate X
				let y2 = y * Math.cos(rotX) - z * Math.sin(rotX);
				z = y * Math.sin(rotX) + z * Math.cos(rotX);

				return [x, y2, z + 3]; // Push back for camera
			});

			// Draw lines
			edges.forEach(([i, j]) => {
				const v1 = projectedVertices[i];
				const v2 = projectedVertices[j];

				// Bresenham-like line drawing in buffer
				const x1 = Math.floor(width / 2 + v1[0] * scale);
				const y1 = Math.floor(height / 2 + v1[1] * (scale * 0.5)); // Aspect ratio fix
				const x2 = Math.floor(width / 2 + v2[0] * scale);
				const y2 = Math.floor(height / 2 + v2[1] * (scale * 0.5));

				// Interpolate line
				const dx = Math.abs(x2 - x1);
				const dy = Math.abs(y2 - y1);
				const sx = x1 < x2 ? 1 : -1;
				const sy = y1 < y2 ? 1 : -1;
				let err = dx - dy;

				let x = x1;
				let y = y1;

				while (true) {
					if (x >= 0 && x < width && y >= 0 && y < height) {
						const idx = y * width + x;
						// Simple z-buffering (avg z of edge)
						const z = (v1[2] + v2[2]) / 2;

						if (z > zBuffer[idx]) {
							zBuffer[idx] = z;
							// Character based on 4D depth (w-coordinate influence or simple aesthetic)
							// Use different chars for "inner" vs "outer" feel
							buffer[idx] = Math.random() > 0.9 ? "+" : ".";
							if (x === x1 || x === x2 || y === y1 || y === y2)
								buffer[idx] = "#"; // Vertex emphasis
						}
					}

					if (x === x2 && y === y2) break;
					const e2 = 2 * err;
					if (e2 > -dy) {
						err -= dy;
						x += sx;
					}
					if (e2 < dx) {
						err += dx;
						y += sy;
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
				ASCII art animation of a rotating 4D hypercube (tesseract).
			</span>
		</div>
	);
};
