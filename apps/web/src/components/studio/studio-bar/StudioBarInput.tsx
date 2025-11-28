import { motion } from "framer-motion";
import { Maximize2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { cn } from "@/lib/utils";

interface StudioBarInputProps {
	value: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
	isGenerating?: boolean;
	placeholder?: string;
	onExpand?: () => void;
	onMic?: () => void;
}

const PLACEHOLDERS = [
	"Type to create...",
	"A red chair in a white room...",
	"Swiss design poster...",
	"Neon city at night...",
	"Abstract geometric shapes...",
];

export function StudioBarInput({
	value,
	onChange,
	onSubmit,
	isGenerating,
	placeholder = "Type to create...",
	onExpand,
	onMic,
}: StudioBarInputProps) {
	const [isFocused, setIsFocused] = useState(false);
	const [placeholderIndex, setPlaceholderIndex] = useState(0);
	const [displayedPlaceholder, setDisplayedPlaceholder] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	// Typewriter Effect
	useEffect(() => {
		if (isFocused || value) {
			setDisplayedPlaceholder("");
			return;
		}

		let currentIndex = 0;
		let currentText = "";
		let isDeleting = false;
		let timeout: NodeJS.Timeout;

		const type = () => {
			const targetText = PLACEHOLDERS[placeholderIndex];

			if (isDeleting) {
				currentText = targetText.substring(0, currentText.length - 1);
			} else {
				currentText = targetText.substring(0, currentText.length + 1);
			}

			setDisplayedPlaceholder(currentText);

			let typeSpeed = isDeleting ? 30 : 50;

			if (!isDeleting && currentText === targetText) {
				typeSpeed = 2000; // Pause at end
				isDeleting = true;
			} else if (isDeleting && currentText === "") {
				isDeleting = false;
				setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
				typeSpeed = 500; // Pause before next
			}

			timeout = setTimeout(type, typeSpeed);
		};

		timeout = setTimeout(type, 100);

		return () => clearTimeout(timeout);
	}, [isFocused, value, placeholderIndex]);

	return (
		<div
			className={cn(
				"relative h-full flex items-center flex-1 transition-colors duration-300",
				isFocused ? "bg-white dark:bg-[#1a1a1a]" : "bg-transparent",
			)}
		>
			{/* Input Field */}
			<input
				ref={inputRef}
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter" && !e.shiftKey) {
						e.preventDefault();
						onSubmit();
					}
				}}
				onFocus={() => setIsFocused(true)}
				onBlur={() => setIsFocused(false)}
				className="w-full h-full bg-transparent border-none outline-none px-4 pr-24 font-sans text-sm text-neutral-900 dark:text-white placeholder-transparent z-10"
			/>

			{/* Typewriter Placeholder Overlay */}
			{!value && (
				<div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400 text-sm font-sans flex items-center">
					{displayedPlaceholder}
					<motion.span
						animate={{ opacity: [1, 0] }}
						transition={{ duration: 0.8, repeat: Infinity }}
						className="w-[2px] h-4 bg-orange-500 ml-0.5 inline-block"
					/>
				</div>
			)}

			{/* Actions: Mic & Expand (Control Zone) */}
			<div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center z-20 h-8 gap-1">
				{/* Mic Button */}
				<button
					onClick={() => onMic?.()}
					className={cn(
						"h-7 w-7 flex items-center justify-center rounded-sm transition-all duration-200",
						"text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800",
					)}
					title="Dictate"
				>
					<SwissIcons.Mic size={14} />
				</button>

				<div className="w-[1px] h-3 bg-neutral-200 dark:bg-neutral-800" />

				{/* Expand Button */}
				<button
					onClick={() => onExpand?.()}
					className="h-7 w-7 flex items-center justify-center rounded-sm text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
					title="Expand Editor"
				>
					<Maximize2 size={14} />
				</button>
			</div>

			{/* Active Border Bottom (Orange Heartbeat) */}
			{isGenerating && (
				<motion.div
					layoutId="generating-line"
					className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF4D00]"
					animate={{ opacity: [0.5, 1, 0.5] }}
					transition={{ duration: 1.5, repeat: Infinity }}
				/>
			)}
		</div>
	);
}
