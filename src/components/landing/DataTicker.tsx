"use client";

import React from "react";

export const DataTicker = () => {
	const [isExpanded, setIsExpanded] = React.useState(false);
	const [stats, setStats] = React.useState({
		gpu: 84,
		jobs: 1204,
		agents: 3,
		latency: 45,
	});

	// Simulate live data
	React.useEffect(() => {
		const interval = setInterval(() => {
			setStats((prev) => ({
				gpu: Math.min(99, Math.max(40, prev.gpu + (Math.random() * 10 - 5))),
				jobs: prev.jobs + (Math.random() > 0.7 ? 1 : 0),
				agents: 3,
				latency: Math.min(
					100,
					Math.max(20, prev.latency + (Math.random() * 10 - 5)),
				),
			}));
		}, 2000);
		return () => clearInterval(interval);
	}, []);

	return (
		<div
			className={`fixed bottom-0 right-0 z-50 transition-all duration-500 ease-in-out border-t border-l border-neutral-200 dark:border-neutral-800 bg-[#f4f4f0] dark:bg-[#0a0a0a] ${
				isExpanded ? "w-full md:w-96 h-auto" : "w-auto h-8"
			}`}
		>
			{/* Header / Toggle */}
			<button
				onClick={() => setIsExpanded(!isExpanded)}
				className="w-full h-8 flex items-center justify-between px-4 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors group"
			>
				<div className="flex items-center gap-2">
					<div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
					<span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 group-hover:text-[#FF4D00]">
						SYSTEM_STATUS
					</span>
				</div>
				<span className="font-mono text-[10px] text-neutral-400">
					{isExpanded ? "[-]" : "[+]"}
				</span>
			</button>

			{/* Expanded Content */}
			<div
				className={`overflow-hidden transition-all duration-500 ${
					isExpanded ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
				}`}
			>
				<div className="p-4 grid grid-cols-2 gap-4 font-mono text-xs">
					<div className="flex flex-col gap-1">
						<span className="text-neutral-400">GPU_LOAD</span>
						<div className="flex items-center gap-2">
							<div className="flex-1 h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
								<div
									className="h-full bg-[#FF4D00] transition-all duration-500"
									style={{ width: `${stats.gpu}%` }}
								/>
							</div>
							<span className="w-8 text-right">{Math.round(stats.gpu)}%</span>
						</div>
					</div>

					<div className="flex flex-col gap-1">
						<span className="text-neutral-400">JOBS_PROCESSED</span>
						<span className="text-lg">{stats.jobs.toLocaleString()}</span>
					</div>

					<div className="flex flex-col gap-1">
						<span className="text-neutral-400">ACTIVE_AGENTS</span>
						<div className="flex gap-1">
							{[...Array(stats.agents)].map((_, i) => (
								<div
									key={i}
									className="w-2 h-4 bg-emerald-500/50 border border-emerald-500"
								/>
							))}
						</div>
					</div>

					<div className="flex flex-col gap-1">
						<span className="text-neutral-400">LATENCY</span>
						<span>{Math.round(stats.latency)}ms</span>
					</div>
				</div>
			</div>
		</div>
	);
};
