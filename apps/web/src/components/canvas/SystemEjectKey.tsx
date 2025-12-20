"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { cn } from "@/lib/utils";

export function SystemEjectKey() {
	const router = useRouter();

	useEffect(() => {
		router.prefetch("/dashboard");
	}, [router]);

	const playClickSound = () => {
		const AudioContext =
			window.AudioContext || (window as any).webkitAudioContext;
		if (!AudioContext) return;

		const ctx = new AudioContext();
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();

		osc.connect(gain);
		gain.connect(ctx.destination);

		osc.type = "square";
		osc.frequency.setValueAtTime(150, ctx.currentTime);
		osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);

		gain.gain.setValueAtTime(0.1, ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

		osc.start(ctx.currentTime);
		osc.stop(ctx.currentTime + 0.1);
	};

	return (
		<Link
			href="/dashboard"
			onClick={playClickSound}
			className="absolute top-6 left-6 z-50 group"
		>
			<motion.div
				whileHover={{ scale: 1.02 }}
				whileTap={{ scale: 0.95 }}
				className={cn(
					"w-10 h-10 bg-[#f4f4f0] dark:bg-[#111111] border border-neutral-200 dark:border-neutral-800 rounded-sm shadow-sm flex items-center justify-center relative overflow-hidden",
					"hover:border-[#FF4D00] transition-colors duration-300",
				)}
			>
				{/* Recessed Indicator */}
				<div className="absolute top-1 right-1 w-1 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full group-hover:bg-[#FF4D00] transition-colors" />

				<SwissIcons.Grid
					size={18}
					className="text-neutral-500 group-hover:text-[#FF4D00] transition-colors"
				/>
			</motion.div>

			{/* Label Tooltip */}
			<div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
				<span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 bg-[#f4f4f0] dark:bg-[#111111] px-2 py-1 rounded-sm border border-neutral-200 dark:border-neutral-800 shadow-sm whitespace-nowrap">
					Eject System
				</span>
			</div>
		</Link>
	);
}
