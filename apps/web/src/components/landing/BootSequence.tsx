"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

export const BootSequence = ({ onComplete }: { onComplete: () => void }) => {
	const [isComplete, setIsComplete] = useState(false);
	const [shouldRender, setShouldRender] = useState(true);
	const [currentChapter, setCurrentChapter] = useState(0);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	// Narrative Script
	const CHAPTERS = [
		{ id: 0, text: "IN THE BEGINNING, NOISE.", duration: 2500 },
		{ id: 1, text: "THEN, CONNECTION.", duration: 2500 },
		{ id: 2, text: "NOW, FOCUS.", duration: 2000 },
		{ id: 3, text: "", duration: 1500 }, // Explosion / Release
	];

	useEffect(() => {
		// Session Check
		const hasBooted = sessionStorage.getItem("studio-booted");
		if (hasBooted) {
			setTimeout(() => {
				setIsComplete(true);
				setShouldRender(false);
				onComplete();
			}, 0);
			return;
		}

		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// --------------------------------------------------------
		// 1. ENGINE SETUP
		// --------------------------------------------------------
		let width = window.innerWidth;
		let height = window.innerHeight;
		canvas.width = width;
		canvas.height = height;
		const center = { x: width / 2, y: height / 2 };

		const PARTICLE_COUNT = 800; // Reduced for performance with connections
		const particles: Particle[] = [];
		let phase = 0; // 0=Entropy, 1=Synergy, 2=Singularity, 3=Genesis
		let frameId: number;

		// --------------------------------------------------------
		// 2. PARTICLE SYSTEM (3D Simulation)
		// --------------------------------------------------------
		class Particle {
			x: number;
			y: number;
			z: number;
			baseX: number;
			baseY: number;
			baseZ: number;
			vx: number;
			vy: number;
			vz: number;
			size: number;

			constructor() {
				// Random spread in 3D space
				this.x = (Math.random() - 0.5) * width * 2;
				this.y = (Math.random() - 0.5) * height * 2;
				this.z = Math.random() * width; // Depth

				this.baseX = this.x;
				this.baseY = this.y;
				this.baseZ = this.z;

				this.vx = (Math.random() - 0.5) * 0.5;
				this.vy = (Math.random() - 0.5) * 0.5;
				this.vz = (Math.random() - 0.5) * 0.5;

				this.size = Math.random() * 2;
			}

			update() {
				// Phase 0: ENTROPY - Drift
				if (phase === 0) {
					this.x += this.vx;
					this.y += this.vy;
					this.z += this.vz;
					// Wrap around for infinite starfield feel
					if (this.z < 0) this.z = width;
					if (this.z > width) this.z = 0;
				}
				// Phase 1: SYNERGY - Organize / Orbit
				else if (phase === 1) {
					// Gentle pull to center but maintain orbit
					this.x += (0 - this.x) * 0.02;
					this.y += (0 - this.y) * 0.02;
					this.z += (width / 2 - this.z) * 0.01;
				}
				// Phase 2: SINGULARITY - Collapse
				else if (phase === 2) {
					// Aggressive suck to center
					this.x += (0 - this.x) * 0.15;
					this.y += (0 - this.y) * 0.15;
					this.z += (0 - this.z) * 0.15;
				}
				// Phase 3: GENESIS - Explode
				else if (phase === 3) {
					const angle = Math.atan2(this.y, this.x);
					const force = 40 + Math.random() * 50;
					this.x += Math.cos(angle) * force;
					this.y += Math.sin(angle) * force;
					this.z += 10; // Fly towards camera
				}
			}

			draw(ctx: CanvasRenderingContext2D) {
				// 3D Projection Math
				// FOV formula: scale = fov / (fov + z)
				const fov = 300;
				const scale = fov / (fov + this.z);

				// Projected 2D coords
				const px = this.x * scale + center.x;
				const py = this.y * scale + center.y;

				// Skip if behind camera or out of bounds
				if (scale < 0 || px < 0 || px > width || py < 0 || py > height) return;

				// Dynamic Appearance
				const alpha = phase === 3 ? 1 : Math.max(0, 1 - this.z / width);
				const size = this.size * scale;

				ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
				ctx.beginPath();
				ctx.arc(px, py, size, 0, Math.PI * 2);
				ctx.fill();

				// Store projected coords for line drawing
				return { x: px, y: py, scale };
			}
		}

		// Init
		for (let i = 0; i < PARTICLE_COUNT; i++) {
			particles.push(new Particle());
		}

		// --------------------------------------------------------
		// 3. RENDER LOOP
		// --------------------------------------------------------
		const animate = () => {
			// Clear with Fade effect for trails
			ctx.fillStyle =
				phase === 3 ? "rgba(10, 10, 10, 0.1)" : "rgba(10, 10, 10, 0.4)";
			ctx.fillRect(0, 0, width, height);

			const projectedPoints: { x: number; y: number; index: number }[] = [];

			particles.forEach((p, i) => {
				p.update();
				const proj = p.draw(ctx);
				if (proj && phase === 1) {
					// Only collect points in Synergy phase
					projectedPoints.push({ x: proj.x, y: proj.y, index: i });
				}
			});

			// Draw Neural Connections (only in Synergy phase)
			if (phase === 1) {
				ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
				ctx.lineWidth = 0.5;

				// Optimization: Check proximity for a subset to save FPS
				// Just connecting random neighbors for the effect
				for (let i = 0; i < projectedPoints.length; i += 2) {
					const p1 = projectedPoints[i];
					// Check next few particles
					for (let j = 1; j < 4; j++) {
						if (i + j < projectedPoints.length) {
							const p2 = projectedPoints[i + j];
							const dx = p1.x - p2.x;
							const dy = p1.y - p2.y;
							const dist = Math.sqrt(dx * dx + dy * dy);

							if (dist < 100) {
								ctx.beginPath();
								ctx.moveTo(p1.x, p1.y);
								ctx.lineTo(p2.x, p2.y);
								ctx.stroke();
							}
						}
					}
				}
			}

			frameId = requestAnimationFrame(animate);
		};

		animate();

		// --------------------------------------------------------
		// 4. TIMELINE SEQUENCER
		// --------------------------------------------------------
		const runTimeline = async () => {
			// Chapter 0: Entropy
			phase = 0;
			setCurrentChapter(0);
			await new Promise((r) => setTimeout(r, CHAPTERS[0].duration));

			// Chapter 1: Synergy
			phase = 1;
			setCurrentChapter(1);
			await new Promise((r) => setTimeout(r, CHAPTERS[1].duration));

			// Chapter 2: Singularity
			phase = 2;
			setCurrentChapter(2);
			await new Promise((r) => setTimeout(r, CHAPTERS[2].duration));

			// Chapter 3: Genesis
			phase = 3;
			setCurrentChapter(3);
			// Boom!

			// Reveal App
			setTimeout(() => {
				setIsComplete(true);
				onComplete();
				sessionStorage.setItem("studio-booted", "true");

				// Cleanup
				setTimeout(() => setShouldRender(false), 1000);
			}, 600); // 600ms into explosion
		};

		runTimeline();

		// Resize
		const handleResize = () => {
			width = window.innerWidth;
			height = window.innerHeight;
			center.x = width / 2;
			center.y = height / 2;
			canvas.width = width;
			canvas.height = height;
		};
		window.addEventListener("resize", handleResize);

		return () => {
			cancelAnimationFrame(frameId);
			window.removeEventListener("resize", handleResize);
		};
	}, [onComplete]);

	if (!shouldRender) return null;

	return (
		<AnimatePresence>
			{!isComplete && (
				<motion.div
					initial={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 1, ease: "easeOut" }}
					className="fixed inset-0 z-[100] bg-[#0a0a0a] flex items-center justify-center pointer-events-none"
				>
					<canvas
						ref={canvasRef}
						className="absolute inset-0 block w-full h-full"
					/>

					{/* CINEMATIC TYPOGRAPHY LAYER */}
					<div className="relative z-10 flex flex-col items-center justify-center mix-blend-difference">
						<AnimatePresence mode="wait">
							{currentChapter < 3 && (
								<motion.div
									key={currentChapter}
									initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
									animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
									exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
									transition={{ duration: 0.8, ease: "easeInOut" }}
									className="text-center"
								>
									<h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white">
										{CHAPTERS[currentChapter].text}
									</h2>
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					{/* PROGRESS BAR (Subtle) */}
					<div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full">
						<motion.div
							initial={{ width: "0%" }}
							animate={{ width: "100%" }}
							transition={{ duration: 7.0, ease: "linear" }} // Total duration
							className="h-full bg-[#ea580c]"
						/>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};
