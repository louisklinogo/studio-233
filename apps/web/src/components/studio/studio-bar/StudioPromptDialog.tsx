"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { cn } from "@/lib/utils";
import { TranscriptionHUD } from "./TranscriptionHUD";

interface StudioPromptDialogProps {
	isOpen: boolean;
	onClose: () => void;
	value: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
	isRecording: boolean;
	toggleRecording: () => void;
	transcription: string;
}

export function StudioPromptDialog({
	isOpen,
	onClose,
	value,
	onChange,
	onSubmit,
	isRecording,
	toggleRecording,
	transcription,
}: StudioPromptDialogProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Auto-focus when opened
	useEffect(() => {
		if (isOpen && textareaRef.current) {
			textareaRef.current.focus();
			// Move cursor to end
			textareaRef.current.setSelectionRange(
				textareaRef.current.value.length,
				textareaRef.current.value.length,
			);
		}
	}, [isOpen]);

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop (Invisible but catches clicks to close) */}
					<div className="fixed inset-0 z-40" onClick={onClose} />

					{/* Dialog */}
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 10 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 10 }}
						transition={{ type: "spring", duration: 0.3 }}
						className={cn(
							"fixed bottom-24 left-1/2 -translate-x-1/2 z-50",
							"w-[600px] max-w-[90vw] min-h-[160px]",
							"bg-white dark:bg-[#111]",
							"rounded-lg shadow-2xl",
							"border border-neutral-200 dark:border-neutral-800",
							"flex flex-col overflow-hidden",
						)}
					>
						{/* Header */}
						<div className="flex items-center justify-between px-4 py-2 border-b border-neutral-100 dark:border-neutral-800">
							<span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
								Prompt Editor
							</span>
							<button
								onClick={onClose}
								className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
							>
								<X size={14} />
							</button>
						</div>

						{/* Text Area */}
						<div className="flex-1 relative">
							<textarea
								ref={textareaRef}
								value={value}
								onChange={(e) => onChange(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault();
										onSubmit();
										onClose();
									}
								}}
								placeholder="Describe what you want to create..."
								className="w-full h-full p-4 bg-transparent border-none outline-none resize-none font-sans text-base text-neutral-900 dark:text-white placeholder:text-neutral-300"
							/>

							{/* Transcription Overlay */}
							<AnimatePresence>
								{isRecording && (
									<div className="absolute inset-0 bg-white/95 dark:bg-[#111]/95 backdrop-blur-sm flex items-center justify-center">
										<TranscriptionHUD
											isRecording={isRecording}
											transcription={transcription}
											onStop={toggleRecording}
										/>
									</div>
								)}
							</AnimatePresence>
						</div>

						{/* Footer Actions */}
						<div className="flex items-center justify-between px-4 py-3 bg-neutral-50 dark:bg-[#0a0a0a] border-t border-neutral-100 dark:border-neutral-800">
							<button
								onClick={toggleRecording}
								className={cn(
									"flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
									isRecording
										? "bg-red-500/10 text-red-500"
										: "hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400",
								)}
							>
								<SwissIcons.Mic size={14} />
								{isRecording ? "Stop Recording" : "Dictate"}
							</button>

							<div className="flex items-center gap-2">
								<span className="text-[10px] text-neutral-400 font-mono hidden sm:inline-block">
									CMD + ENTER to Run
								</span>
								<button
									onClick={() => {
										onSubmit();
										onClose();
									}}
									className="px-4 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-medium rounded-sm hover:opacity-90 transition-opacity"
								>
									Run
								</button>
							</div>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
