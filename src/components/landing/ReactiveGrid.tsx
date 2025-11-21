"use client";

import React, { useEffect, useRef } from "react";

export const ReactiveGrid = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let width = window.innerWidth;
		let height = window.innerHeight;
		let animationFrameId: number;
		let mouseX = 0;
		let mouseY = 0;

		// Grid Config
		const GRID_SIZE = 40;
		const DOT_COLOR_LIGHT = "rgba(0, 0, 0, 0.2)";
		const DOT_COLOR_DARK = "rgba(255, 255, 255, 0.2)";
		const ACTIVE_COLOR = "#FF4D00"; // Safety Orange
		const RADIUS = 200; // Interaction radius

		const handleResize = () => {
			width = window.innerWidth;
			height = window.innerHeight;
			canvas.width = width;
			canvas.height = height;
		};

		const handleMouseMove = (e: MouseEvent) => {
			mouseX = e.clientX;
			mouseY = e.clientY;
		};

		window.addEventListener("resize", handleResize);
		window.addEventListener("mousemove", handleMouseMove);
		handleResize();

		const draw = () => {
			ctx.clearRect(0, 0, width, height);

			// Check theme
			const isDark = document.documentElement.classList.contains("dark");
			const baseColor = isDark ? DOT_COLOR_DARK : DOT_COLOR_LIGHT;

			// Draw Dots
			for (let x = 0; x <= width; x += GRID_SIZE) {
				for (let y = 0; y <= height; y += GRID_SIZE) {
					// Calculate distance from mouse
					const dist = Math.hypot(x - mouseX, y - mouseY);
					const proximity = Math.max(0, 1 - dist / RADIUS);

					// Base size
					let size = 1.5;

					ctx.beginPath();

					if (proximity > 0) {
						// Scale up based on proximity
						size = 1.5 + proximity * 3.0; // Max size ~4.5px
						ctx.fillStyle = ACTIVE_COLOR;
						// Add a slight glow
						ctx.shadowBlur = 10;
						ctx.shadowColor = ACTIVE_COLOR;
					} else {
						ctx.fillStyle = baseColor;
						ctx.shadowBlur = 0;
					}

					ctx.arc(x, y, size, 0, Math.PI * 2);
					ctx.fill();
				}
			}

			animationFrameId = requestAnimationFrame(draw);
		};

		draw();

		return () => {
			window.removeEventListener("resize", handleResize);
			window.removeEventListener("mousemove", handleMouseMove);
			cancelAnimationFrame(animationFrameId);
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			className="fixed inset-0 pointer-events-none z-0 opacity-50"
		/>
	);
};
