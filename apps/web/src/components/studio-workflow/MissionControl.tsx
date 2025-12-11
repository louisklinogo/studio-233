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
}

export function MissionControl({
	isOpen,
	onClose,
	onSelectWorkflow,
	onCreateNew,
}: MissionControlProps) {
	const [mode, setMode] = useState<"menu" | "create">("menu");

	// Mock Data
	const recentWorkflows = [
		{
			id: "wf-1",
			name: "Nike Summer Campaign",
			status: "active",
			nodes: 12,
			updated: "2m ago",
		},
		{
			id: "wf-2",
			name: "Product Cleanup v2",
			status: "draft",
			nodes: 5,
			updated: "4h ago",
		},
		{
			id: "wf-3",
			name: "Social Video Gen",
			status: "paused",
			nodes: 8,
			updated: "1d ago",
		},
	];

	// Technical Stats
	const stats = {
		active: recentWorkflows.filter((w) => w.status === "active").length,
		credits: 450,
		status: "ONLINE",
	};

	return (
		<div className="fixed top-[60px] left-4 z-[60]">
			{/* Backdrop for closing */}
			{isOpen && <div className="fixed inset-0 z-[-1]" onClick={onClose} />}

			<div
				className={cn(
					"flex flex-col gap-[1px]",
					"bg-neutral-200 dark:bg-neutral-800",
					"rounded-sm",
					"min-w-[280px] max-w-xs",
					"border border-transparent dark:border-neutral-800 shadow-xl",
				)}
			>
				{/* Header / Title Plate */}
				<button
					onClick={isOpen ? onClose : () => {}} // If it's closed, the parent opens it. If open, this closes it.
					className={cn(
						"w-full text-left bg-[#f4f4f0] dark:bg-[#111111] px-4 py-3 flex flex-col gap-0.5 transition-colors",
						"hover:bg-white dark:hover:bg-[#1a1a1a]",
						isOpen && "bg-white dark:bg-[#1a1a1a]",
					)}
				>
					<div className="flex items-center justify-between gap-3 w-full">
						<span className="font-mono text-[10px] tracking-widest uppercase text-neutral-500 flex items-center gap-1">
							MISSION CONTROL
							<SwissIcons.ChevronDown
								className={cn(
									"w-3 h-3 transition-transform duration-200",
									isOpen && "rotate-180",
								)}
							/>
						</span>
						{/* Status Indicator - Precision LED look */}
						<div className="flex items-center gap-1.5">
							<div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[inset_0_1px_1px_rgba(0,0,0,0.1),0_0_4px_rgba(16,185,129,0.4)]" />
						</div>
					</div>
					<div className="text-sm font-bold text-neutral-900 dark:text-white tracking-tight truncate w-full">
						Operations Console
					</div>
				</button>

				{/* Dropdown Content */}
				<AnimatePresence>
					{isOpen && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.2, ease: "easeInOut" }}
							className="bg-[#f4f4f0] dark:bg-[#111111] overflow-hidden"
						>
							{mode === "menu" ? (
								<div className="flex flex-col">
									{/* Primary Actions */}
									<div className="p-2 flex flex-col gap-1">
										<button
											onClick={() => setMode("create")}
											className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-sm transition-colors w-full text-left"
										>
											<SwissIcons.Plus size={14} />
											Initialize Protocol
										</button>
										<button className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-sm transition-colors w-full text-left">
											<SwissIcons.Grid size={14} />
											View All Tapes
										</button>
									</div>

									<div className="h-[1px] bg-neutral-200 dark:bg-neutral-800 mx-2" />

									{/* Recent Tapes */}
									<div className="p-2 flex flex-col gap-1">
										<div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-neutral-400">
											Active Tapes
										</div>
										{recentWorkflows.map((wf) => (
											<button
												key={wf.id}
												onClick={() => {
													onSelectWorkflow(wf.id);
													onClose();
												}}
												className="group px-3 py-1.5 flex items-center justify-between hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-sm transition-colors w-full text-left"
											>
												<span className="text-xs text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white truncate">
													{wf.name}
												</span>
												{wf.status === "active" && (
													<div className="w-1 h-1 bg-[#FF4D00] rounded-full" />
												)}
											</button>
										))}
									</div>
								</div>
							) : (
								/* Creation Mode */
								<div className="p-3 flex flex-col gap-3">
									<div className="flex items-center justify-between">
										<span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
											Select Protocol
										</span>
										<button
											onClick={() => setMode("menu")}
											className="text-[10px] text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
										>
											BACK
										</button>
									</div>

									<div className="flex flex-col gap-1">
										<ProtocolOption
											label="Blank Manifest"
											icon={<SwissIcons.FilePlus size={14} />}
											onClick={() => {
												onCreateNew("blank");
												onClose();
											}}
										/>
										<ProtocolOption
											label="AI Architect"
											icon={<SwissIcons.Sparkles size={14} />}
											onClick={() => {
												onCreateNew("ai");
												onClose();
											}}
											accent
										/>
										<ProtocolOption
											label="Load Recipe"
											icon={<SwissIcons.Layers size={14} />}
											onClick={() => {
												onCreateNew("template");
												onClose();
											}}
										/>
									</div>
								</div>
							)}
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}

function ProtocolOption({
	label,
	icon,
	onClick,
	accent,
}: {
	label: string;
	icon: React.ReactNode;
	onClick: () => void;
	accent?: boolean;
}) {
	return (
		<button
			onClick={onClick}
			className={`flex items-center gap-3 px-3 py-2 rounded-sm transition-colors w-full text-left border ${
				accent
					? "bg-[#FF4D00]/5 border-[#FF4D00]/20 text-[#FF4D00] hover:bg-[#FF4D00]/10"
					: "bg-white dark:bg-[#1a1a1a] border-transparent hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-600 dark:text-neutral-300"
			}`}
		>
			{icon}
			<span className="text-xs font-bold font-mono uppercase">{label}</span>
		</button>
	);
}
