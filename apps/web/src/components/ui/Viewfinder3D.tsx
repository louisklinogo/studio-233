"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "next-themes";
import React, { type CSSProperties, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Viewfinder3DProps {
	label?: string;
}

const BOOT_SEQUENCE = [
	"BIOS_CHECK_OK",
	"MOUNTING_VIRTUAL_DOM",
	"ALLOCATING_MEMORY_BLOCKS",
	"CALIBRATING_OPTICS",
	"CONNECTING_NEURAL_BUS",
	"HYDRATING_TEXTURES",
	"SYSTEM_READY",
];

const GridLine = ({
	className,
	delay = 0,
	vertical = false,
}: {
	className?: string;
	delay?: number;
	vertical?: boolean;
}) => (
	<motion.div
		initial={vertical ? { height: 0 } : { width: 0 }}
		animate={vertical ? { height: "100%" } : { width: "100%" }}
		transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay }}
		className={cn("absolute bg-neutral-800", className)}
	/>
);

const CornerBracket = ({
	position,
	className,
}: {
	position: "tl" | "tr" | "bl" | "br";
	className?: string;
}) => {
	const isTop = position.startsWith("t");
	const isLeft = position.endsWith("l");

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.8 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.5, delay: 0.5 }}
			className={cn(
				"absolute w-8 h-8",
				isTop ? "top-8 border-t" : "bottom-8 border-b",
				isLeft ? "left-8 border-l" : "right-8 border-r",
				"border-neutral-800",
				className,
			)}
		/>
	);
};

const ScrambleText = ({
	text,
	className,
	style,
}: {
	text: string;
	className?: string;
	style?: CSSProperties;
}) => {
	const [display, setDisplay] = useState(text);
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_@#&";

	useEffect(() => {
		let iteration = 0;
		const interval = setInterval(() => {
			setDisplay(
				text
					.split("")
					.map((char, index) => {
						if (index < iteration) return text[index];
						return chars[Math.floor(Math.random() * chars.length)];
					})
					.join(""),
			);

			if (iteration >= text.length) clearInterval(interval);
			iteration += 1 / 2; // Speed control
		}, 30);

		return () => clearInterval(interval);
	}, [text]);

	return (
		<span className={cn("font-mono", className)} style={style}>
			{display}
		</span>
	);
};

