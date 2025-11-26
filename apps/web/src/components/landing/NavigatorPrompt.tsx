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
	const [loadedItems, setLoadedItems] = useState<number>(0);
	const [isComplete, setIsComplete] = useState(false);
	const [isModeActive, setIsModeActive] = useState(false);
	const [isPromptActive, setIsPromptActive] = useState(false);
	const hasStartedRef = useRef(false);
	const timeoutIdsRef = useRef<number[]>([]);

	const BOOT_ITEMS = [
		"INFINITE_CANVAS.SYS",
		"BATCH_STUDIO.SYS",
		"AI_AGENTS.SYS",
	];

	const [isTriggered, setIsTriggered] = useState(false);

	const clearQueuedTimeouts = () => {
		timeoutIdsRef.current.forEach((id) => clearTimeout(id));
		timeoutIdsRef.current = [];
	};

	const queueTimeout = (cb: () => void, delay: number) => {
		const id = window.setTimeout(cb, delay);
		timeoutIdsRef.current.push(id);
	};

	const handleSelectMode = () => {
		playConfirmSound();
		setIsTriggered(true);
		window.dispatchEvent(new CustomEvent("unlockModes"));

		setTimeout(() => {
			const gridSection = document.querySelector("main");
			if (gridSection) {
				gridSection.scrollIntoView({ behavior: "smooth", block: "start" });
			}
		}, 300);
	};

	// Boot sequence logic
	useLayoutEffect(() => {
		if (hasStartedRef.current) return;

		const startBootSequence = () => {
			if (hasStartedRef.current) return;
			hasStartedRef.current = true;

			// Sequence each item with delays
			BOOT_ITEMS.forEach((_, index) => {
				setTimeout(
					() => {
						setLoadedItems(index + 1);
						playConfirmSound(); // Beep for each item
					},
					(index + 1) * 1200,
				); // 1.2s per item = 3.6s total
			});

			const totalBootDuration = BOOT_ITEMS.length * 1200 + 800;

			queueTimeout(() => {
				setIsComplete(true);
				setIsModeActive(true);
			}, totalBootDuration);

			queueTimeout(() => {
				setIsPromptActive(true);
			}, totalBootDuration + 500);
		};

		const ctx = gsap.context(() => {
			// Fade in boot screen when entering viewport
			gsap.fromTo(
				initRef.current,
				{ opacity: 0 },
				{
					opacity: 1,
					duration: 0.5,
					scrollTrigger: {
						trigger: containerRef.current,
						start: "top 75%",
						onEnter: startBootSequence, // Trigger boot on viewport entry
						once: true,
					},
				},
			);

			// Fade out boot screen when complete
			gsap.to(initRef.current, {
				opacity: 0,
				duration: 0.5,
				delay: BOOT_ITEMS.length * 1.2 + 0.8,
				scrollTrigger: {
					trigger: containerRef.current,
					start: "top 75%",
					once: true,
				},
			});
		}, containerRef);

		return () => {
			ctx.revert();
			clearQueuedTimeouts();
		};
	}, []);

	return (
		<div
			ref={containerRef}
			className={`relative z-10 min-h-[60vh] flex items-center justify-center overflow-hidden bg-black transition-all duration-1000 ${isTriggered ? "min-h-0 h-0 opacity-0 pointer-events-none overflow-hidden" : "opacity-100"}`}
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
				<div className="font-mono text-xs md:text-sm uppercase tracking-widest text-[#FF4D00] mb-6">
					SCANNING AVAILABLE MODES...
				</div>
				<div className="flex flex-col gap-2 font-mono text-xs md:text-sm">
					{BOOT_ITEMS.map((item, index) => (
						<motion.div
							key={item}
							initial={{ opacity: 0, x: -10 }}
							animate={{
								opacity: loadedItems > index ? 1 : 0.3,
								x: loadedItems > index ? 0 : -10,
							}}
							transition={{ duration: 0.3 }}
							className="flex items-center gap-2"
						>
							<span className="text-neutral-500">&gt;</span>
							<span className="text-neutral-400 flex-1">{item}</span>
							<span className="text-neutral-600">
								{"...........".substring(0, Math.max(1, 20 - item.length))}
							</span>
							{loadedItems > index ? (
								<span className="text-green-500 font-bold">OK</span>
							) : (
								<span className="text-neutral-700">--</span>
							)}
						</motion.div>
					))}
				</div>
				{isComplete && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.3 }}
						className="mt-6 font-mono text-xs text-neutral-500 uppercase tracking-widest"
					>
						&gt; AWAITING_USER_SELECTION
					</motion.div>
				)}
			</div>

			<div
				className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ${isModeActive ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
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
				className={`absolute bottom-12 left-1/2 -translate-x-1/2 transition-opacity duration-700 ${isPromptActive ? "opacity-60" : "opacity-0"}`}
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
