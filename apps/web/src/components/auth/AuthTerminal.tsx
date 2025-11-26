import { motion } from "framer-motion";
import React from "react";

export function AuthTerminal({ children }: { children: React.ReactNode }) {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.5, ease: "easeOut" }}
			className="relative w-full max-w-md"
		>
			{/* Minimal Container */}
			<div className="relative w-full bg-[#f4f4f0] dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800">
				{/* Content Area */}
				<div className="p-8 relative z-10 min-h-[400px] flex flex-col">
					{children}
				</div>
			</div>
		</motion.div>
	);
}
