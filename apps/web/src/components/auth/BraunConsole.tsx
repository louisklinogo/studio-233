import { motion } from "framer-motion";
import React from "react";

export function BraunConsole({ children }: { children: React.ReactNode }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
			className="relative w-full max-w-lg"
		>
			{/* Physical Body */}
			<div className="relative w-full bg-[#f4f4f0] border border-[#e5e5e0] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1),0_20px_40px_-10px_rgba(0,0,0,0.05)] rounded-[2px] overflow-hidden">
				{/* Machine Parting Line (Industrial Detail) */}
				<div className="absolute top-12 left-0 right-0 h-px bg-[#e5e5e0]" />

				{/* Top Vent/Grill Details */}
				<div className="h-12 w-full flex items-center justify-between px-8 bg-[#efefe9]">
					<div className="flex gap-1">
						{[...Array(5)].map((_, i) => (
							<div key={i} className="w-[2px] h-3 bg-[#dadad0]" />
						))}
					</div>
					<div className="flex items-center gap-4">
						<span className="font-mono text-[8px] text-neutral-400 tracking-[0.2em] uppercase">
							Studio_Console // 233
						</span>
						<div className="w-1.5 h-1.5 rounded-full bg-[#FF4D00] shadow-[0_0_8px_rgba(255,77,0,0.4)]" />
					</div>
				</div>

				{/* Interaction Area */}
				<div className="p-10 pt-16 relative z-10 min-h-[400px]">{children}</div>

				{/* Bottom Service Port (Subtle Detail) */}
				<div className="h-10 w-full bg-[#efefe9] border-t border-[#e5e5e0] flex items-center px-8 justify-end">
					<div className="flex gap-2">
						<div className="w-6 h-1 bg-[#dadad0] rounded-full" />
						<div className="w-2 h-1 bg-[#dadad0] rounded-full" />
					</div>
				</div>
			</div>

			{/* Physical Shadow/Glow */}
			<div className="absolute -inset-4 bg-white/50 blur-3xl -z-10 opacity-50" />
		</motion.div>
	);
}
