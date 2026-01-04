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
		<div className="flex flex-col gap-6">
			<div className="flex justify-between items-end">
				<div className="flex flex-col gap-1">
					<span className="font-mono text-[8px] text-neutral-400 uppercase tracking-widest">
						Selector_Bank
					</span>
					<span className="font-bold text-[10px] text-[#1a1a1a] tracking-tight uppercase">
						Auth_Source_Channel
					</span>
				</div>
				<div className="flex items-center gap-2">
					<span className="font-mono text-[8px] text-[#FF4D00] uppercase font-bold">
						{mode === "federated" ? "CH_01: RELAY" : "CH_02: DIRECT"}
					</span>
				</div>
			</div>

			<div className="flex gap-4 p-4 bg-[#efefe9] border border-[#e5e5e0] rounded-[2px] shadow-inner">
				{/* Federated Auth Button */}
				<button
					onClick={() => onChange("federated")}
					className="flex-1 group relative"
				>
					<div
						className={`
						h-12 w-full transition-all duration-300 flex items-center justify-center
						${
							mode === "federated"
								? "bg-[#dadad0] shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] translate-y-[1px]"
								: "bg-white border-b-4 border-neutral-300 shadow-md hover:border-neutral-400 active:translate-y-1 active:border-b-0"
						}
					`}
					>
						<span
							className={`font-mono text-[9px] uppercase tracking-[0.2em] font-bold ${mode === "federated" ? "text-[#FF4D00]" : "text-neutral-500"}`}
						>
							External
						</span>
					</div>
					{mode === "federated" && (
						<motion.div
							layoutId="led"
							className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#FF4D00] shadow-[0_0_5px_#FF4D00]"
						/>
					)}
				</button>

				{/* Direct Access Button */}
				<button
					onClick={() => onChange("email")}
					className="flex-1 group relative"
				>
					<div
						className={`
						h-12 w-full transition-all duration-300 flex items-center justify-center
						${
							mode === "email"
								? "bg-[#dadad0] shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] translate-y-[1px]"
								: "bg-white border-b-4 border-neutral-300 shadow-md hover:border-neutral-400 active:translate-y-1 active:border-b-0"
						}
					`}
					>
						<span
							className={`font-mono text-[9px] uppercase tracking-[0.2em] font-bold ${mode === "email" ? "text-[#FF4D00]" : "text-neutral-500"}`}
						>
							Direct
						</span>
					</div>
					{mode === "email" && (
						<motion.div
							layoutId="led"
							className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#FF4D00] shadow-[0_0_5px_#FF4D00]"
						/>
					)}
				</button>
			</div>
		</div>
	);
}
