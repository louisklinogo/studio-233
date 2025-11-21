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
			className="block relative group"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{/* Hover Background */}
			<motion.div
				className="absolute inset-0 bg-neutral-900/10 dark:bg-white/10 backdrop-blur-sm -skew-x-12 z-0"
				initial={{ scaleX: 0, opacity: 0 }}
				animate={{ scaleX: isHovered ? 1 : 0, opacity: isHovered ? 1 : 0 }}
				transition={{ duration: 0.3, ease: "easeOut" }}
				style={{ originX: 0 }}
			/>

			<div className="relative z-10 flex items-baseline justify-between pb-4 px-4 pt-4">
				<div className="flex items-baseline gap-6">
					<span className="font-mono text-xs text-neutral-400 group-hover:text-[#FF4D00] transition-colors w-6">
						{displayNumber}
					</span>
					<motion.span
						className="text-2xl md:text-3xl font-semibold tracking-tight group-hover:text-[#FF4D00] transition-colors"
						animate={{ x: isHovered ? 10 : 0 }}
						transition={{ type: "spring", stiffness: 300, damping: 20 }}
					>
						{label}
					</motion.span>
				</div>

				<motion.div
					animate={{
						x: isHovered ? 0 : -10,
						y: isHovered ? 0 : 10,
						opacity: isHovered ? 1 : 0,
					}}
				>
					<ArrowUpRight className="w-6 h-6 text-[#FF4D00]" />
				</motion.div>

				{/* Animated Border Lines */}
				<div className="absolute bottom-0 left-0 right-0 h-[1px] bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
					<motion.div
						className="h-full bg-[#FF4D00]"
						initial={{ x: "-100%" }}
						animate={{ x: isHovered ? "0%" : "-100%" }}
						transition={{ duration: 0.4, ease: "circOut" }}
					/>
				</div>
			</div>

			<motion.p
				className="text-xs text-neutral-500 group-hover:text-[#FF4D00]/80 mt-2 font-mono px-4 transition-colors"
				animate={{ opacity: isHovered ? 1 : 0.5, x: isHovered ? 10 : 0 }}
			>
				{description}
			</motion.p>
		</Link>
	);
};
