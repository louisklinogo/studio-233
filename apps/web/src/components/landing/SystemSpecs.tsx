"use client";

import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

const LOGS = [
	{ id: 1, type: "INFO", msg: "INITIALIZING_NEURAL_CORE_v2.5" },
	{ id: 2, type: "SUCCESS", msg: "GPU_CLUSTER_DETECTED [x8 H100]" },
	{ id: 3, type: "WARN", msg: "OPTIMIZING_LATENT_SPACE..." },
	{ id: 4, type: "INFO", msg: "LOADING_LORA_WEIGHTS: 'INDUSTRIAL_SWISS'" },
	{ id: 5, type: "SUCCESS", msg: "BATCH_PIPELINE_READY" },
	{ id: 6, type: "INFO", msg: "AWAITING_INPUT_STREAM" },
];

const METRICS = [
	{ label: "VRAM_USAGE", value: 24, unit: "GB", max: 80 },
	{ label: "THROUGHPUT", value: 1420, unit: "IMG/HR", max: 2000 },
	{ label: "LATENCY", value: 12, unit: "MS", max: 100 },
];

function TerminalLog() {
	const [logs, setLogs] = useState(LOGS);

	useEffect(() => {
		const interval = setInterval(() => {
			// Simulate live logs by cycling/randomizing slightly
			const newLog = {
				id: Date.now(),
				type: Math.random() > 0.8 ? "WARN" : "INFO",
				msg: `PROCESS_ID_${Math.floor(Math.random() * 9999)
					.toString(16)
					.toUpperCase()}_EXECUTED`,
			};
			setLogs((prev) => [...prev.slice(1), newLog]);
		}, 2000);
		return () => clearInterval(interval);
	}, []);

	return (
		<div className="flex flex-col gap-1.5 font-mono text-[10px] text-neutral-500 h-[140px] overflow-hidden mask-gradient-b">
			{logs.map((log) => (
				<motion.div
					key={log.id}
					initial={{ opacity: 0, x: -10 }}
					animate={{ opacity: 1, x: 0 }}
					className="flex items-center gap-3 whitespace-nowrap"
				>
					<span className="text-neutral-700">
						{new Date().toISOString().split("T")[1].slice(0, 8)}
					</span>
					<span
						className={`${
							log.type === "SUCCESS"
								? "text-[#FF4D00]"
								: log.type === "WARN"
									? "text-yellow-600"
									: "text-neutral-600"
						}`}
					>
						[{log.type}]
					</span>
					<span>{log.msg}</span>
				</motion.div>
			))}
		</div>
	);
}

function LiveMetric({
	label,
	unit,
	max,
}: {
	label: string;
	value: number;
	unit: string;
	max: number;
}) {
	const [val, setVal] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setVal(Math.floor(Math.random() * (max * 0.2)) + max * 0.7); // Jitter around 70-90%
		}, 800);
		return () => clearInterval(interval);
	}, [max]);

	return (
		<div className="flex flex-col gap-2 p-4 border border-neutral-800 bg-neutral-900/20">
			<div className="flex justify-between items-center">
				<span className="font-mono text-[9px] text-neutral-500 tracking-widest">
					{label}
				</span>
				<div className="flex items-baseline gap-1">
					<span className="font-mono text-xl text-white font-medium">
						{val}
					</span>
					<span className="font-mono text-[9px] text-neutral-600">{unit}</span>
				</div>
			</div>
			{/* Progress Bar */}
			<div className="w-full h-1 bg-neutral-800 overflow-hidden relative">
				<motion.div
					className="h-full bg-[#FF4D00]"
					animate={{ width: `${(val / max) * 100}%` }}
					transition={{ type: "spring", stiffness: 50 }}
				/>
			</div>
		</div>
	);
}

export const SystemSpecs = () => {
	return (
		<div className="w-full h-full flex flex-col justify-between p-6 md:p-8 bg-neutral-950/50 border-l border-neutral-800 relative">
			{/* Header */}
			<div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
				<div className="flex flex-col gap-1">
					<span className="font-mono text-[9px] text-[#FF4D00] tracking-[0.3em] uppercase">
						TELEMETRY_DECK
					</span>
					<h3 className="font-sans text-sm font-medium text-white tracking-tight">
						System Diagnostics
					</h3>
				</div>
				<div className="w-2 h-2 bg-[#FF4D00] animate-pulse rounded-full shadow-[0_0_8px_#FF4D00]" />
			</div>

			{/* Metrics Grid */}
			<div className="grid grid-cols-1 gap-3 mb-6">
				{METRICS.map((m) => (
					<LiveMetric key={m.label} {...m} />
				))}
			</div>

			{/* Terminal Log */}
			<div className="flex-1 min-h-0 border-t border-neutral-800 pt-4">
				<span className="block font-mono text-[8px] text-neutral-600 mb-3 tracking-[0.2em]">
					KERNEL_LOG_OUTPUT
				</span>
				<TerminalLog />
			</div>

			{/* Footer Decorative */}
			<div className="absolute bottom-0 right-0 p-2 opacity-20">
				<svg width="40" height="40" viewBox="0 0 40 40">
					<path
						d="M40 40L0 40L40 0V40Z"
						fill="none"
						stroke="currentColor"
						strokeWidth="1"
					/>
				</svg>
			</div>
		</div>
	);
};
