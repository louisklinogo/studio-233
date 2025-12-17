"use client";

import React, { useEffect, useRef, useState } from "react";
import { createNoise3D } from "simplex-noise";

export const AsciiSingularity = () => {
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

		let t = 0;
		let animationFrameId: number;
		const noise3D = createNoise3D();

		const render = () => {
			// High density resolution
			const isMobile = window.innerWidth < 768;
			const width = isMobile ? 40 : 80;
			const height = isMobile ? 20 : 40;

			const buffer: string[] = new Array(width * height).fill(" ");

			// Dense character ramp for "heavy" feel
			// From darkest/densest to lightest
			const chars =
				"$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ";

			const radius = 0.8;

			// Aspect ratio correction for typical monospace fonts (approx 0.5 to 0.6 width/height)
			const charAspect = 0.5;
			const screenAspect = width / height;

			for (let y = 0; y < height; y++) {
				// Normalized coordinates (-1 to 1)
				const ny = (2 * y) / height - 1;

				for (let x = 0; x < width; x++) {
					// Correct aspect ratio so the sphere isn't squashed
					const nx = ((2 * x) / width - 1) * screenAspect * charAspect;

					// Ray intersection with sphere
					const distSq = nx * nx + ny * ny;

					if (distSq < radius * radius) {
						// Calculate z coordinate on sphere surface
						const z = Math.sqrt(radius * radius - distSq);

						// 3D Point on surface
						// Rotate the point over time
						const rotSpeed = 0.4;
						const pX = nx * Math.cos(t * rotSpeed) - z * Math.sin(t * rotSpeed);
						const pZ = nx * Math.sin(t * rotSpeed) + z * Math.cos(t * rotSpeed);
						const pY = ny;

						// Noise for "Boiling" surface
						// We sample noise at the surface point
						// Reduced amplitude to keep spherical shape
						const nVal = noise3D(pX * 2.5, pY * 2.5, pZ * 2.5 + t * 0.8);

						// Lighting
						// Light from top-right-front
						const lightDir = { x: 0.5, y: -0.5, z: 0.8 };
						// Normalize light dir
						const ldLen = Math.sqrt(
							lightDir.x ** 2 + lightDir.y ** 2 + lightDir.z ** 2,
						);
						const ld = {
							x: lightDir.x / ldLen,
							y: lightDir.y / ldLen,
							z: lightDir.z / ldLen,
						};

						// Normal is just the point itself (normalized)
						// Perturb normal with noise for texture
						const norm = { x: pX / radius, y: pY / radius, z: pZ / radius };

						// Dot product for diffuse lighting
						let intensity = norm.x * ld.x + norm.y * ld.y + norm.z * ld.z;

						// Mix lighting with noise
						// The noise makes it look like it's glowing/burning from inside
						intensity += nVal * 0.3;

						// Rim lighting (fresnel)
						// Dot product of view vector (0,0,1) and normal
						const viewDot = norm.z; // since view is (0,0,1)
						const rim = Math.pow(1 - Math.abs(viewDot), 3);
						intensity += rim * 0.5;

						// Pulse effect (heartbeat)
						const pulse = Math.sin(t * 3) * 0.1;
						intensity += pulse;

						// Map to char
						// Clamp intensity 0 to 1
						// Bias towards denser characters for "solid" look
						intensity = Math.max(0, Math.min(1, intensity * 0.8 + 0.2));

						const charIdx = Math.floor(intensity * (chars.length - 1));
						buffer[y * width + x] = chars[chars.length - 1 - charIdx];
					} else {
						buffer[y * width + x] = " ";
					}
				}
			}

			if (preRef.current) {
				let output = "";
				for (let i = 0; i < height; i++) {
					output += buffer.slice(i * width, (i + 1) * width).join("") + "\n";
				}
				preRef.current.innerText = output;
			}

			t += 0.03;
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
				className="font-mono text-[10px] sm:text-[12px] md:text-sm leading-[1.0] text-[#FF4D00] whitespace-pre select-none font-black"
				style={{
					fontFamily: '"Courier New", Courier, monospace',
					letterSpacing: "-1px", // Tighter tracking for density
					filter: "drop-shadow(0 0 10px rgba(255, 77, 0, 0.5))", // Glow
				}}
			/>
			<span className="sr-only">
				ASCII art animation of a boiling singularity.
			</span>
		</div>
	);
};