export const Viewfinder3D = ({ label = "INITIALIZING" }: Viewfinder3DProps) => {
	const [step, setStep] = useState(0);
	const [progress, setProgress] = useState(0);
	const [id, setId] = useState("-------");
	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden cursor-wait bg-[#f7f7f5] dark:bg-[#000000]">
			{/* Scanline Texture */}
			<div className="absolute inset-0 pointer-events-none z-[10] bg-[length:100%_2px,3px_100%] bg-scanline-light dark:bg-scanline-dark opacity-[0.05] dark:opacity-[0.03]" />

			<div className="relative w-full h-full max-w-[1920px] max-h-[1080px] p-8 md:p-12 flex flex-col justify-between">
				{/* --- GRID LAYER --- */}
				<div className="absolute inset-0 z-0 pointer-events-none">
					{/* Center Crosshair */}
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] opacity-20">
						<GridLine
							className="top-1/2 left-0 h-[1px] w-full bg-black/10 dark:bg-white/10"
							delay={0.2}
						/>
						<GridLine
							className="left-1/2 top-0 w-[1px] h-full bg-black/10 dark:bg-white/10"
							delay={0.2}
							vertical
						/>
						<motion.div
							animate={{ rotate: 180 }}
							transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
							className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border rounded-full border-dashed border-black/20 dark:border-white/20"
						/>
					</div>

					{/* Thirds Grid */}
					<GridLine
						className="top-1/3 left-0 h-[1px] w-full bg-black/5 dark:bg-white/5"
						delay={0.4}
					/>
					<GridLine
						className="top-2/3 left-0 h-[1px] w-full bg-black/5 dark:bg-white/5"
						delay={0.5}
					/>
					<GridLine
						className="left-1/3 top-0 w-[1px] h-full bg-black/5 dark:bg-white/5"
						delay={0.6}
						vertical
					/>
					<GridLine
						className="left-2/3 top-0 w-[1px] h-full bg-black/5 dark:bg-white/5"
						delay={0.7}
						vertical
					/>
				</div>

				{/* --- UI LAYER --- */}
				<div className="relative z-10 w-full h-full flex flex-col justify-between">
					{/* Top Bar */}
					<div className="flex justify-between items-start">
						<div className="flex flex-col gap-2">
							<div className="flex items-center gap-2">
								<motion.div
									animate={{ opacity: [1, 0.2, 1] }}
									transition={{ duration: 1, repeat: Infinity }}
									className="w-2 h-2 bg-[#FF4D00]"
								/>
								<ScrambleText
									text="STUDIO+233"
									className="text-[10px] tracking-[0.3em] text-neutral-500 dark:text-neutral-400"
								/>
							</div>
							<div className="h-[1px] w-24 bg-[#FF4D00]" />
						</div>
						<div className="text-right flex flex-col items-end gap-1">
							<span className="text-[10px] font-mono tracking-widest text-neutral-400 dark:text-neutral-500">
								REC.709 // 4K
							</span>
							<span className="text-[10px] font-mono tracking-widest text-neutral-400 dark:text-neutral-500">
								FPS: 60.00
							</span>
						</div>
					</div>

					{/* Center Content (The Loader) */}
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-6">
						<div className="flex items-center gap-4">
							<motion.div
								className="text-4xl md:text-6xl font-mono font-bold tracking-tighter text-neutral-900 dark:text-white"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
							>
								{Math.min(100, Math.floor(progress))
									.toString()
									.padStart(3, "0")}
							</motion.div>
							<div className="flex flex-col justify-between h-10 md:h-14 py-1">
								<span className="text-[10px] text-[#FF4D00] font-mono tracking-widest">
									%
								</span>
								<span className="text-[10px] font-mono tracking-widest text-neutral-400 dark:text-neutral-500">
									LOAD
								</span>
							</div>
						</div>

						{/* Progress Hairline */}
						<div className="w-64 h-[1px] relative overflow-hidden bg-black/10 dark:bg-white/10">
							<motion.div
								className="absolute top-0 left-0 h-full bg-[#FF4D00]"
								style={{ width: `${progress}%` }}
							/>
						</div>

						{/* System Log */}
						<div className="h-6 overflow-hidden">
							<AnimatePresence mode="wait">
								<motion.div
									key={step}
									initial={{ y: 10, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									exit={{ y: -10, opacity: 0 }}
									className="text-[10px] font-mono tracking-[0.2em] uppercase text-neutral-500 dark:text-neutral-400"
								>
									{`> ${BOOT_SEQUENCE[step]}`}
									<motion.span
										animate={{ opacity: [0, 1, 0] }}
										transition={{ duration: 0.5, repeat: Infinity }}
										className="ml-1 text-[#FF4D00]"
									>
										_
									</motion.span>
								</motion.div>
							</AnimatePresence>
						</div>
					</div>

					{/* Bottom Bar */}
					<div className="flex justify-between items-end">
						<div className="flex flex-col gap-1">
							<ScrambleText
								text={label}
								className="text-[10px] font-mono tracking-[0.2em] text-neutral-400 dark:text-neutral-500"
							/>
							<div className="text-[9px] font-mono tracking-widest text-neutral-400 dark:text-neutral-500">
								{`ID: ${id}`}
							</div>
						</div>

						<CornerBracket
							position="bl"
							className="border-black/20 dark:border-white/20"
						/>
						<CornerBracket
							position="br"
							className="border-black/20 dark:border-white/20"
						/>
						<CornerBracket
							position="tl"
							className="border-black/20 dark:border-white/20"
						/>
						<CornerBracket
							position="tr"
							className="border-black/20 dark:border-white/20"
						/>
					</div>
				</div>
			</div>
		</div>
	);
};
