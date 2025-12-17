"use client";

import React, { useEffect, useState } from "react";

export const DataTicker = () => {
	const [stats, setStats] = useState({
		gpu: 84,
		jobs: 1204,
		agents: 3,
		latency: 45,
	});

	// Simulate live data
	useEffect(() => {
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
		<div className="fixed bottom-0 left-0 right-0 z-[100] h-8 bg-[#0a0a0a] border-t border-[#222] flex items-center justify-between px-4 md:px-6 font-mono text-[10px] uppercase tracking-widest text-neutral-500 select-none">
			{/* Left: System Status */}
			<div className="flex items-center gap-4">
				<div className="flex items-center gap-2">
					<div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
					<span className="text-neutral-400">SYSTEM ONLINE</span>
				</div>
				<div className="w-[1px] h-3 bg-[#333] hidden md:block" />
				<span className="hidden md:block">V.2.0.4</span>
			</div>

			{/* Center: Live Metrics */}
			<div className="flex items-center gap-6 md:gap-12">
				{/* GPU Load */}
				<div className="flex items-center gap-2">
					<span>GPU_LOAD</span>
					<span
						className={`transition-colors duration-300 ${stats.gpu > 90 ? "text-red-500" : "text-[#FF4D00]"}`}
					>
						{Math.round(stats.gpu)}%
					</span>
				</div>

				{/* Jobs */}
				<div className="hidden md:flex items-center gap-2">
					<span>JOBS</span>
					<span className="text-neutral-300">
						{stats.jobs.toLocaleString()}
					</span>
				</div>

				{/* Latency */}
				<div className="hidden md:flex items-center gap-2">
					<span>LATENCY</span>
					<span className="text-emerald-500">
						{Math.round(stats.latency)}ms
					</span>
				</div>
			</div>

			{/* Right: Region / Time */}
			<div className="flex items-center gap-4">
				<div className="hidden md:flex items-center gap-2">
					<span className="w-2 h-2 border border-neutral-700 rounded-sm flex items-center justify-center">
						<div className="w-1 h-1 bg-neutral-500" />
					</span>
					<span>US-EAST-1</span>
				</div>
				<div className="w-[1px] h-3 bg-[#333]" />
				<span className="text-neutral-300">STUDIO+233</span>
			</div>
		</div>
	);
};
