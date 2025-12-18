"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import React, { useRef, useState } from "react";

interface MagneticProps {
	children: React.ReactNode;
	strength?: number; // How much it pulls (0 to 1)
	range?: number; // Distance in pixels to start pulling
}

/**
 * Magnetic Component
 * Wraps children in a motion div that follows the mouse with a "pull" effect
 * perfectly aligned with Swiss/Braun industrial precision.
 */
export const Magnetic = ({
	children,
	strength = 0.5,
	range = 60,
}: MagneticProps) => {
	const ref = useRef<HTMLDivElement>(null);
	const [position, setPosition] = useState({ x: 0, y: 0 });

	const x = useMotionValue(0);
	const y = useMotionValue(0);

	const springConfig = { damping: 20, stiffness: 350, mass: 0.1 };
	const springX = useSpring(x, springConfig);
	const springY = useSpring(y, springConfig);

	const handleMouseMove = (e: React.MouseEvent) => {
		if (!ref.current) return;

		const { clientX, clientY } = e;
		const { left, top, width, height } = ref.current.getBoundingClientRect();

		// Center of the element
		const centerX = left + width / 2;
		const centerY = top + height / 2;

		// Distance from mouse to center
		const dx = clientX - centerX;
		const dy = clientY - centerY;
		const distance = Math.sqrt(dx * dx + dy * dy);

		if (distance < range) {
			// Calculate magnetic pull
			// Closer = stronger pull
			const pull = (1 - distance / range) * strength;
			x.set(dx * pull);
			y.set(dy * pull);
		} else {
			// Reset if out of range
			x.set(0);
			y.set(0);
		}
	};

	const handleMouseLeave = () => {
		x.set(0);
		y.set(0);
	};

	return (
		<motion.div
			ref={ref}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			style={{ x: springX, y: springY }}
			className="inline-block"
		>
			{children}
		</motion.div>
	);
};
