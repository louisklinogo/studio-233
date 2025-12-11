"use client";

import { useState } from "react";
import { SwissIcons } from "@/components/ui/SwissIcons";

export function GatePanel() {
	const [strictness, setStrictness] = useState("high");

	return (
		<div className="space-y-6">
			{/* Validation Rule */}
			<div className="space-y-2">
				<label className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
					Validation Rule
				</label>
				<div className="relative">
					<textarea
						className="w-full h-32 bg-white dark:bg-[#1a1a1a] border border-neutral-300 dark:border-neutral-700 rounded-[2px] p-3 text-xs font-mono resize-none focus:outline-none focus:border-[#FF4D00]"
						placeholder="Define acceptance criteria..."
						defaultValue="Image must contain a clear product shot on a white background. No watermarks. High resolution."
					/>
					<div className="absolute bottom-2 right-2">
						<SwissIcons.Check size={12} className="text-[#00C040]" />
					</div>
				</div>
				<p className="text-[9px] text-neutral-400">
					Natural language rules are parsed by the Vision LLM.
				</p>
			</div>

			{/* Strictness Level */}
			<div className="space-y-2">
				<label className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
					Strictness Level
				</label>
				<div className="flex bg-neutral-200 dark:bg-[#222] p-1 rounded-[4px] border border-neutral-300 dark:border-neutral-700">
					{["low", "med", "high"].map((level) => (
						<button
							key={level}
							onClick={() => setStrictness(level)}
							className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-[2px] transition-all ${
								strictness === level
									? "bg-white dark:bg-[#333] shadow-sm text-neutral-900 dark:text-white"
									: "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
							}`}
						>
							{level}
						</button>
					))}
				</div>
			</div>

			{/* Fallback Action */}
			<div className="space-y-2">
				<label className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
					If Uncertain
				</label>
				<div className="flex items-center gap-2">
					<div className="w-4 h-4 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1a1a1a] flex items-center justify-center">
						<div className="w-2 h-2 bg-[#FF4D00] rounded-[1px]" />
					</div>
					<span className="text-xs font-medium">Flag for Human Review</span>
				</div>
			</div>
		</div>
	);
}
