import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import {
	TEMPLATE_CATEGORIES,
	TEMPLATES,
	type TemplateCategory,
} from "@/data/templates";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface ChatWelcomeProps {
	onSelectTemplate: (template: string) => void;
	userName?: string;
}

export const ChatWelcome: React.FC<ChatWelcomeProps> = ({
	onSelectTemplate,
}) => {
	const { data: session, isPending } = authClient.useSession();
	const [activeCategory, setActiveCategory] = useState<TemplateCategory>("ALL");

	const displayName = session?.user?.name || session?.user?.email || "User";
	const firstName = displayName.split(" ")[0].split("@")[0];

	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return "Good morning";
		if (hour < 17) return "Good afternoon";
		return "Good evening";
	};

	if (isPending) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="w-4 h-4 border-2 border-[#FF4D00] border-t-transparent rounded-full animate-spin" />
			</div>
		);
	}

	const filteredTemplates = TEMPLATES.filter(
		(t) => activeCategory === "ALL" || t.category === activeCategory,
	);

	return (
		<div className="flex flex-col gap-6 py-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
			{/* Welcome Section */}
			<div className="flex flex-col gap-1 border-b border-neutral-200 dark:border-neutral-800/50 pb-5">
				<h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
					{getGreeting()}, {firstName}.
				</h1>
				<p className="text-xs text-neutral-500 max-w-[280px] leading-relaxed">
					Select an inspiration node to initialize a new visual session or
					simply prompt below.
				</p>
			</div>

			{/* Category Switcher */}
			<div className="flex flex-col gap-3">
				<div className="flex items-center gap-4 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
					{TEMPLATE_CATEGORIES.map((cat) => (
						<button
							key={cat}
							onClick={() => setActiveCategory(cat)}
							className={cn(
								"whitespace-nowrap font-mono text-[9px] uppercase tracking-widest transition-all",
								activeCategory === cat
									? "text-[#FF4D00] border-b border-[#FF4D00]"
									: "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200",
							)}
						>
							{cat}
						</button>
					))}
				</div>

				{/* Pinterest-style Grid */}
				<div className="grid grid-cols-2 gap-3">
					<AnimatePresence mode="popLayout">
						{filteredTemplates.map((template) => (
							<motion.button
								layout
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.95 }}
								whileHover={{ y: -2 }}
								whileTap={{ scale: 0.98 }}
								key={template.id}
								onClick={() => onSelectTemplate(template.prompt)}
								className="group relative flex flex-col gap-1.5 scale-100"
							>
								{/* Card Visual */}
								<div className="relative aspect-square w-full bg-[#1a1a1a] rounded-lg overflow-hidden border border-neutral-800 group-hover:border-[#FF4D00]/50 transition-colors">
									{/* Placeholder Pattern (Matrix-like/Industrial) */}
									<div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
										<div
											className="absolute inset-0"
											style={{
												backgroundImage:
													"radial-gradient(#ffffff 0.5px, transparent 0.5px)",
												backgroundSize: "8px 8px",
											}}
										/>
										<div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-neutral-900/50 to-transparent" />
									</div>

									{/* Metadata Overlay */}
									<div className="absolute top-2 left-2 flex items-center gap-1">
										<div className="w-1 h-1 rounded-full bg-[#FF4D00]" />
										<span className="font-mono text-[7px] uppercase tracking-[0.2em] text-neutral-500">
											{template.metadata}
										</span>
									</div>

									{/* Central Prompt Snippet (Visual only) */}
									<div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 items-center text-center">
										<span className="text-[10px] font-bold text-white/40 group-hover:text-white transition-colors tracking-tight uppercase leading-relaxed">
											{template.label}
										</span>
										<div className="w-4 h-[1px] bg-neutral-800 group-hover:bg-[#FF4D00] transition-colors" />
									</div>

									{/* Hover Action Indicator */}
									<div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
										<span className="font-mono text-[8px] uppercase text-[#FF4D00]">
											[ RUN ]
										</span>
									</div>
								</div>

								{/* Card Footer */}
								<div className="flex flex-col gap-0 px-1">
									<span className="text-[9px] font-bold text-neutral-900 dark:text-neutral-200 uppercase tracking-tighter">
										{template.label}
									</span>
									<span className="text-[7px] font-mono text-neutral-500 uppercase tracking-widest opacity-60">
										{template.category}
									</span>
								</div>
							</motion.button>
						))}
					</AnimatePresence>
				</div>
			</div>
		</div>
	);
};
