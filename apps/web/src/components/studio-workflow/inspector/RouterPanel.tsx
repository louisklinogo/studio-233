"use client";

import { useState } from "react";
import { SwissIcons } from "@/components/ui/SwissIcons";

interface Route {
	id: string;
	label: string;
	condition: string;
}

export function RouterPanel() {
	const [mode, setMode] = useState("llm");
	const [routes, setRoutes] = useState<Route[]>([
		{ id: "1", label: "High Quality", condition: "conf > 0.9" },
		{ id: "2", label: "Requires Review", condition: "conf <= 0.9" },
	]);

	const addRoute = () => {
		const id = Math.random().toString(36).substring(7);
		setRoutes([...routes, { id, label: "New Route", condition: "condition" }]);
	};

	const removeRoute = (id: string) => {
		setRoutes(routes.filter((r) => r.id !== id));
	};

	return (
		<div className="space-y-6">
			{/* Routing Mode */}
			<div className="space-y-2">
				<label className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
					Routing Logic
				</label>
				<div className="relative">
					<select
						value={mode}
						onChange={(e) => setMode(e.target.value)}
						className="w-full h-8 bg-white dark:bg-[#1a1a1a] border border-neutral-300 dark:border-neutral-700 rounded-[2px] px-3 text-xs font-mono appearance-none focus:border-[#FF4D00] focus:outline-none"
					>
						<option value="llm">LLM Classifier (Smart)</option>
						<option value="metadata">Metadata Rules (Fast)</option>
						<option value="random">A/B Testing (Random)</option>
					</select>
					<div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
						<SwissIcons.ChevronDown size={10} />
					</div>
				</div>
			</div>

			{/* Routes List */}
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<label className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
						Output Paths
					</label>
					<button
						onClick={addRoute}
						className="text-[9px] font-bold text-[#FF4D00] hover:text-[#e04400] uppercase flex items-center gap-1"
					>
						<SwissIcons.Plus size={10} /> Add Path
					</button>
				</div>

				<div className="space-y-2">
					{routes.map((route, idx) => (
						<div
							key={route.id}
							className="bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 rounded-[2px] p-2 space-y-2 relative group"
						>
							{/* Header / Label */}
							<div className="flex items-center gap-2">
								<span className="text-[9px] font-mono text-neutral-400 w-4">
									#{idx + 1}
								</span>
								<input
									type="text"
									value={route.label}
									onChange={(e) => {
										const newRoutes = [...routes];
										newRoutes[idx].label = e.target.value;
										setRoutes(newRoutes);
									}}
									className="flex-1 bg-transparent border-none text-xs font-bold focus:outline-none p-0"
								/>
								<button
									onClick={() => removeRoute(route.id)}
									className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-opacity"
								>
									<SwissIcons.Close size={12} />
								</button>
							</div>

							{/* Condition Logic */}
							<div className="flex items-center gap-2 bg-neutral-100 dark:bg-[#111] p-1.5 rounded-[1px]">
								<SwissIcons.Code size={10} className="text-neutral-400" />
								<input
									type="text"
									value={route.condition}
									onChange={(e) => {
										const newRoutes = [...routes];
										newRoutes[idx].condition = e.target.value;
										setRoutes(newRoutes);
									}}
									className="flex-1 bg-transparent border-none text-[10px] font-mono text-neutral-600 dark:text-neutral-400 focus:outline-none p-0"
								/>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
