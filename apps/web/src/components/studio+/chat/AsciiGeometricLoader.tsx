"use client";

import React, { useEffect, useRef } from "react";

export const AsciiGeometricLoader = () => {
	const preRef = useRef<HTMLPreElement>(null);

	useEffect(() => {
		let t = 0;
		let animationFrameId: number;

		// Settings for a compact, dense display suitable for a chat panel
		const width = 40;
		const height = 20;
		const scale = 10;
		const speed = 0.02;

		const render = () => {
			const buffer: string[] = new Array(width * height).fill(" ");
			const zBuffer: number[] = new Array(width * height).fill(-100);

			// Icosahedron vertices (12 vertices)
			// Golden ratio phi
			const phi = (1 + Math.sqrt(5)) / 2;

			const vertices = [
				[-1, phi, 0],
				[1, phi, 0],
				[-1, -phi, 0],
				[1, -phi, 0],
				[0, -1, phi],
				[0, 1, phi],
				[0, -1, -phi],
				[0, 1, -phi],
				[phi, 0, -1],
				[phi, 0, 1],
				[-phi, 0, -1],
				[-phi, 0, 1],
			];

			// Edges (30 edges) - simplified connection logic for visual clarity
			// We'll draw lines between vertices that are close enough
			const edges: number[][] = [];
			for (let i = 0; i < vertices.length; i++) {
				for (let j = i + 1; j < vertices.length; j++) {
					// Distance check for edges (length is 2 in standard icosahedron)
					const dx = vertices[i][0] - vertices[j][0];
					const dy = vertices[i][1] - vertices[j][1];
					const dz = vertices[i][2] - vertices[j][2];
					const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
					if (Math.abs(dist - 2) < 0.1) {
						edges.push([i, j]);
					}
				}
			}

			// Rotation Loop
			const projectedVertices = vertices.map((v) => {
				// Rotate Y
				const rotY = t;
				let x = v[0] * Math.cos(rotY) - v[2] * Math.sin(rotY);
				let z = v[0] * Math.sin(rotY) + v[2] * Math.cos(rotY);
				let y = v[1];

				// Rotate X
				const rotX = t * 0.5;
				let y2 = y * Math.cos(rotX) - z * Math.sin(rotX);
				let z2 = y * Math.sin(rotX) + z * Math.cos(rotX);

				// Rotate Z (subtle)
				const rotZ = t * 0.3;
				let x3 = x * Math.cos(rotZ) - y2 * Math.sin(rotZ);
				let y3 = x * Math.sin(rotZ) + y2 * Math.cos(rotZ);

				return [x3, y3, z2 + 4]; // Push back for camera
			});

			// Draw lines
			edges.forEach(([i, j]) => {
				const v1 = projectedVertices[i];
				const v2 = projectedVertices[j];

				// Projection
				const fov = width;
				const x1 = Math.floor(width / 2 + (v1[0] * scale) / (v1[2] * 0.25));
				const y1 = Math.floor(
					height / 2 + (v1[1] * (scale * 0.5)) / (v1[2] * 0.25),
				);
				const x2 = Math.floor(width / 2 + (v2[0] * scale) / (v2[2] * 0.25));
				const y2 = Math.floor(
					height / 2 + (v2[1] * (scale * 0.5)) / (v2[2] * 0.25),
				);

				// Bresenham Line Algorithm
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
						const z = (v1[2] + v2[2]) / 2;

						if (z > zBuffer[idx]) {
							zBuffer[idx] = z;
							// Visual style: vertex vs edge
							if (
								(Math.abs(x - x1) < 1 && Math.abs(y - y1) < 1) ||
								(Math.abs(x - x2) < 1 && Math.abs(y - y2) < 1)
							) {
								buffer[idx] = "+"; // Vertex
							} else {
								buffer[idx] = "."; // Edge
							}
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
	}, []);

	return (
		<div className="flex items-center justify-center w-full overflow-hidden select-none pointer-events-none">
			<pre
				ref={preRef}
				className="font-mono text-[8px] leading-[8px] whitespace-pre font-extrabold text-foreground/80"
			/>
		</div>
	);
};
