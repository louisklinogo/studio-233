"use client";

import { useState } from "react";
import { SwissIcons } from "@/components/ui/SwissIcons";

export function DetectionPanel() {
	const [classes, setClasses] = useState<string[]>([
		"brand_label",
		"metallic_tag",
	]);

	const availableClasses = [
		{ id: "brand_label", label: "Brand Labels" },
		{ id: "metallic_tag", label: "Metallic Tags" },
		{ id: "skin_imperfection", label: "Skin Issues" },
		{ id: "background_artifact", label: "BG Artifacts" },
		{ id: "watermark", label: "Watermarks" },
		{ id: "accessories", label: "Jewelry" },
	];

	const toggleClass = (id: string) => {
		if (classes.includes(id)) {
			setClasses(classes.filter((c) => c !== id));
		} else {
			setClasses([...classes, id]);
		}
	};

	return (
		<div className="space-y-6">
			{/* Target Classes */}
			<div className="space-y-3">
				<label className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
					Detection Targets
				</label>
				<div className="grid grid-cols-2 gap-2">
					{availableClasses.map((cls) => {
						const isSelected = classes.includes(cls.id);
						return (
							<button
								key={cls.id}
								onClick={() => toggleClass(cls.id)}
								className={`flex items-center gap-2 px-3 py-2 rounded-[2px] border text-xs font-medium transition-all ${
									isSelected
										? "bg-[#FF4D00]/10 border-[#FF4D00] text-[#FF4D00]"
										: "bg-white dark:bg-[#1a1a1a] border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300"
								}`}
							>
								<div
									className={`w-3 h-3 rounded-[1px] border flex items-center justify-center ${
										isSelected
											? "bg-[#FF4D00] border-[#FF4D00]"
											: "border-neutral-300 dark:border-neutral-600"
									}`}
								>
									{isSelected && (
										<SwissIcons.Check size={8} className="text-white" />
									)}
								</div>
								{cls.label}
							</button>
						);
					})}
				</div>
			</div>

			{/* Custom Prompt Override */}
			<div className="space-y-2">
				<div className="flex justify-between items-center">
					<label className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
						System Prompt
					</label>
					<span className="text-[9px] font-mono text-[#FF4D00]">
						Gemini 2.5 Pro
					</span>
				</div>
				<textarea
					className="w-full h-40 bg-white dark:bg-[#1a1a1a] border border-neutral-300 dark:border-neutral-700 rounded-[2px] p-3 text-[10px] font-mono resize-none focus:outline-none focus:border-[#FF4D00] leading-relaxed"
					defaultValue={`TASK: Analyze this product image and identify ALL unwanted elements that should be removed for a clean, professional product presentation.

DETECTION TARGETS:
1. BRAND LABELS & TAGS
2. METALLIC ELEMENTS
3. ACCESSORIES (Jewelry, Watches)`}
				/>
			</div>
		</div>
	);
}
