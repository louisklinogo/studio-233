"use client";

import { motion } from "framer-motion";

interface TelemetryBarProps {
	credits: {
		used: number;
		total: number;
	};
	tier: string;
}

export function TelemetryBar({ credits, tier }: TelemetryBarProps) {
	const percentage = Math.min((credits.used / credits.total) * 100, 100);
	const segments = 20;
	const activeSegments = Math.ceil((percentage / 100) * segments);

	return (
		<div className="flex flex-col md:flex-row gap-6 md:items-center border border-neutral-300 dark:border-neutral-800 bg-[#f4f4f0] dark:bg-[#111111] p-6 rounded-sm shadow-sm">
			<div className="flex-1 space-y-3">
				<div className="flex justify-between items-end">
					<span className="font-mono text-[10px] text-neutral-500 tracking-widest uppercase">
						Compute Allocation
					</span>
					<span className="font-mono text-xs text-neutral-900 dark:text-neutral-300">
						{credits.used} / {credits.total} CREDITS
					</span>
				</div>

				{/* Segmented LED Display */}
				<div className="h-4 w-full bg-neutral-800 dark:bg-black p-[2px] rounded-sm shadow-[inset_0_1px_4px_rgba(0,0,0,0.4)] flex gap-[2px]">
					{Array.from({ length: segments }).map((_, i) => (
						<div
							key={i}
							className={`flex-1 h-full rounded-[1px] transition-all duration-300 ${
								i < activeSegments
									? "bg-[#FF4D00] shadow-[0_0_4px_rgba(255,77,0,0.6)]"
									: "bg-[#333333] opacity-20"
							}`}
						/>
					))}
				</div>
			</div>

			{/* Physical Divider */}
			<div className="w-px h-12 bg-neutral-300 dark:bg-neutral-800 hidden md:block shadow-[1px_0_0_white] dark:shadow-[1px_0_0_rgba(255,255,255,0.05)]" />

			<div className="flex items-center gap-8">
				<div>
					<p className="font-mono text-[10px] text-neutral-500 tracking-widest uppercase mb-2">
						Plan Tier
					</p>
					{/* Physical Badge */}
					<div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-200 dark:bg-[#1a1a1a] border border-neutral-300 dark:border-neutral-700 rounded-sm shadow-inner">
						<div className="w-1.5 h-1.5 bg-neutral-900 dark:bg-white rounded-full" />
						<span className="text-xs font-bold text-neutral-900 dark:text-white tracking-wide">
							{tier}
						</span>
					</div>
				</div>
				<div>
					<p className="font-mono text-[10px] text-neutral-500 tracking-widest uppercase mb-2">
						System Status
					</p>
					{/* LED Status */}
					<div className="flex items-center gap-2">
						<div className="relative w-2 h-2">
							<div className="absolute inset-0 bg-[#22c55e] rounded-full animate-pulse opacity-50" />
							<div className="absolute inset-0.5 bg-[#22c55e] rounded-full shadow-[0_0_4px_#22c55e]" />
						</div>
						<span className="text-xs font-mono text-neutral-700 dark:text-neutral-300">
							NOMINAL
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
