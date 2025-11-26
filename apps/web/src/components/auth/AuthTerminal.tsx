import { motion } from "framer-motion";
import React from "react";

export function AuthTerminal({ children }: { children: React.ReactNode }) {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.5, ease: "easeOut" }}
			className="relative w-full max-w-md"
		>
			{/* Terminal Window */}
			<div className="relative w-full rounded-sm border-2 border-neutral-800 dark:border-neutral-700 bg-[#f4f4f0] dark:bg-[#0a0a0a] shadow-[0_0_30px_rgba(0,0,0,0.2)] overflow-hidden">
				{/* Header Bar */}
				<div className="flex items-center justify-between px-4 py-2 bg-neutral-200 dark:bg-neutral-900 border-b-2 border-neutral-800 dark:border-neutral-700">
					<div className="flex items-center gap-3">
						<div className="flex gap-1.5">
							<div className="w-2 h-2 bg-red-500 rounded-full" />
							<div className="w-2 h-2 bg-yellow-500 rounded-full" />
							<div className="w-2 h-2 bg-green-500 rounded-full" />
						</div>
						<span className="font-mono text-[10px] tracking-widest text-neutral-500 dark:text-neutral-400 uppercase">
							Identity_Verification_Protocol_v2.3.3
						</span>
					</div>
					<div className="flex gap-2">
						<div className="w-8 h-1 bg-neutral-400 dark:bg-neutral-600" />
						<div className="w-1 h-1 bg-neutral-400 dark:bg-neutral-600" />
					</div>
				</div>

				{/* Scan Lines Overlay */}
				<div className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%] opacity-20" />

				{/* Content Area */}
				<div className="p-8 relative z-10 min-h-[400px] flex flex-col">
					{children}
				</div>
			</div>

			{/* Decorative Elements around the terminal */}
			<div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-orange-500 opacity-50" />
			<div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-orange-500 opacity-50" />

			<motion.div
				animate={{ opacity: [0.3, 0.7, 0.3] }}
				transition={{ duration: 2, repeat: Infinity }}
				className="absolute -right-8 top-10 font-mono text-[9px] text-neutral-500 rotate-90 origin-left"
			>
				SECURE_CONNECTION_ESTABLISHED
			</motion.div>
		</motion.div>
	);
}
