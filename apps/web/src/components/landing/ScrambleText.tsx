"use client";

import { useInView } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

interface ScrambleTextProps {
	text: string;
	className?: string;
	scrambleSpeed?: number;
	revealSpeed?: number;
	triggerOnce?: boolean;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

export const ScrambleText = ({
	text,
	className = "",
	scrambleSpeed = 30,
	revealSpeed = 50,
	triggerOnce = true,
}: ScrambleTextProps) => {
	const elementRef = useRef<HTMLSpanElement>(null);
	const isInView = useInView(elementRef, { once: triggerOnce, amount: 0.5 });
	const [displayText, setDisplayText] = useState("");
	const [isScrambling, setIsScrambling] = useState(false);

	useEffect(() => {
		if (isInView && !isScrambling && displayText !== text) {
			setIsScrambling(true);
		}
	}, [isInView, isScrambling, displayText, text]);

	useEffect(() => {
		if (!isScrambling) return;

		let interval: NodeJS.Timeout;
		let counter = 0;
		const length = text.length;

		interval = setInterval(() => {
			let result = "";
			for (let i = 0; i < length; i++) {
				if (i < counter) {
					result += text[i];
				} else {
					// Keep spaces as spaces, scramble other chars
					if (text[i] === " ") {
						result += " ";
					} else {
						result += CHARS[Math.floor(Math.random() * CHARS.length)];
					}
				}
			}

			setDisplayText(result);
			counter += 1 / 2; // Slow down the reveal

			if (counter >= length) {
				clearInterval(interval);
				setIsScrambling(false);
				setDisplayText(text);
			}
		}, scrambleSpeed);

		return () => clearInterval(interval);
	}, [isScrambling, text, scrambleSpeed]);

	// Initial state: random chars matching length
	useEffect(() => {
		if (!isInView && displayText === "") {
			let initial = "";
			for (let i = 0; i < text.length; i++) {
				initial +=
					text[i] === " "
						? " "
						: CHARS[Math.floor(Math.random() * CHARS.length)];
			}
			setDisplayText(initial);
		}
	}, [isInView, text, displayText]);

	return (
		<span ref={elementRef} className={className}>
			{displayText}
		</span>
	);
};
