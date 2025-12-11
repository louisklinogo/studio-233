"use client";

import { useState } from "react";
import { SwissIcons } from "@/components/ui/SwissIcons";

export function VisionPanel() {
	const [model, setModel] = useState("birefnet");
	const [threshold, setThreshold] = useState(85);
	const [dilation, setDilation] = useState(2);
	const [format, setFormat] = useState("png");

	return (
		<div className="space-y-6">
			{/* AI Model Selection */}
			<div className="space-y-2">
				<label className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
					AI Model
				</label>
				<div className="relative">
					<select
						value={model}
						onChange={(e) => setModel(e.target.value)}
						className="w-full h-8 bg-white dark:bg-[#1a1a1a] border border-neutral-300 dark:border-neutral-700 rounded-[2px] px-3 text-xs font-mono appearance-none focus:border-[#FF4D00] focus:outline-none"
					>
						<option value="birefnet">BiRefNet (General)</option>
						<option value="gemini-2.5">Gemini 2.5 (Complex)</option>
						<option value="sam-2">SAM 2 (Segment)</option>
					</select>
					<div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
						<SwissIcons.ChevronDown size={10} />
					</div>
				</div>
			</div>

			{/* Confidence Threshold */}
			<div className="space-y-2">
				<label className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
					Confidence Threshold
				</label>
				<div className="flex items-center gap-4">
					<div className="relative w-10 h-10 rounded-full bg-neutral-200 dark:bg-[#222] border border-neutral-300 dark:border-neutral-700 shadow-inner flex items-center justify-center flex-shrink-0">
						<div
							className="absolute bottom-0 left-0 right-0 bg-[#FF4D00]/20 rounded-b-full transition-all"
							style={{ height: `${threshold}%` }}
						/>
						<span className="relative z-10 text-[9px] font-mono font-bold text-[#FF4D00]">
							{threshold}
						</span>
					</div>
					<input
						type="range"
						min="0"
						max="100"
						value={threshold}
						onChange={(e) => setThreshold(Number(e.target.value))}
						className="flex-1 accent-[#FF4D00] h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full appearance-none cursor-pointer"
					/>
				</div>
			</div>

			{/* Mask Dilation */}
			<div className="space-y-2">
				<div className="flex justify-between items-center">
					<label className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
						Mask Dilation (px)
					</label>
					<span className="text-[10px] font-mono font-bold">{dilation}px</span>
				</div>
				<input
					type="range"
					min="0"
					max="20"
					value={dilation}
					onChange={(e) => setDilation(Number(e.target.value))}
					className="w-full accent-[#FF4D00] h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full appearance-none cursor-pointer"
				/>
				<p className="text-[9px] text-neutral-400">
					Expands the mask edge to fix halo artifacts.
				</p>
			</div>

			{/* Output Format */}
			<div className="space-y-2">
				<label className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
					Output Format
				</label>
				<div className="flex bg-neutral-200 dark:bg-[#222] p-1 rounded-[4px] border border-neutral-300 dark:border-neutral-700">
					<button
						onClick={() => setFormat("png")}
						className={cn(
							"flex-1 py-1.5 text-[10px] font-bold uppercase rounded-[2px] transition-all",
							format === "png"
								? "bg-white dark:bg-[#333] shadow-sm text-neutral-900 dark:text-white"
								: "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300",
						)}
					>
						PNG
					</button>
					<button
						onClick={() => setFormat("jpg")}
						className={cn(
							"flex-1 py-1.5 text-[10px] font-bold uppercase rounded-[2px] transition-all",
							format === "jpg"
								? "bg-white dark:bg-[#333] shadow-sm text-neutral-900 dark:text-white"
								: "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300",
						)}
					>
						JPG
					</button>
				</div>
			</div>
		</div>
	);
}

function cn(...classes: (string | undefined | null | false)[]) {
	return classes.filter(Boolean).join(" ");
}
