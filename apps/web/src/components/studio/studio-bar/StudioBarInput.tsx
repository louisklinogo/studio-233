"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Maximize2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { cn } from "@/lib/utils";
import { StudioPromptDialog } from "./StudioPromptDialog";
import { TranscriptionHUD } from "./TranscriptionHUD";

interface StudioBarInputProps {
	value: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
	isGenerating?: boolean;
	placeholder?: string;
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
}: StudioBarInputProps) {
	const [isFocused, setIsFocused] = useState(false);
	const [placeholderIndex, setPlaceholderIndex] = useState(0);
	const [displayedPlaceholder, setDisplayedPlaceholder] = useState("");
	const [isRecording, setIsRecording] = useState(false);
	const [transcription, setTranscription] = useState("");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
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

	// Deepgram / Web Speech API Integration (Placeholder)
	const toggleRecording = () => {
		if (isRecording) {
			stopRecording();
		} else {
			startRecording();
		}
	};

	const startRecording = () => {
		setIsRecording(true);
		setTranscription("");
		console.log("Starting recording...");

		// Mock live transcription
		const phrases = [
			"Create",
			" a",
			" red",
			" chair",
			" in",
			" a",
			" white",
			" room",
		];
		let i = 0;
		const interval = setInterval(() => {
			if (i < phrases.length) {
				setTranscription((prev) => prev + phrases[i]);
				i++;
			} else {
				clearInterval(interval);
				setTimeout(() => {
					stopRecording();
					onChange(
						value + (value ? " " : "") + "Create a red chair in a white room",
					);
				}, 500);
			}
		}, 300);

		// Store interval to clear on unmount/stop (simplified for this mock)
		(window as any).mockTranscriptionInterval = interval;
	};

	const stopRecording = () => {
		setIsRecording(false);
		setTranscription("");
		if ((window as any).mockTranscriptionInterval) {
			clearInterval((window as any).mockTranscriptionInterval);
		}
		console.log("Stopping recording...");
	};

	return (
		<div
			className={cn(
				"relative h-full flex items-center flex-1 transition-colors duration-300",
				isFocused ? "bg-white dark:bg-[#1a1a1a]" : "bg-transparent",
			)}
		>
			{/* Transcription HUD Overlay */}
			<AnimatePresence>
				{isRecording && (
					<TranscriptionHUD
						isRecording={isRecording}
						transcription={transcription}
						onStop={stopRecording}
					/>
				)}
			</AnimatePresence>

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
				className="w-full h-full bg-transparent border-none outline-none px-4 pr-10 font-sans text-sm text-neutral-900 dark:text-white placeholder-transparent z-10"
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

			{/* Actions: Mic & Expand */}
			<div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 z-20">
				{/* Expand Button */}
				<button
					onClick={() => setIsDialogOpen(true)}
					className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
					title="Open Editor"
				>
					<Maximize2 size={14} />
				</button>

				{/* Mic Button */}
				<button
					onClick={() => {
						setIsDialogOpen(true);
						// Small delay to let dialog open before starting recording
						setTimeout(() => startRecording(), 100);
					}}
					className={cn(
						"p-2 rounded-full transition-all duration-300 flex items-center justify-center",
						isRecording
							? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
							: "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300",
					)}
				>
					{isRecording ? (
						<motion.div
							animate={{ scale: [1, 1.2, 1] }}
							transition={{ duration: 1.5, repeat: Infinity }}
						>
							<SwissIcons.Mic size={16} />
						</motion.div>
					) : (
						<SwissIcons.Mic size={16} />
					)}
				</button>
			</div>

			{/* Mini Dialog (Popover) */}
			<StudioPromptDialog
				isOpen={isDialogOpen}
				onClose={() => setIsDialogOpen(false)}
				value={value}
				onChange={onChange}
				onSubmit={onSubmit}
				isRecording={isRecording}
				toggleRecording={toggleRecording}
				transcription={transcription}
			/>

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
