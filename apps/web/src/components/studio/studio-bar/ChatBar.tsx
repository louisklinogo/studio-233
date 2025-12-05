"use client";

import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { cn } from "@/lib/utils";

interface ChatBarProps {
	isChatOpen: boolean;
	onToggleChat: () => void;
}

export const ChatBar: React.FC<ChatBarProps> = ({
	isChatOpen,
	onToggleChat,
}) => {
	return (
		<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2">
			<motion.button
				layout
				onClick={onToggleChat}
				className={cn(
					"h-12 px-6 flex items-center gap-3",
					"bg-[#f4f4f0] dark:bg-[#111111]",
					"border border-neutral-200 dark:border-neutral-800",
					"rounded-full shadow-2xl",
					"hover:scale-105 active:scale-95 transition-all duration-200",
					"group",
				)}
			>
				<div
					className={cn(
						"w-2 h-2 rounded-full",
						isChatOpen ? "bg-[#FF4D00]" : "bg-neutral-300 dark:bg-neutral-700",
						"transition-colors",
					)}
				/>
				<span className="text-sm font-medium tracking-wide text-neutral-600 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
					{isChatOpen ? "Close Assistant" : "Ask Assistant"}
				</span>
				<div className="w-[1px] h-4 bg-neutral-200 dark:bg-neutral-800 mx-1" />
				<SwissIcons.Mic
					size={16}
					className={cn(
						"text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors",
					)}
				/>
			</motion.button>
		</div>
	);
};
