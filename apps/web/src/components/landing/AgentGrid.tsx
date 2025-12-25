"use client";

import React, { useEffect, useRef } from "react";

export const AgentGrid = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		const container = containerRef.current;
		if (!canvas || !container) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let animationId: number;
		let cols = 0;
		let rows = 0;
		const cellSize = 10; // Size of each agent cell
		const gridGap = 1;

		// Grid State
		// 0 = Dead, 1 = Alive (Dark), 2 = Active (Orange)
		let grid: number[] = [];

		const resize = () => {
			canvas.width = container.offsetWidth;
			canvas.height = container.offsetHeight;
			cols = Math.ceil(canvas.width / (cellSize + gridGap));
			rows = Math.ceil(canvas.height / (cellSize + gridGap));

			// Initialize Grid with noise
			grid = new Array(cols * rows)
				.fill(0)
				.map(() => (Math.random() > 0.85 ? 1 : 0));
		};

		const draw = () => {
			// Clear background (Transparent to let parent bg show, or dark)
			ctx.fillStyle = "#000000"; // Pitch black backing
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			for (let i = 0; i < grid.length; i++) {
				const x = (i % cols) * (cellSize + gridGap);
				const y = Math.floor(i / cols) * (cellSize + gridGap);

				const state = grid[i];

				if (state === 1) {
					// Dormant Agent (Dark Grey)
					ctx.fillStyle = "#1a1a1a";
					ctx.fillRect(x, y, cellSize, cellSize);
				} else if (state === 2) {
					// Active Agent (Braun Orange)
					ctx.fillStyle = "#FF4D00";
					ctx.fillRect(x, y, cellSize, cellSize);
				} else {
					// Empty (faint grid trace)
					ctx.fillStyle = "#050505";
					ctx.fillRect(x, y, cellSize, cellSize);
				}
			}
		};

		const update = () => {
			// Simple Cellular Automaton Logic (Modified Game of Life)
			const nextGrid = [...grid];

			for (let i = 0; i < grid.length; i++) {
				const col = i % cols;
				const row = Math.floor(i / cols);

				// Count neighbors
				let neighbors = 0;
				for (let dy = -1; dy <= 1; dy++) {
					for (let dx = -1; dx <= 1; dx++) {
						if (dx === 0 && dy === 0) continue;
						const nx = col + dx;
						const ny = row + dy;
						if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
							if (grid[ny * cols + nx] > 0) neighbors++;
						}
					}
				}

				const state = grid[i];

				// Rules
				if (state > 0) {
					// Survival
					if (neighbors < 2 || neighbors > 3)
						nextGrid[i] = 0; // Die
					else {
						// Randomly become "Active" (Orange) if stable
						if (Math.random() > 0.99) nextGrid[i] = 2;
						else if (state === 2) nextGrid[i] = 1; // Decay active to dormant
					}
				} else {
					// Reproduction
					if (neighbors === 3) nextGrid[i] = 1;
				}
			}

			grid = nextGrid;
			draw();

			// Slow down the simulation frame rate for "Industrial" feel
			// We handle this by using setTimeout in the loop or skipping frames.
			// But for smooth UI, we'll just run it.
			// To make it look "tech", fast is actually good.
			animationId = requestAnimationFrame(update);
		};

		window.addEventListener("resize", resize);
		resize();
		update();

		return () => {
			window.removeEventListener("resize", resize);
			cancelAnimationFrame(animationId);
		};
	}, []);

	return (
		<div
			ref={containerRef}
			className="w-full h-full bg-neutral-950 relative overflow-hidden border-l border-neutral-800"
		>
			{/* HUD Overlay */}
			<div className="absolute top-6 right-6 z-10 flex flex-col items-end gap-1 pointer-events-none mix-blend-difference">
				<span className="font-mono text-[9px] text-[#FF4D00] tracking-[0.3em] uppercase">
					AGENT_GRID_ACTIVE
				</span>
				<span className="font-mono text-[8px] text-neutral-500 uppercase tracking-widest">
					SIMULATION_TICK_128
				</span>
			</div>

			<canvas ref={canvasRef} className="w-full h-full opacity-60" />

			{/* Vignette */}
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] pointer-events-none" />
		</div>
	);
};
