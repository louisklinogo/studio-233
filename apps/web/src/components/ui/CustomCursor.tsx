"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export function CustomCursor() {
	const [isHovering, setIsHovering] = useState(false);
	const [isClicking, setIsClicking] = useState(false);
	const [isVisible, setIsVisible] = useState(false);

	const cursorX = useMotionValue(-100);
	const cursorY = useMotionValue(-100);

	const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
	const cursorXSpring = useSpring(cursorX, springConfig);
	const cursorYSpring = useSpring(cursorY, springConfig);

	// Hide default cursor when component is mounted
	useEffect(() => {
		// Only hide cursor on devices with fine pointer (mouse/trackpad)
		const mediaQuery = window.matchMedia("(pointer: fine)");

		if (mediaQuery.matches) {
			document.documentElement.style.cursor = "none";
			document.body.style.cursor = "none";
		}

		return () => {
			// Restore default cursor when component unmounts
			document.documentElement.style.cursor = "";
			document.body.style.cursor = "";
		};
	}, []);

	useEffect(() => {
		const moveCursor = (e: MouseEvent) => {
			cursorX.set(e.clientX);
			cursorY.set(e.clientY);
			if (!isVisible) setIsVisible(true);
		};

		const handleMouseDown = () => setIsClicking(true);
		const handleMouseUp = () => setIsClicking(false);

		const handleMouseOver = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			const isInteractive =
				target.tagName === "BUTTON" ||
				target.tagName === "A" ||
				target.tagName === "INPUT" ||
				target.closest("button") ||
				target.closest("a") ||
				target.getAttribute("role") === "button";

			setIsHovering(!!isInteractive);
		};

		window.addEventListener("mousemove", moveCursor);
		window.addEventListener("mousedown", handleMouseDown);
		window.addEventListener("mouseup", handleMouseUp);
		window.addEventListener("mouseover", handleMouseOver);

		return () => {
			window.removeEventListener("mousemove", moveCursor);
			window.removeEventListener("mousedown", handleMouseDown);
			window.removeEventListener("mouseup", handleMouseUp);
			window.removeEventListener("mouseover", handleMouseOver);
		};
	}, [cursorX, cursorY, isVisible]);

	// Hide on touch devices
	if (
		typeof window !== "undefined" &&
		window.matchMedia("(pointer: coarse)").matches
	) {
		return null;
	}

	return (
		<div
			className="fixed top-0 left-0 z-[9999] pointer-events-none mix-blend-difference"
			style={{ opacity: isVisible ? 1 : 0 }}
		>
			{/* Primary Dot - Instant Follow */}
			<motion.div
				className="absolute w-2 h-2 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"
				style={{
					x: cursorX,
					y: cursorY,
				}}
			/>

			{/* Secondary Ring - Spring Follow */}
			<motion.div
				className="absolute border border-white rounded-full -translate-x-1/2 -translate-y-1/2"
				style={{
					x: cursorXSpring,
					y: cursorYSpring,
				}}
				animate={{
					width: isHovering ? 48 : 24,
					height: isHovering ? 48 : 24,
					scale: isClicking ? 0.8 : 1,
					borderWidth: isHovering ? 2 : 1,
					opacity: isHovering ? 1 : 0.5,
				}}
				transition={{
					type: "spring",
					damping: 25,
					stiffness: 300,
				}}
			/>
		</div>
	);
}
