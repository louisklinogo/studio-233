"use client";

import { SwissIcons } from "@/components/ui/SwissIcons";

// Sub-component: Configuration Controls
export function ConfigPanel({ type }: { type?: string }) {
	return (
		<div className="space-y-6">
			{/* Generic Controls simulating physical hardware */}

			<div className="space-y-2">
				<label className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
					Operation Mode
				</label>
				<div className="flex bg-neutral-200 dark:bg-[#222] p-1 rounded-[4px] border border-neutral-300 dark:border-neutral-700">
					<button className="flex-1 py-1.5 text-[10px] font-bold uppercase rounded-[2px] bg-white dark:bg-[#333] shadow-sm">
						Fast
					</button>
					<button className="flex-1 py-1.5 text-[10px] font-bold uppercase text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
						Quality
					</button>
				</div>
			</div>

			<div className="space-y-2">
				<label className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
					Threshold Level
				</label>
				<div className="flex items-center gap-4">
					<div className="relative w-12 h-12 rounded-full bg-neutral-200 dark:bg-[#222] border border-neutral-300 dark:border-neutral-700 shadow-inner flex items-center justify-center">
						<div className="absolute top-1 w-1 h-3 bg-[#FF4D00] rounded-full" />
					</div>
					<input
						type="range"
						className="flex-1 accent-[#FF4D00] h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full appearance-none"
					/>
					<span className="font-mono text-xs font-bold w-8 text-right">
						85%
					</span>
				</div>
			</div>

			{type === "standard" && (
				<div className="space-y-2">
					<label className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
						System Prompt
					</label>
					<textarea
						className="w-full h-32 bg-white dark:bg-[#1a1a1a] border border-neutral-300 dark:border-neutral-700 rounded-[2px] p-3 text-xs font-mono resize-none focus:outline-none focus:border-[#FF4D00]"
						placeholder="Enter system instructions..."
						defaultValue="Analyze the image and extract key fashion attributes including color, style, and material."
					/>
				</div>
			)}
		</div>
	);
}
