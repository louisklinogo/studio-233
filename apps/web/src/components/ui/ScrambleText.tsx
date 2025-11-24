"use client";

import { useEffect, useRef, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
const CYCLES_PER_LETTER = 2;
const SHUFFLE_TIME = 30;

interface ScrambleTextProps {
	text: string;
	className?: string;
	scrambleColor?: string;
}

export function ScrambleText({
	text,
	className = "",
	scrambleColor = "#BFFF6D",
}: ScrambleTextProps) {
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const spanRef = useRef<HTMLSpanElement>(null);
	const originalColorRef = useRef<string>("");
	const [displayText, setDisplayText] = useState(text);

	useEffect(() => {
		if (spanRef.current) {
			// Measure the width of the original text
			const rect = spanRef.current.getBoundingClientRect();
			// Apply styles imperatively to avoid React overwriting GSAP's inline styles
			spanRef.current.style.width = `${rect.width}px`;
			spanRef.current.style.textAlign = "center";
		}
	}, [text]);

	const stopScramble = () => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
		setDisplayText(text);
		
		// Restore original color
		if (spanRef.current) {
			spanRef.current.style.color = originalColorRef.current;
		}
	};

	const scramble = () => {
		let pos = 0;

		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}

		// Capture current color (set by GSAP) before changing it
		if (spanRef.current) {
			originalColorRef.current = spanRef.current.style.color;
			spanRef.current.style.color = scrambleColor;
		}

		intervalRef.current = setInterval(() => {
			const scrambled = text
				.split("")
				.map((char, index) => {
					if (pos / CYCLES_PER_LETTER > index) {
						return char;
					}

					const randomChar = CHARS[Math.floor(Math.random() * CHARS.length)];
					return randomChar;
				})
				.join("");

			setDisplayText(scrambled);
			pos++;

			if (pos >= text.length * CYCLES_PER_LETTER) {
				stopScramble();
			}
		}, SHUFFLE_TIME);
	};

	return (
		<span
			ref={spanRef}
			onMouseEnter={scramble}
			onMouseLeave={stopScramble}
			className={`inline-block cursor-pointer whitespace-nowrap ${className}`}
		>
			{displayText}
		</span>
	);
}
