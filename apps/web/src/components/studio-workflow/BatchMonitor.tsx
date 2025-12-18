"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";

export function BatchMonitor({
	projectId,
	runId,
}: {
	projectId: string;
	runId?: string | null;
}) {
	const trpc = useTRPC();
	const runsQuery = useQuery({
		...trpc.workflow.listRuns.queryOptions({ projectId }),
		refetchInterval: 4000,
		refetchOnWindowFocus: false,
	});
	const statusQuery = useQuery({
		...trpc.workflow.runStatus.queryOptions({ runId: runId ?? "" }),
		enabled: Boolean(runId),
		refetchInterval: runId ? 2500 : false,
		refetchOnWindowFocus: false,
	});

	const activeRun = statusQuery.data;
	const activeProgress = useMemo(() => {
		if (!activeRun?.steps?.length) {
			return { completed: 0, total: 0, percent: 0 };
		}
		const total = activeRun.steps.length;
		const completed = activeRun.steps.filter(
			(s: any) => s.state === "COMPLETED",
		).length;
		const percent = total ? Math.round((completed / total) * 100) : 0;
		return { completed, total, percent };
	}, [activeRun?.steps]);

	const rows = useMemo(() => {
		return (runsQuery.data ?? []).map((run: any) => {
			const timestamp = run.createdAt
				? new Date(run.createdAt).toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
						second: "2-digit",
					})
				: "";
			return {
				id: run.id,
				status: String(run.state).toLowerCase(),
				timestamp,
			};
		});
	}, [runsQuery.data]);

	return (
		<div className="w-full h-full bg-[#f4f4f0] dark:bg-[#111] flex flex-col font-mono relative overflow-hidden">
			{/* Background Grid */}
			<div
				className="absolute inset-0 opacity-[0.03] dark:opacity-[0.1] pointer-events-none"
				style={{
					backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
					backgroundSize: "20px 20px",
				}}
			/>

			{/* TOP DECK: Telemetry (Active Run) */}
			<div className="h-1/2 p-8 flex flex-col justify-center border-b border-neutral-300 dark:border-neutral-800 relative">
				<div className="absolute top-4 left-4 text-[10px] uppercase tracking-widest text-neutral-400">
					Current_Operation // {activeRun?.id || "IDLE"}
				</div>

				{activeRun ? (
					<div className="flex items-end justify-between gap-12">
						{/* Main Counter */}
						<div className="flex-1">
							<div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
								Processing_Queue
							</div>
							<div className="text-8xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tighter leading-none">
								{activeProgress.completed}
								<span className="text-2xl text-neutral-400 ml-2">
									/ {activeProgress.total}
								</span>
							</div>
							{/* Progress Bar (Industrial) */}
							<div className="h-2 w-full bg-neutral-200 dark:bg-neutral-800 mt-6 relative overflow-hidden">
								<motion.div
									initial={{ width: 0 }}
									animate={{
										width: `${activeProgress.percent}%`,
									}}
									className="absolute inset-y-0 left-0 bg-[#FF4D00]"
								/>
								{/* Tick marks */}
								<div className="absolute inset-0 flex justify-between px-px">
									{[...Array(10)].map((_, i) => (
										<div
											key={i}
											className="w-px h-full bg-[#f4f4f0] dark:bg-[#111]"
										/>
									))}
								</div>
							</div>
						</div>

						{/* Secondary Meters */}
						<div className="flex flex-col gap-6 min-w-[200px]">
							<div>
								<div className="flex justify-between text-[10px] uppercase tracking-widest text-neutral-500 mb-1">
									<span>Yield_Rate</span>
									<span className="text-[#00C040]">100%</span>
								</div>
								<div className="h-1 w-full bg-neutral-200 dark:bg-neutral-800">
									<div className="h-full w-full bg-[#00C040]" />
								</div>
							</div>
							<div>
								<div className="flex justify-between text-[10px] uppercase tracking-widest text-neutral-500 mb-1">
									<span>Avg_Latency</span>
									<span>—</span>
								</div>
								<div className="h-1 w-full bg-neutral-200 dark:bg-neutral-800">
									<div className="h-full w-[35%] bg-neutral-400" />
								</div>
							</div>
						</div>
					</div>
				) : (
					<div className="flex flex-col items-center justify-center opacity-50">
						<div className="w-16 h-16 border-2 border-neutral-300 dark:border-neutral-700 rounded-full flex items-center justify-center mb-4">
							<div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse" />
						</div>
						<div className="text-sm tracking-widest uppercase">System Idle</div>
					</div>
				)}
			</div>

			{/* BOTTOM DECK: The Tape (History) */}
			<div className="flex-1 bg-[#e5e5e5] dark:bg-[#0a0a0a] flex flex-col">
				<div className="h-8 flex items-center px-4 border-b border-neutral-300 dark:border-neutral-800 bg-neutral-200 dark:bg-[#151515]">
					<span className="text-[9px] uppercase tracking-widest text-neutral-500">
						Log_Tape // History
					</span>
				</div>

				<div className="flex-1 overflow-y-auto p-0">
					<table className="w-full text-left text-xs">
						<thead className="bg-[#f4f4f0] dark:bg-[#111] border-b border-neutral-300 dark:border-neutral-800 text-[9px] uppercase text-neutral-500 sticky top-0">
							<tr>
								<th className="px-4 py-2 font-normal w-24">ID</th>
								<th className="px-4 py-2 font-normal w-24">Time</th>
								<th className="px-4 py-2 font-normal">Status</th>
								<th className="px-4 py-2 font-normal text-right">Items</th>
								<th className="px-4 py-2 font-normal text-right">Yield</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
							{rows.map((run) => (
								<tr
									key={run.id}
									className="group hover:bg-white dark:hover:bg-[#1a1a1a] transition-colors cursor-default"
								>
									<td className="px-4 py-3 font-mono text-neutral-400 group-hover:text-[#FF4D00]">
										{run.id}
									</td>
									<td className="px-4 py-3 text-neutral-500">
										{run.timestamp}
									</td>
									<td className="px-4 py-3">
										<StatusBadge status={run.status} />
									</td>
									<td className="px-4 py-3 text-right tabular-nums text-neutral-600 dark:text-neutral-300">
										—
									</td>
									<td className="px-4 py-3 text-right tabular-nums text-neutral-600 dark:text-neutral-300">
										—
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}

function StatusBadge({ status }: { status: string }) {
	const styles = {
		pending: "bg-transparent text-neutral-500 border-neutral-400 border-dashed",
		running: "bg-[#FFB800] text-black border-[#FFB800]",
		completed: "bg-[#00C040] text-white border-[#00C040]",
		failed: "bg-transparent text-[#E03C31] border-[#E03C31] border-dashed",
		canceled:
			"bg-transparent text-neutral-500 border-neutral-400 border-dashed",
	};

	return (
		<span
			className={cn(
				"inline-flex items-center px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-bold border rounded-[1px]",
				styles[status as keyof typeof styles] ?? styles.pending,
			)}
		>
			{status}
		</span>
	);
}
