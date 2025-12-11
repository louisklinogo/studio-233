"use client";

import { SwissIcons } from "@/components/ui/SwissIcons";

// Sub-component: Input Source / Queue
export function SourcePanel() {
	return (
		<div className="space-y-6">
			{/* Dropzone */}
			<div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-[4px] p-6 flex flex-col items-center justify-center gap-3 hover:border-[#FF4D00] hover:bg-[#FF4D00]/5 transition-all cursor-pointer group bg-neutral-100 dark:bg-[#1a1a1a]">
				<div className="w-10 h-10 rounded-full bg-white dark:bg-[#333] shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
					<SwissIcons.Upload
						size={18}
						className="text-neutral-400 group-hover:text-[#FF4D00]"
					/>
				</div>
				<div className="text-center">
					<p className="text-xs font-bold text-neutral-900 dark:text-white">
						Drop files to Stage
					</p>
					<p className="text-[9px] font-mono text-neutral-500 mt-1 uppercase">
						or click to browse
					</p>
				</div>
			</div>

			{/* Staged Files List (Mini InputQueue) */}
			<div className="space-y-3">
				<div className="flex justify-between items-end">
					<span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
						Staged Assets
					</span>
					<span className="text-[10px] font-mono font-bold text-[#FF4D00]">
						12 Ready
					</span>
				</div>

				<div className="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 rounded-[2px] divide-y divide-neutral-100 dark:divide-neutral-800">
					{[1, 2, 3, 4].map((i) => (
						<div
							key={i}
							className="flex items-center gap-3 p-2 hover:bg-neutral-50 dark:hover:bg-[#222]"
						>
							<div className="w-8 h-8 bg-neutral-200 dark:bg-[#333] rounded-[1px]" />
							<div className="flex-1 min-w-0">
								<p className="text-[10px] font-mono truncate text-neutral-700 dark:text-neutral-300">
									IMG_Shoe_00{i}.raw
								</p>
								<p className="text-[9px] text-neutral-400">2.4 MB</p>
							</div>
							<div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
