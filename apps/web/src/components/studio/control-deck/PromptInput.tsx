"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PromptInputProps {
	value: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
}

const PLACEHOLDERS = [
	"Transform to oil painting...",
	"Make it cinematic...",
	"Add dramatic lighting...",
	"Convert to sketch...",
	"Apply cyberpunk style...",
	"Render in 3D...",
];

export const PromptInput: React.FC<PromptInputProps> = ({
	value,
	onChange,
	onSubmit,
	className,
	disabled,
}) => {
	const [placeholderIndex, setPlaceholderIndex] = useState(0);
	const [displayedPlaceholder, setDisplayedPlaceholder] = useState("");
	const [isTyping, setIsTyping] = useState(true);

	// Typewriter effect logic
	useEffect(() => {
		let timeout: NodeJS.Timeout;
		const currentPlaceholder = PLACEHOLDERS[placeholderIndex];

		if (isTyping) {
			if (displayedPlaceholder.length < currentPlaceholder.length) {
				timeout = setTimeout(
					() => {
						setDisplayedPlaceholder(
							currentPlaceholder.slice(0, displayedPlaceholder.length + 1),
						);
					},
					50 + Math.random() * 50,
				); // Random typing speed
			} else {
				// Finished typing, wait before deleting
				timeout = setTimeout(() => {
					setIsTyping(false);
				}, 2000);
			}
		} else {
			if (displayedPlaceholder.length > 0) {
				timeout = setTimeout(() => {
					setDisplayedPlaceholder(
						currentPlaceholder.slice(0, displayedPlaceholder.length - 1),
					);
				}, 30); // Fast delete speed
			} else {
				// Finished deleting, move to next placeholder
				setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
				setIsTyping(true);
			}
		}

		return () => clearTimeout(timeout);
	}, [displayedPlaceholder, isTyping, placeholderIndex]);

	return (
		<div
			className={cn(
				"relative h-12 flex items-center bg-[#f4f4f0] dark:bg-[#111111] min-w-[200px]",
				className,
			)}
		>
			<input
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter" && !e.shiftKey) {
						e.preventDefault();
						onSubmit();
					}
				}}
				disabled={disabled}
				className="w-full h-full bg-transparent px-3 text-xs font-mono text-neutral-900 dark:text-neutral-100 placeholder-transparent focus:outline-none z-10"
			/>

			{/* Typewriter Placeholder (only visible when input is empty) */}
			{!value && (
				<div className="absolute inset-0 flex items-center px-3 pointer-events-none">
					<span className="text-xs font-mono text-neutral-400">
						{displayedPlaceholder}
						<motion.span
							animate={{ opacity: [1, 0] }}
							transition={{ duration: 0.8, repeat: Infinity }}
							className="inline-block w-[2px] h-3 bg-[#FF4D00] ml-[1px] align-middle"
						/>
					</span>
				</div>
			)}
		</div>
	);
};
