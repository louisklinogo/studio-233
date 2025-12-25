"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type OverlayType = "modules" | "pricing" | "protocols" | "manifesto" | null;

interface HudNavProps {
	onOpenOverlay: (type: OverlayType) => void;
	activeOverlay: OverlayType;
}

export function HudNav({ onOpenOverlay, activeOverlay }: HudNavProps) {
	const [scrolled, setScrolled] = useState(0);

	useEffect(() => {
		const handleScroll = () => {
			const totalScroll =
				document.documentElement.scrollHeight - window.innerHeight;
			const currentScroll = window.scrollY;
			setScrolled(currentScroll / totalScroll);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const navItems = [
		{ id: "modules", label: "01 // MODULES" },
		{ id: "pricing", label: "02 // PRICING" },
		{ id: "protocols", label: "03 // PROTOCOLS" },
		{ id: "manifesto", label: "04 // MANIFESTO" },
	] as const;

	return (
		<div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-end gap-12">
			{/* Scroll Progress Bar */}
			<div className="relative w-1 h-48 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
				<motion.div
					className="absolute top-0 left-0 w-full bg-[#FF4D00]"
					style={{ height: `${scrolled * 100}%` }}
				/>
			</div>

			{/* Vertical Links */}
			<nav className="flex flex-col gap-6 items-end">
				{navItems.map((item) => (
					<button
						key={item.id}
						onClick={() => onOpenOverlay(item.id)}
						className="group flex items-center gap-4 text-right"
					>
						<span
							className={`font-mono text-[10px] tracking-[0.3em] transition-all duration-300 ${
								activeOverlay === item.id
									? "text-[#FF4D00] translate-x-0"
									: "text-neutral-500 group-hover:text-white group-hover:-translate-x-2"
							}`}
						>
							{item.label}
						</span>
						<div
							className={`w-1.5 h-1.5 border transition-all duration-300 ${
								activeOverlay === item.id
									? "bg-[#FF4D00] border-[#FF4D00] scale-150"
									: "border-neutral-700 group-hover:border-[#FF4D00] group-hover:bg-[#FF4D00]"
							}`}
						/>
					</button>
				))}
			</nav>

			{/* System Status Indicator */}
			<div className="flex flex-col items-end gap-1 font-mono text-[8px] text-neutral-600 dark:text-neutral-500 tracking-tighter">
				<div className="flex gap-2">
					<span>LATENCY: 24MS</span>
					<span>UPLINK: ACTIVE</span>
				</div>
				<span>© STUDIO+233 SYSTEMS</span>
			</div>
		</div>
	);
}
