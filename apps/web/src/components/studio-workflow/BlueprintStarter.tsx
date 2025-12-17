"use client";

import { motion } from "framer-motion";
import { SwissIcons } from "@/components/ui/SwissIcons";

interface BlueprintStarterProps {
	onSelectOption: (option: "blank" | "ai" | "template") => void;
}

export function BlueprintStarter({ onSelectOption }: BlueprintStarterProps) {
	return (
		<div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none bg-[#f4f4f0]/60 dark:bg-[#0a0a0a]/60 backdrop-blur-[2px]">
			<motion.div
				initial={{ opacity: 0, scale: 0.98 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.4, ease: "easeOut" }}
				className="w-full max-w-3xl pointer-events-auto"
			>
				{/* Main Panel */}
				<div className="bg-[#fcfcfc] dark:bg-[#111] border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm overflow-hidden">
					{/* Header */}
					<div className="px-8 py-6 border-b border-neutral-100 dark:border-neutral-800/50 flex items-center justify-between">
						<div>
							<h2 className="text-lg font-medium text-neutral-900 dark:text-white">
								New Workflow
							</h2>
							<p className="text-sm text-neutral-500 mt-1">
								Choose a starting point for your session.
							</p>
						</div>
						<div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
							<SwissIcons.Plus size={16} className="text-neutral-400" />
						</div>
					</div>

					{/* Options Grid */}
					<div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-neutral-100 dark:divide-neutral-800">
						<StarterOption
							title="Blank Grid"
							desc="Start from scratch with an empty canvas."
							icon={<SwissIcons.Grid size={20} />}
							onClick={() => onSelectOption("blank")}
						/>
						<StarterOption
							title="AI Architect"
							desc="Describe your goal and generate a flow."
							icon={<SwissIcons.Sparkles size={20} />}
							onClick={() => onSelectOption("ai")}
							highlight
						/>
						<StarterOption
							title="Templates"
							desc="Load a pre-configured recipe."
							icon={<SwissIcons.Layers size={20} />}
							onClick={() => onSelectOption("template")}
						/>
					</div>

					{/* Footer */}
					<div className="px-8 py-4 bg-neutral-50/50 dark:bg-neutral-900/20 border-t border-neutral-100 dark:border-neutral-800/50 flex justify-between items-center text-xs text-neutral-400">
						<span>
							Press{" "}
							<kbd className="font-mono bg-white dark:bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700">
								ESC
							</kbd>{" "}
							to cancel
						</span>
						<span className="font-mono">v2.4.0</span>
					</div>
				</div>
			</motion.div>
		</div>
	);
}

function StarterOption({
	title,
	desc,
	icon,
	onClick,
	highlight,
}: {
	title: string;
	desc: string;
	icon: React.ReactNode;
	onClick: () => void;
	highlight?: boolean;
}) {
	return (
		<button
			onClick={onClick}
			className={`group relative p-8 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50 h-full flex flex-col gap-4 ${
				highlight ? "bg-neutral-50/50 dark:bg-neutral-900/10" : ""
			}`}
		>
			<div
				className={`w-10 h-10 rounded-md border flex items-center justify-center transition-colors ${
					highlight
						? "bg-white dark:bg-[#1a1a1a] border-neutral-200 dark:border-neutral-700 text-[#FF4D00] shadow-sm"
						: "bg-white dark:bg-[#1a1a1a] border-neutral-100 dark:border-neutral-800 text-neutral-400 group-hover:border-neutral-300 dark:group-hover:border-neutral-600 group-hover:text-neutral-600 dark:group-hover:text-neutral-200"
				}`}
			>
				{icon}
			</div>

			<div>
				<h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1 group-hover:text-[#FF4D00] transition-colors">
					{title}
				</h3>
				<p className="text-xs text-neutral-500 leading-relaxed">{desc}</p>
			</div>
		</button>
	);
}
