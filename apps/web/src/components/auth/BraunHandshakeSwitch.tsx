"use client";

import { motion } from "framer-motion";
import React from "react";

interface BraunHandshakeSwitchProps {
	mode: "federated" | "email";
	onChange: (mode: "federated" | "email") => void;
}

export function BraunHandshakeSwitch({
	mode,
	onChange,
}: BraunHandshakeSwitchProps) {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex justify-between items-end mb-2">
				<span className="font-mono text-[9px] text-neutral-500 uppercase tracking-widest">
					Authentication_Protocol
				</span>
				<span className="font-mono text-[9px] text-[#FF4D00] uppercase tracking-widest font-bold">
					{mode === "federated" ? "EXTERNAL_RELAY" : "DIRECT_ACCESS"}
				</span>
			</div>

			<div className="relative w-full h-12 bg-[#050505] border border-[#1a1a1a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] flex items-center p-1 group">
				{/* Background Track Details */}
				<div className="absolute inset-0 flex justify-between px-12 pointer-events-none opacity-10">
					{[...Array(8)].map((_, i) => (
						<div key={i} className="w-[1px] h-full bg-white" />
					))}
				</div>

				{/* Labels */}
				<div className="absolute inset-0 flex justify-between items-center px-6 pointer-events-none">
					<span
						className={`font-mono text-[10px] uppercase tracking-tighter transition-colors duration-500 ${mode === "federated" ? "text-white" : "text-neutral-700"}`}
					>
						FEDERATED
					</span>
					<span
						className={`font-mono text-[10px] uppercase tracking-tighter transition-colors duration-500 ${mode === "email" ? "text-white" : "text-neutral-700"}`}
					>
						DIRECT
					</span>
				</div>

				{/* Sliding Knob */}
				<motion.button
					onClick={() => onChange(mode === "federated" ? "email" : "federated")}
					animate={{ x: mode === "federated" ? "0%" : "calc(100% - 40px)" }}
					transition={{ type: "spring", stiffness: 300, damping: 30 }}
					className="relative z-10 w-10 h-10 bg-[#1a1a1a] border-t border-l border-white/5 border-b border-r border-black shadow-lg flex items-center justify-center cursor-pointer group-hover:border-[#FF4D00]/20 transition-colors"
				>
					{/* Knob Grip Lines */}
					<div className="flex flex-col gap-1">
						{[...Array(3)].map((_, i) => (
							<div
								key={i}
								className="w-4 h-[1px] bg-neutral-700 group-hover:bg-[#FF4D00]/50 transition-colors"
							/>
						))}
					</div>

					{/* Active Indicator LED */}
					<div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-[#FF4D00] shadow-[0_0_5px_#FF4D00]" />
				</motion.button>
			</div>
		</div>
	);
}
