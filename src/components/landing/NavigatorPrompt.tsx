"use client";

import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, { useLayoutEffect, useRef, useState } from "react";

gsap.registerPlugin(ScrollTrigger);

// Web Audio API: Tactical confirmation beep
const playConfirmSound = () => {
	const audioContext = new (
		window.AudioContext || (window as any).webkitAudioContext
	)();
	const oscillator = audioContext.createOscillator();
	const gainNode = audioContext.createGain();

	oscillator.connect(gainNode);
	gainNode.connect(audioContext.destination);

	oscillator.type = "sine";
	oscillator.frequency.setValueAtTime(800, audioContext.currentTime);

	gainNode.gain.setValueAtTime(0, audioContext.currentTime);
	gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
	gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.15);

	oscillator.start(audioContext.currentTime);
	oscillator.stop(audioContext.currentTime + 0.15);
};

export const NavigatorPrompt = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const initRef = useRef<HTMLDivElement>(null);
	const modeRef = useRef<HTMLDivElement>(null);
	const promptRef = useRef<HTMLDivElement>(null);
	const [progress, setProgress] = useState(0);

	const handleSelectMode = () => {
		playConfirmSound();
		window.dispatchEvent(new CustomEvent("unlockModes"));

		setTimeout(() => {
			const gridSection = document.querySelector("main");
			if (gridSection) {
				gridSection.scrollIntoView({ behavior: "smooth", block: "start" });
			}
		}, 300);
	};

	useLayoutEffect(() => {
		const ctx = gsap.context(() => {
			gsap.fromTo(
				initRef.current,
				{ opacity: 0 },
				{
					opacity: 1,
					scrollTrigger: {
						trigger: containerRef.current,
						start: "top 75%",
						end: "top 60%",
						scrub: 1,
					},
				},
			);

			gsap.to(
				{},
				{
					scrollTrigger: {
						trigger: containerRef.current,
						start: "top 75%",
						end: "top 50%",
						scrub: 1,
						onUpdate: (self) => setProgress(Math.floor(self.progress * 100)),
					},
				},
			);

			gsap.to(initRef.current, {
				opacity: 0,
				scrollTrigger: {
					trigger: containerRef.current,
					start: "top 50%",
					end: "top 45%",
					scrub: 1,
				},
			});

			gsap.fromTo(
				modeRef.current,
				{ opacity: 0, x: -5 },
				{
					opacity: 1,
					x: 0,
					scrollTrigger: {
						trigger: containerRef.current,
						start: "top 45%",
						end: "top 40%",
						scrub: 1,
					},
				},
			);

			gsap.fromTo(
				promptRef.current,
				{ opacity: 0, y: 10 },
				{
					opacity: 0.6,
					y: 0,
					scrollTrigger: {
						trigger: containerRef.current,
						start: "top 40%",
						end: "top 35%",
						scrub: 1,
					},
				},
			);

			gsap.to([modeRef.current, promptRef.current], {
				opacity: 0,
				filter: "blur(10px)",
				scrollTrigger: {
					trigger: containerRef.current,
					start: "bottom 30%",
					end: "bottom 20%",
					scrub: 1,
				},
			});
		}, containerRef);

		return () => ctx.revert();
	}, []);

	return (
		<div
			ref={containerRef}
			className="relative z-10 min-h-[60vh] flex items-center justify-center overflow-hidden bg-black"
		>
			<div className="absolute inset-0 pointer-events-none opacity-10">
				<motion.div
					className="absolute inset-x-0 h-1 bg-[#FF4D00]"
					animate={{ y: ["0%", "100%"] }}
					transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
				/>
			</div>

			<div
				ref={initRef}
				className="absolute inset-0 flex flex-col items-center justify-center opacity-0"
			>
				<div className="font-mono text-xs md:text-sm uppercase tracking-widest text-[#FF4D00] mb-4">
					INITIALIZING...
				</div>
				<div className="w-64 h-1 bg-neutral-800 border border-neutral-700">
					<motion.div
						className="h-full bg-[#FF4D00]"
						style={{ width: `${progress}%` }}
					/>
				</div>
				<div className="font-mono text-xs text-neutral-600 mt-2">
					{progress}%
				</div>
			</div>

			<div
				ref={modeRef}
				className="absolute inset-0 flex flex-col items-center justify-center opacity-0"
			>
				<div className="relative">
					<div className="absolute -top-4 -left-4 text-[#FF4D00] text-2xl font-mono">
						┌
					</div>
					<div className="absolute -top-4 -right-4 text-[#FF4D00] text-2xl font-mono">
						┐
					</div>
					<div className="absolute -bottom-4 -left-4 text-[#FF4D00] text-2xl font-mono">
						└
					</div>
					<div className="absolute -bottom-4 -right-4 text-[#FF4D00] text-2xl font-mono">
						┘
					</div>

					<motion.button
						onClick={handleSelectMode}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className="font-mono text-lg md:text-2xl uppercase tracking-widest text-white px-8 py-4 cursor-pointer hover:text-[#FF4D00] transition-colors duration-300 border-2 border-transparent hover:border-[#FF4D00] bg-transparent"
					>
						SELECT MODE
					</motion.button>
				</div>
			</div>

			<div
				ref={promptRef}
				className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-0"
			>
				<motion.div
					className="font-mono text-xs uppercase tracking-widest text-neutral-500"
					animate={{ y: [0, 5, 0] }}
					transition={{ duration: 2, repeat: Infinity }}
				>
					[CLICK TO PROCEED]
				</motion.div>
			</div>
		</div>
	);
};
