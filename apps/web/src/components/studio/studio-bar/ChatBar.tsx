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
		<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
			<motion.div
				layout
				className={cn(
					"h-12 flex items-center p-1",
					"bg-[#f4f4f0] dark:bg-[#111111]",
					"border border-neutral-200 dark:border-neutral-800",
					"rounded-full shadow-2xl",
				)}
			>
				{/* BRAND ARCHIVE TOGGLE */}
				<button
					onClick={onToggleArchive}
					className={cn(
						"h-full px-5 flex items-center gap-2 rounded-full transition-all duration-200 group",
						isArchiveOpen
							? "bg-white dark:bg-neutral-800 shadow-sm"
							: "hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50",
					)}
				>
					<SwissIcons.Layout
						size={16}
						className={cn(
							"transition-colors",
							isArchiveOpen
								? "text-[#FF4D00]"
								: "text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300",
						)}
					/>
					<span
						className={cn(
							"text-[10px] font-mono tracking-widest uppercase transition-colors",
							isArchiveOpen
								? "text-neutral-900 dark:text-white font-bold"
								: "text-neutral-500",
						)}
					>
						Archive
					</span>
				</button>

				<div className="w-[1px] h-4 bg-neutral-200 dark:bg-neutral-800 mx-1" />

				{/* ASSISTANT TOGGLE */}
				<button
					onClick={onToggleChat}
					className={cn(
						"h-full px-5 flex items-center gap-2 rounded-full transition-all duration-200 group",
						isChatOpen
							? "bg-white dark:bg-neutral-800 shadow-sm"
							: "hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50",
					)}
				>
					<span
						className={cn(
							"text-[10px] font-mono tracking-widest uppercase transition-colors",
							isChatOpen
								? "text-neutral-900 dark:text-white font-bold"
								: "text-neutral-500",
						)}
					>
						Assistant
					</span>
					<SwissIcons.Mic
						size={16}
						className={cn(
							"transition-colors",
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
