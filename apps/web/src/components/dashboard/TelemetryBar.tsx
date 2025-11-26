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

	return (
		<div className="flex flex-col md:flex-row gap-6 md:items-center border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-950/50 p-6">
			<div className="flex-1 space-y-2">
				<div className="flex justify-between items-end">
					<span className="font-mono text-[10px] text-neutral-500 tracking-widest uppercase">
						Compute Allocation
					</span>
					<span className="font-mono text-xs text-neutral-900 dark:text-neutral-300">
						{credits.used} / {credits.total} CREDITS
					</span>
				</div>
				<div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
					<motion.div
						initial={{ width: 0 }}
						animate={{ width: `${percentage}%` }}
						transition={{ duration: 1, ease: "circOut" }}
						className="h-full bg-[#FF4D00]"
					/>
				</div>
			</div>

			<div className="w-px h-10 bg-neutral-200 dark:bg-neutral-900 hidden md:block" />

			<div className="flex items-center gap-6">
				<div>
					<p className="font-mono text-[10px] text-neutral-500 tracking-widest uppercase mb-1">
						Plan Tier
					</p>
					<div className="inline-flex items-center gap-2 px-2 py-1 bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10">
						<div className="w-1.5 h-1.5 bg-neutral-900 dark:bg-white rounded-full" />
						<span className="text-xs font-bold text-neutral-900 dark:text-white tracking-wide">
							{tier}
						</span>
					</div>
				</div>
				<div>
					<p className="font-mono text-[10px] text-neutral-500 tracking-widest uppercase mb-1">
						System Status
					</p>
					<div className="flex items-center gap-2">
						<div className="w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-pulse" />
						<span className="text-xs font-mono text-[#22c55e]">NOMINAL</span>
					</div>
				</div>
			</div>
		</div>
	);
}
