"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { cn } from "@/lib/utils";

interface MissionControlProps {
	isOpen: boolean;
	onClose: () => void;
	onSelectWorkflow: (id: string) => void;
	onCreateNew: (type: "blank" | "ai" | "template") => void;
	workflows: Array<{
		id: string;
		name?: string | null;
		updatedAt?: Date | string | null;
		nodes?: unknown;
	}>;
}

export function MissionControl({
	isOpen,
	onClose,
	onSelectWorkflow,
	onCreateNew,
	workflows,
}: MissionControlProps) {
	const [mode, setMode] = useState<"menu" | "create">("menu");

	const recentWorkflows = workflows.slice(0, 10).map((wf) => {
		const updatedAt =
			wf.updatedAt instanceof Date
				? wf.updatedAt
				: wf.updatedAt
					? new Date(wf.updatedAt)
					: null;
		const nodeCount = Array.isArray(wf.nodes) ? wf.nodes.length : 0;
		return {
			id: wf.id,
			name: wf.name ?? "Untitled",
			updatedAt,
			nodes: nodeCount,
		};
	});

	const formatUpdated = (date: Date | null) => {
		if (!date) return "";
		const diffMs = Date.now() - date.getTime();
		const diffMin = Math.round(diffMs / 60_000);
		if (diffMin < 1) return "now";
		if (diffMin < 60) return `${diffMin}m ago`;
		const diffHr = Math.round(diffMin / 60);
		if (diffHr < 24) return `${diffHr}h ago`;
		const diffDay = Math.round(diffHr / 24);
		return `${diffDay}d ago`;
	};

	return (
		<div className="fixed top-[60px] left-6 z-[60]">
			{/* Backdrop for closing */}
			{isOpen && <div className="fixed inset-0 z-[-1]" onClick={onClose} />}

			<div
				className={cn(
					"bg-[#f4f4f0] dark:bg-[#0a0a0a]",
					"min-w-[320px] max-w-sm",
					"border border-neutral-200 dark:border-neutral-800 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)]",
				)}
			>
				{/* Header / Title Plate */}
				<button
					onClick={isOpen ? onClose : () => {}}
					className="w-full text-left px-6 py-5 flex items-center justify-between group"
				>
					<div className="flex flex-col gap-1">
						<span className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#FF4D00]">
							SYS_CONTROL
						</span>
						<div className="text-sm font-bold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
							OPERATIONS
							<SwissIcons.ChevronDown
								className={cn(
									"w-3 h-3 text-neutral-400 transition-transform duration-300",
									isOpen && "rotate-180",
								)}
							/>
						</div>
					</div>

					{/* Status LED */}
					<div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
				</button>

				{/* Dropdown Content */}
				<AnimatePresence>
					{isOpen && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
							className="overflow-hidden"
						>
							<div className="px-6 pb-6 pt-2">
								{mode === "menu" ? (
									<div className="flex flex-col gap-6">
										{/* Primary Actions */}
										<div className="flex flex-col gap-2">
											<button
												onClick={() => setMode("create")}
												className="flex items-center justify-between p-3 bg-white dark:bg-[#111] border border-neutral-200 dark:border-neutral-800 hover:border-[#FF4D00] transition-colors group"
											>
												<span className="text-xs font-medium text-neutral-900 dark:text-white">
													Initialize Protocol
												</span>
												<SwissIcons.Plus
													className="text-neutral-400 group-hover:text-[#FF4D00] transition-colors"
													size={12}
												/>
											</button>
											<button className="flex items-center justify-between p-3 bg-white dark:bg-[#111] border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 transition-colors group">
												<span className="text-xs font-medium text-neutral-900 dark:text-white">
													Archive Index
												</span>
												<SwissIcons.Grid
													className="text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors"
													size={12}
												/>
											</button>
										</div>

										{/* Recent Tapes */}
										<div className="flex flex-col gap-3">
											<div className="flex items-center gap-2">
												<div className="h-px w-4 bg-neutral-300 dark:bg-neutral-700" />
												<span className="text-[9px] font-mono uppercase tracking-widest text-neutral-500">
													Recent Sessions
												</span>
												<div className="h-px flex-1 bg-neutral-300 dark:bg-neutral-700" />
											</div>

											<div className="flex flex-col gap-1">
												{recentWorkflows.map((wf) => (
													<button
														key={wf.id}
														onClick={() => {
															onSelectWorkflow(wf.id);
															onClose();
														}}
														className="group flex items-center justify-between p-2 hover:bg-neutral-100 dark:hover:bg-[#151515] transition-colors"
													>
														<div className="flex flex-col items-start gap-0.5">
															<span className="text-xs text-neutral-600 dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white transition-colors">
																{wf.name}
															</span>
															<span className="text-[9px] font-mono text-neutral-400">
																UPD: {formatUpdated(wf.updatedAt)}
															</span>
														</div>
														<div className="flex items-center gap-3">
															<span className="text-[9px] font-mono text-neutral-400 tabular-nums">
																{wf.nodes}N
															</span>
															<div className="w-1.5 h-1.5 rounded-full bg-[#FF4D00]" />
														</div>
													</button>
												))}
											</div>
										</div>
									</div>
								) : (
									/* Creation Mode */
									<div className="flex flex-col gap-4">
										<div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
											<span className="font-mono text-[9px] uppercase tracking-widest text-neutral-500">
												Select Template
											</span>
											<button
												onClick={() => setMode("menu")}
												className="text-[9px] font-mono text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
											>
												[ BACK ]
											</button>
										</div>

										<div className="flex flex-col gap-2">
											<ProtocolOption
												label="Blank Manifest"
												desc="Start from zero state"
												icon={<SwissIcons.FilePlus size={14} />}
												onClick={() => {
													onCreateNew("blank");
													onClose();
												}}
											/>
											<ProtocolOption
												label="AI Architect"
												desc="Generative workflow builder"
												icon={<SwissIcons.Sparkles size={14} />}
												onClick={() => {
													onCreateNew("ai");
													onClose();
												}}
												accent
											/>
											<ProtocolOption
												label="Load Recipe"
												desc="Use pre-configured chain"
												icon={<SwissIcons.Layers size={14} />}
												onClick={() => {
													onCreateNew("template");
													onClose();
												}}
											/>
										</div>
									</div>
								)}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}

function ProtocolOption({
	label,
	desc,
	icon,
	onClick,
	accent,
}: {
	label: string;
	desc: string;
	icon: React.ReactNode;
	onClick: () => void;
	accent?: boolean;
}) {
	return (
		<button
			onClick={onClick}
			className={`flex items-start gap-4 p-3 border transition-all duration-200 group text-left ${
				accent
					? "bg-[#FF4D00]/5 border-[#FF4D00]/30 hover:border-[#FF4D00]"
					: "bg-white dark:bg-[#111] border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
			}`}
		>
			<div
				className={`mt-0.5 ${accent ? "text-[#FF4D00]" : "text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white"}`}
			>
				{icon}
			</div>
			<div className="flex flex-col gap-0.5">
				<span
					className={`text-xs font-bold font-mono uppercase ${accent ? "text-[#FF4D00]" : "text-neutral-900 dark:text-white"}`}
				>
					{label}
				</span>
				<span className="text-[9px] text-neutral-500 font-mono">{desc}</span>
			</div>
		</button>
	);
}
