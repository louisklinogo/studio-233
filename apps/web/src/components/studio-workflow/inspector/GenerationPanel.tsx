"use client";

import { useState } from "react";
import { SwissIcons } from "@/components/ui/SwissIcons";

export function GenerationPanel() {
	const [strength, setStyleStrength] = useState(0.75);
	const [seed, setSeed] = useState(123456);
	const [showNegative, setShowNegative] = useState(false);

	return (
		<div className="space-y-6">
			{/* Positive Prompt */}
			<div className="space-y-2">
				<label className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
					Positive Prompt
				</label>
				<textarea
					className="w-full h-24 bg-white dark:bg-[#1a1a1a] border border-neutral-300 dark:border-neutral-700 rounded-[2px] p-3 text-xs font-mono resize-none focus:outline-none focus:border-[#FF4D00]"
					placeholder="Describe the desired output..."
					defaultValue="Professional studio photography, fashion editorial, 8k resolution, highly detailed texture"
				/>
			</div>

			{/* Negative Prompt (Collapsible) */}
			<div className="space-y-2">
				<button
					onClick={() => setShowNegative(!showNegative)}
					className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
				>
					{showNegative ? (
						<SwissIcons.ChevronDown size={10} />
					) : (
						<SwissIcons.ChevronRight size={10} />
					)}
					Negative Prompt
				</button>

				{showNegative && (
					<textarea
						className="w-full h-16 bg-white dark:bg-[#1a1a1a] border border-neutral-300 dark:border-neutral-700 rounded-[2px] p-3 text-xs font-mono resize-none focus:outline-none focus:border-[#FF4D00]"
						placeholder="What to avoid..."
						defaultValue="blurry, low quality, artifacts, distortion, ugly"
					/>
				)}
			</div>

			{/* Reference Image Dropzone */}
			<div className="space-y-2">
				<label className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
					Style Reference
				</label>
				<div className="h-20 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-[2px] flex items-center justify-center gap-2 hover:bg-neutral-50 dark:hover:bg-[#1a1a1a]/50 cursor-pointer transition-colors">
					<SwissIcons.Image size={14} className="text-neutral-400" />
					<span className="text-[9px] font-mono text-neutral-400 uppercase">
						Drop Ref Image
					</span>
				</div>
			</div>

			{/* Style Strength */}
			<div className="space-y-2">
				<div className="flex justify-between items-center">
					<label className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
						Style Strength
					</label>
					<span className="text-[10px] font-mono font-bold">
						{strength.toFixed(2)}
					</span>
				</div>
				<input
					type="range"
					min="0"
					max="1"
					step="0.05"
					value={strength}
					onChange={(e) => setStyleStrength(Number(e.target.value))}
					className="w-full accent-[#FF4D00] h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full appearance-none cursor-pointer"
				/>
			</div>

			{/* Seed */}
			<div className="space-y-2">
				<label className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
					Seed
				</label>
				<div className="flex gap-2">
					<input
						type="number"
						value={seed}
						onChange={(e) => setSeed(Number(e.target.value))}
						className="flex-1 h-8 bg-white dark:bg-[#1a1a1a] border border-neutral-300 dark:border-neutral-700 rounded-[2px] px-3 text-xs font-mono focus:border-[#FF4D00] focus:outline-none"
					/>
					<button
						onClick={() => setSeed(Math.floor(Math.random() * 999999))}
						className="w-8 h-8 flex items-center justify-center bg-neutral-200 dark:bg-[#222] hover:bg-neutral-300 dark:hover:bg-[#333] rounded-[2px] transition-colors"
						title="Randomize"
					>
						<SwissIcons.Refresh size={12} />
					</button>
				</div>
			</div>
		</div>
	);
}
