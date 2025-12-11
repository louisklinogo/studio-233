"use client";

import { motion } from "framer-motion";
import { SwissIcons } from "@/components/ui/SwissIcons";

interface BlueprintStarterProps {
	onSelectOption: (option: "blank" | "ai" | "template") => void;
}

export function BlueprintStarter({ onSelectOption }: BlueprintStarterProps) {
	return (
		<div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ type: "spring", duration: 0.5 }}
				className="w-[600px] bg-[#f4f4f0] dark:bg-[#111] border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-[4px] p-8 pointer-events-auto"
			>
				<div className="text-center mb-10">
					<div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-200 dark:bg-[#222] mb-4">
						<SwissIcons.Grid size={24} className="text-neutral-500" />
					</div>
					<h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight mb-2">
						Initialize Operations
					</h2>
					<p className="text-sm font-mono text-neutral-500 uppercase tracking-wide">
						Select Protocol to Begin
					</p>
				</div>

				<div className="grid grid-cols-3 gap-4">
					<StarterOption
						icon={<SwissIcons.Plus size={20} />}
						title="Manual"
						subtitle="Blank Grid"
						onClick={() => onSelectOption("blank")}
					/>
					<StarterOption
						icon={<SwissIcons.Sparkles size={20} />}
						title="AI Architect"
						subtitle="Text to Flow"
						onClick={() => onSelectOption("ai")}
						accent
					/>
					<StarterOption
						icon={<SwissIcons.Layers size={20} />}
						title="Load Recipe"
						subtitle="From Library"
						onClick={() => onSelectOption("template")}
					/>
				</div>

				<div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
					<span>System: Ready</span>
					<span>v2.4.0</span>
				</div>
			</motion.div>
		</div>
	);
}

function StarterOption({
	icon,
	title,
	subtitle,
	onClick,
	accent,
}: {
	icon: React.ReactNode;
	title: string;
	subtitle: string;
	onClick: () => void;
	accent?: boolean;
}) {
	return (
		<button
			onClick={onClick}
			className="group flex flex-col items-center justify-center p-6 rounded-[2px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a1a] hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-lg transition-all text-center"
		>
			<div
				className={`mb-4 transition-colors ${
					accent
						? "text-[#FF4D00]"
						: "text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white"
				}`}
			>
				{icon}
			</div>
			<span className="text-xs font-bold text-neutral-900 dark:text-white mb-1">
				{title}
			</span>
			<span className="text-[10px] font-mono text-neutral-500 uppercase">
				{subtitle}
			</span>
		</button>
	);
}
