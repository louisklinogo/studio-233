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
	color,
}: {
	className?: string;
	delay?: number;
	vertical?: boolean;
	color?: string;
}) => (
	<motion.div
		initial={vertical ? { height: 0 } : { width: 0 }}
		animate={vertical ? { height: "100%" } : { width: "100%" }}
		transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay }}
		className={cn("absolute", className)}
		style={{ backgroundColor: color ?? "rgba(64,64,64,0.6)" }}
	/>
);

const CornerBracket = ({
	position,
	color,
}: {
	position: "tl" | "tr" | "bl" | "br";
	color: string;
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
			)}
			style={{ borderColor: color }}
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
	const { resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		// Generate stable ID on mount
		setId(Math.random().toString(36).substring(7).toUpperCase());

		// Cycle through fake boot steps
		const interval = setInterval(() => {
			setStep((prev) => (prev + 1) % BOOT_SEQUENCE.length);
		}, 800);

		// Fake progress bar
		const progressInterval = setInterval(() => {
			setProgress((prev) => {
				if (prev >= 100) return 100;
				// Random increments for "real" feel
				return prev + Math.random() * 15;
			});
		}, 200);

		return () => {
			clearInterval(interval);
			clearInterval(progressInterval);
		};
	}, []);

	const isDark = (mounted ? resolvedTheme : null) !== "light";
	const palette = isDark
		? {
				bg: "#000000",
				grid: "rgba(64,64,64,0.6)",
				bracket: "rgba(107,114,128,0.8)",
				primary: "#f5f5f5",
				secondary: "#9ca3af",
				tertiary: "#6b7280",
				progressTrack: "rgba(64,64,64,0.7)",
				scanline:
					"linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))",
				scanlineOpacity: 0.03,
				crosshair: "rgba(87,87,87,0.9)",
			}
		: {
				bg: "#f7f7f5",
				grid: "rgba(0,0,0,0.08)",
				bracket: "rgba(0,0,0,0.25)",
				primary: "#0a0a0a",
				secondary: "#4b5563",
				tertiary: "#6b7280",
				progressTrack: "rgba(0,0,0,0.12)",
				scanline:
					"linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.08)_50%),linear-gradient(90deg,rgba(255,69,0,0.05),rgba(0,0,0,0.02),rgba(0,0,0,0.05))",
				scanlineOpacity: 0.05,
				crosshair: "rgba(0,0,0,0.25)",
			};

	return (
		<div
			className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden cursor-wait"
			style={{ backgroundColor: palette.bg }}
		>
			{/* Scanline Texture */}
			<div
				className="absolute inset-0 pointer-events-none z-[10] bg-[length:100%_2px,3px_100%]"
				style={{
					backgroundImage: palette.scanline,
					opacity: palette.scanlineOpacity,
				}}
			/>

			<div className="relative w-full h-full max-w-[1920px] max-h-[1080px] p-8 md:p-12 flex flex-col justify-between">
				{/* --- GRID LAYER --- */}
				<div className="absolute inset-0 z-0 pointer-events-none">
					{/* Center Crosshair */}
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] opacity-20">
						<GridLine
							className="top-1/2 left-0 h-[1px] w-full"
							delay={0.2}
							color={palette.grid}
						/>
						<GridLine
							className="left-1/2 top-0 w-[1px] h-full"
							delay={0.2}
							vertical
							color={palette.grid}
						/>
						<motion.div
							animate={{ rotate: 180 }}
							transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
							className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border rounded-full border-dashed"
							style={{ borderColor: palette.crosshair }}
						/>
					</div>

					{/* Thirds Grid */}
					<GridLine
						className="top-1/3 left-0 h-[1px] w-full"
						delay={0.4}
						color={palette.grid}
					/>
					<GridLine
						className="top-2/3 left-0 h-[1px] w-full"
						delay={0.5}
						color={palette.grid}
					/>
					<GridLine
						className="left-1/3 top-0 w-[1px] h-full"
						delay={0.6}
						vertical
						color={palette.grid}
					/>
					<GridLine
						className="left-2/3 top-0 w-[1px] h-full"
						delay={0.7}
						vertical
						color={palette.grid}
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
									className="text-[10px] tracking-[0.3em]"
									style={{ color: palette.tertiary }}
								/>
							</div>
							<div className="h-[1px] w-24 bg-[#FF4D00]" />
						</div>
						<div className="text-right flex flex-col items-end gap-1">
							<span
								className="text-[10px] font-mono tracking-widest"
								style={{ color: palette.secondary }}
							>
								REC.709 // 4K
							</span>
							<span
								className="text-[10px] font-mono tracking-widest"
								style={{ color: palette.secondary }}
							>
								FPS: 60.00
							</span>
						</div>
					</div>

					{/* Center Content (The Loader) */}
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-6">
						<div className="flex items-center gap-4">
							<motion.div
								className="text-4xl md:text-6xl font-mono font-bold tracking-tighter"
								style={{ color: palette.primary }}
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
								<span
									className="text-[10px] font-mono tracking-widest"
									style={{ color: palette.secondary }}
								>
									LOAD
								</span>
							</div>
						</div>

						{/* Progress Hairline */}
						<div
							className="w-64 h-[1px] relative overflow-hidden"
							style={{ backgroundColor: palette.progressTrack }}
						>
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
									className="text-[10px] font-mono tracking-[0.2em] uppercase"
									style={{ color: palette.tertiary }}
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
								className="text-[10px] font-mono tracking-[0.2em]"
								style={{ color: palette.secondary }}
							/>
							<div
								className="text-[9px] font-mono tracking-widest"
								style={{ color: palette.tertiary }}
							>
								{`ID: ${id}`}
							</div>
						</div>

						<CornerBracket position="bl" color={palette.bracket} />
						<CornerBracket position="br" color={palette.bracket} />
						<CornerBracket position="tl" color={palette.bracket} />
						<CornerBracket position="tr" color={palette.bracket} />
					</div>
				</div>
			</div>
		</div>
	);
};
