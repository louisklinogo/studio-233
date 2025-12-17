import { motion } from "framer-motion";
import React from "react";

export function AuthTerminal({ children }: { children: React.ReactNode }) {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.5, ease: "easeOut" }}
			className="relative w-full max-w-md group"
		>
			{/* Industrial Housing */}
			<div className="relative w-full bg-[#111] border-t border-l border-neutral-800 border-b border-r border-black shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]">
				{/* Top Status Strip */}
				<div className="h-2 w-full bg-[#0a0a0a] border-b border-neutral-900 flex items-center justify-between px-2">
					<div className="flex gap-1">
						<div className="w-6 h-[1px] bg-neutral-800" />
						<div className="w-1 h-[1px] bg-neutral-800" />
					</div>
					<div className="flex gap-1.5">
						<div className="w-0.5 h-0.5 rounded-full bg-neutral-700" />
						<div className="w-0.5 h-0.5 rounded-full bg-emerald-500 animate-pulse" />
					</div>
				</div>

				{/* Content Area */}
				<div className="p-8 relative z-10 min-h-[420px] flex flex-col bg-[#111]">
					{children}
				</div>

				{/* Bottom Ridge */}
				<div className="h-1 w-full bg-[#0a0a0a] border-t border-neutral-900" />
			</div>

			{/* Corner Accents */}
			<div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-neutral-700 opacity-50" />
			<div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-neutral-700 opacity-50" />
			<div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-neutral-700 opacity-50" />
			<div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-neutral-700 opacity-50" />
		</motion.div>
	);
}
