"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface MenuLinkProps {
	href: string;
	number: string;
	label: string;
	description: string;
}

export const MenuLink = ({
	href,
	number,
	label,
	description,
}: MenuLinkProps) => {
	const [isHovered, setIsHovered] = useState(false);
	const [displayNumber, setDisplayNumber] = useState(number);

	// Glitch effect for the number
	useEffect(() => {
		if (!isHovered) {
			setDisplayNumber(number);
			return;
		}

		const chars = "0123456789XY#_";
		let interval: NodeJS.Timeout;
		let counter = 0;

		interval = setInterval(() => {
			if (counter > 5) {
				setDisplayNumber(number);
				clearInterval(interval);
				return;
			}

			setDisplayNumber(
				number
					.split("")
					.map(() => chars[Math.floor(Math.random() * chars.length)])
					.join(""),
			);
			counter++;
		}, 50);

		return () => clearInterval(interval);
	}, [isHovered, number]);

	return (
		<Link
			href={href}
			className="block relative group h-full"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{/* Hover Background with "X-Ray" Scanline */}
			<motion.div
				className="absolute inset-0 bg-neutral-900/5 dark:bg-white/5 z-0 overflow-hidden"
				initial={{ opacity: 0 }}
				animate={{ opacity: isHovered ? 1 : 0 }}
				transition={{ duration: 0.3 }}
			>
				{/* Scanline */}
				<motion.div
					className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FF4D00]/10 to-transparent h-[20%]"
					animate={{ top: ["-20%", "120%"] }}
					transition={{
						repeat: Infinity,
						duration: 2,
						ease: "linear",
						repeatDelay: 0.5,
					}}
				/>
			</motion.div>

			<div className="relative z-10 flex flex-col justify-between h-full p-6 md:p-12 border-l-2 border-transparent group-hover:border-[#FF4D00] transition-colors duration-300">
				<div className="flex justify-between items-start">
					<span className="font-mono text-xs text-neutral-400 group-hover:text-[#FF4D00] transition-colors">
						{displayNumber}
					</span>
					<motion.div
						animate={{
							rotate: isHovered ? 45 : 0,
							scale: isHovered ? 1.1 : 1,
						}}
					>
						<ArrowUpRight className="w-6 h-6 text-neutral-400 group-hover:text-[#FF4D00] transition-colors" />
					</motion.div>
				</div>

				<div className="mt-8">
					<h3 className="text-4xl md:text-6xl font-bold tracking-tighter mb-2 relative overflow-hidden">
						<span className="relative z-10 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-neutral-900 group-hover:to-neutral-500 dark:group-hover:from-white dark:group-hover:to-neutral-400 transition-all duration-300">
							{label}
						</span>
						{/* "Ghost" text for glitch effect */}
						<span
							className="absolute top-0 left-0 text-[#FF4D00] opacity-0 group-hover:opacity-100 transition-opacity duration-100 pointer-events-none select-none mix-blend-multiply dark:mix-blend-screen"
							style={{
								clipPath: "polygon(0 0, 100% 0, 100% 45%, 0 45%)",
								transform: "translate(-2px, 2px)",
							}}
						>
							{label}
						</span>
					</h3>
					<p className="font-mono text-xs md:text-sm text-neutral-500 group-hover:text-[#FF4D00] transition-colors">
						{description}
					</p>
				</div>
			</div>
		</Link>
	);
};
