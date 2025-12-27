"use client";

import { useEffect, useState } from "react";

export interface MouseCoordinates {
	x: number; // 0 to 100
	y: number; // 0 to 100
	rawX: number; // pixels
	rawY: number; // pixels
}

/**
 * Hook to track mouse coordinates normalized to 0-100 and in raw pixels.
 */
export const useMouseCoordinates = () => {
	const [coords, setCoords] = useState<MouseCoordinates>({
		x: 0,
		y: 0,
		rawX: 0,
		rawY: 0,
	});

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			setCoords({
				x: (e.clientX / window.innerWidth) * 100,
				y: (e.clientY / window.innerHeight) * 100,
				rawX: e.clientX,
				rawY: e.clientY,
			});
		};

		window.addEventListener("mousemove", handleMouseMove);
		return () => window.removeEventListener("mousemove", handleMouseMove);
	}, []);

	return coords;
};
