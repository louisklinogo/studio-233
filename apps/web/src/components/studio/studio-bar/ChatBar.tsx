"use client";

import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { cn } from "@/lib/utils";

interface ChatBarProps {
	isChatOpen: boolean;
	onToggleChat: () => void;
	isArchiveOpen: boolean;
	onToggleArchive: () => void;
}

export const ChatBar: React.FC<ChatBarProps> = ({
	isChatOpen,
	onToggleChat,
	isArchiveOpen,
	onToggleArchive,
}) => {
	return (
		<div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
			<motion.div
				layout
				className={cn(
					"h-14 flex items-center p-1",
					"bg-[#f4f4f0] dark:bg-[#0a0a0a]",
					"border border-neutral-200 dark:border-white/5",
					"rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
				)}
			>
				{/* BRAND ARCHIVE TOGGLE */}
				<button
					onClick={onToggleArchive}
					className={cn(
						"h-full px-6 flex items-center gap-3 rounded-xl transition-all duration-300 group",
						isArchiveOpen
							? "bg-white dark:bg-[#1a1a1a] shadow-[0_2px_8px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
							: "hover:bg-neutral-200/50 dark:hover:bg-white/5",
					)}
				>
					<SwissIcons.Brand
						size={16}
						className={cn(
							"transition-colors duration-300",
							isArchiveOpen
								? "text-[#FF4D00]"
								: "text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white",
						)}
					/>
					<span
						className={cn(
							"text-[11px] font-sans font-medium tracking-[0.15em] uppercase transition-colors duration-300",
							isArchiveOpen
								? "text-neutral-900 dark:text-white"
								: "text-neutral-500",
						)}
					>
						Archive
					</span>
				</button>

				<div className="w-[1px] h-6 bg-neutral-200 dark:bg-white/5 mx-2 opacity-50" />

				{/* ASSISTANT TOGGLE */}
				<button
					onClick={onToggleChat}
					className={cn(
						"h-full px-6 flex items-center gap-3 rounded-xl transition-all duration-300 group",
						isChatOpen
							? "bg-white dark:bg-[#1a1a1a] shadow-[0_2px_8px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
							: "hover:bg-neutral-200/50 dark:hover:bg-white/5",
					)}
				>
					<span
						className={cn(
							"text-[11px] font-sans font-medium tracking-[0.15em] uppercase transition-colors duration-300",
							isChatOpen
								? "text-neutral-900 dark:text-white"
								: "text-neutral-500",
						)}
					>
						Assistant
					</span>
					<SwissIcons.Assistant
						size={16}
						className={cn(
							"transition-colors duration-300",
							isChatOpen
								? "text-[#FF4D00]"
								: "text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white",
						)}
					/>
				</button>
			</motion.div>
		</div>
	);
};
