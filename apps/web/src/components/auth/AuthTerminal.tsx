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
			<div className="relative w-full bg-[#111] border border-[#222] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.05)] rounded-[4px] overflow-hidden">
				{/* Ribbed Side Grips (Left) */}
				<div className="absolute left-0 top-12 bottom-12 w-1.5 flex flex-col gap-1 justify-center z-20">
					{[...Array(8)].map((_, i) => (
						<div
							key={i}
							className="w-full h-px bg-black/40 border-t border-white/5"
						/>
					))}
				</div>
				{/* Ribbed Side Grips (Right) */}
				<div className="absolute right-0 top-12 bottom-12 w-1.5 flex flex-col gap-1 justify-center z-20">
					{[...Array(8)].map((_, i) => (
						<div
							key={i}
							className="w-full h-px bg-black/40 border-t border-white/5"
						/>
					))}
				</div>

				{/* Top Status Strip */}
				<div className="h-3 w-full bg-[#0a0a0a] border-b border-[#222] flex items-center justify-between px-3">
					<div className="flex gap-1.5">
						<div className="w-4 h-[1px] bg-neutral-800" />
						<div className="w-1.5 h-[1px] bg-neutral-800" />
					</div>
					<div className="flex items-center gap-2">
						<span className="font-mono text-[7px] text-neutral-600 tracking-tighter uppercase">
							Terminal_Sync
						</span>
						<div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
					</div>
				</div>

				{/* Content Area */}
				<div className="p-8 relative z-10 min-h-[420px] flex flex-col bg-[#111]/50 backdrop-blur-sm overflow-hidden">
					{/* CRT Scanline Overlay for Terminal Feel */}
					<div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
					{children}
				</div>

				{/* Bottom Ridge */}
				<div className="h-1.5 w-full bg-[#0a0a0a] border-t border-[#222]" />
			</div>

			{/* Corner Accents */}
			<div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-border opacity-40" />
			<div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-border opacity-40" />
			<div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-border opacity-40" />
			<div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-border opacity-40" />
		</motion.div>
	);
}
