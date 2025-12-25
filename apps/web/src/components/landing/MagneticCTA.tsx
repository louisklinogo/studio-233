"use client";

import {
	motion,
	useMotionTemplate,
	useMotionValue,
	useSpring,
} from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { SwissIcons } from "@/components/ui/SwissIcons";

export function MagneticCTA() {
	const ref = useRef<HTMLDivElement>(null);

	// Mouse position relative to the button center
	const x = useMotionValue(0);
	const y = useMotionValue(0);

	// Smooth spring physics for the magnetic effect
	const xSpring = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
	const ySpring = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!ref.current) return;

		const { left, top, width, height } = ref.current.getBoundingClientRect();
		const centerX = left + width / 2;
		const centerY = top + height / 2;

		// Calculate distance from center
		const distanceX = e.clientX - centerX;
		const distanceY = e.clientY - centerY;

		// Apply magnetic pull (limit the range)
		x.set(distanceX * 0.35);
		y.set(distanceY * 0.35);
	};

	const handleMouseLeave = () => {
		x.set(0);
		y.set(0);
	};

	// Text scramble effect on hover
	const text = "INITIALIZE STUDIO";

	return (
		<motion.div
			ref={ref}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			style={{ x: xSpring, y: ySpring }}
			className="group relative inline-flex items-center justify-center"
		>
			<Link href="/dashboard" className="relative z-10">
				<button className="relative flex items-center gap-3 bg-[#FF4D00] text-white px-8 py-4 font-mono text-sm tracking-widest uppercase hover:bg-[#E64500] transition-colors overflow-hidden">
					{/* Background Glitch Effect */}
					<div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out skew-y-12" />

					<span className="relative z-10 flex items-center gap-2 font-bold">
						{text}
						<SwissIcons.ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
					</span>

					{/* Corner accents */}
					<div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-white/50" />
					<div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-white/50" />
				</button>
			</Link>

			{/* Ambient Glow */}
			<div className="absolute inset-0 bg-[#FF4D00]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
		</motion.div>
	);
}
