"use client";

import { motion } from "framer-motion";
import React, { useState } from "react";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { cn } from "@/lib/utils";
import { TranscriptionHUD } from "./TranscriptionHUD";

interface ChatBarProps {
	isChatOpen: boolean;
	onToggleChat: () => void;
}

export const ChatBar: React.FC<ChatBarProps> = ({
	isChatOpen,
	onToggleChat,
}) => {
	const [isRecording, setIsRecording] = useState(false);

	const handleToggleRecording = (
		event: React.MouseEvent<HTMLButtonElement>,
	) => {
		event.stopPropagation();
		setIsRecording((previous) => !previous);
	};

	return (
		<motion.div
			role="button"
			aria-label="Open communicator"
			aria-pressed={isChatOpen}
			initial={{ y: 100, opacity: 0 }}
			animate={{ y: 0, opacity: 1, x: "-50%" }}
			transition={{ type: "spring", stiffness: 300, damping: 30 }}
			onClick={onToggleChat}
			className={cn(
				"fixed bottom-8 left-1/2 z-[100]",
				"h-14 w-[min(95vw,480px)]",
				"rounded-sm shadow-chamfer",
				"border border-neutral-200/80 dark:border-neutral-800/80",
				"flex items-center px-3",
				"cursor-pointer",
				isChatOpen && "border-[#FF4D00]/70",
			)}
		>
			<div className="absolute inset-0 bg-[#f0ede3] dark:bg-[#111111] bg-noise opacity-95 -z-10 pointer-events-none" />

			<div className="flex items-center justify-between w-full gap-3">
				<div className="flex items-center gap-2 min-w-0">
					<SwissIcons.Sparkles
						size={16}
						className={cn(
							"text-neutral-700 dark:text-neutral-50 transition-transform duration-300",
							isChatOpen && "rotate-12",
						)}
					/>
					<div className="flex flex-col min-w-0">
						<span className="text-[10px] font-mono uppercase tracking-widest text-neutral-600 dark:text-neutral-300">
							Communicator
						</span>
						<span className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
							{isChatOpen ? "Chat open" : "Click to open chat"}
						</span>
					</div>
				</div>

				<button
					type="button"
					onClick={handleToggleRecording}
					className={cn(
						"relative h-8 w-8 flex items-center justify-center rounded-sm",
						"bg-neutral-200/80 dark:bg-neutral-900/80",
						"text-neutral-600 dark:text-neutral-200",
						"hover:bg-neutral-100 dark:hover:bg-neutral-800",
						"transition-colors",
					)}
					aria-label={isRecording ? "Stop voice input" : "Start voice input"}
				>
					<SwissIcons.Mic size={14} />
				</button>
			</div>

			<TranscriptionHUD
				isRecording={isRecording}
				transcription=""
				onStop={() => setIsRecording(false)}
			/>
		</motion.div>
	);
};
