"use client";

import React, { useEffect, useState } from "react";

const OFFERINGS = [
	"GENERATE_MARKETING_CAMPAIGN_ASSETS",
	"BATCH_PROCESS_1000+_IMAGES",
	"TRANSFER_STYLE_FROM_REFERENCE_TO_100_IMAGES",
	"ISOLATE_PRODUCT_FROM_BG",
	"COMPOSITE_3D_SCENE",
	"DESIGN_EVENT_POSTER",
	"UPSCALE_AND_RESTORE",
	"DESIGN_FLYER_USING_THIS_TEMPLATE",
];

export const GlitchHeader = () => {
	const [text, setText] = useState(OFFERINGS[0]);
	const [index, setIndex] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			const nextIndex = (index + 1) % OFFERINGS.length;
			setIndex(nextIndex);

			const nextWord = OFFERINGS[nextIndex];
			let iteration = 0;

			const glitchInterval = setInterval(() => {
				setText((prev) =>
					nextWord
						.split("")
						.map((char, i) => {
							if (i < iteration) return nextWord[i];
							return "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&_"[
								Math.floor(Math.random() * 36)
							];
						})
						.join(""),
				);

				if (iteration >= nextWord.length) {
					clearInterval(glitchInterval);
				}

				iteration += 1 / 3; // Speed of decryption
			}, 30);
		}, 4000); // Cycle every 4 seconds

		return () => clearInterval(interval);
	}, [index]);

	return (
		<div className="relative group">
			{/* Integrated HUD Readout */}
			<div className="flex items-center gap-4 px-2 py-1 overflow-hidden">
				{/* Status Marker & LED */}
				<div className="flex items-center gap-2 shrink-0">
					<div className="w-1.5 h-1.5 rounded-full bg-[#FF4D00] shadow-[0_0_8px_rgba(255,77,0,0.6)] animate-pulse" />
					<div className="w-[1px] h-8 bg-neutral-900" />
				</div>

				{/* LCD Readout */}
				<div className="flex flex-col gap-0.5">
					<span className="font-mono text-[8px] text-neutral-600 uppercase tracking-[0.3em] leading-none">
						LIVE_PROC_STREAM
					</span>
					<p className="text-xs font-mono text-neutral-300 h-4 flex items-center tracking-tight">
						<span className="text-[#FF4D00] mr-2">/</span>
						{text}
					</p>
				</div>

				{/* HUD Decoration (Grid Aligned) */}
				<div className="hidden lg:flex items-center gap-3 ml-4">
					<div className="flex flex-col gap-1">
						<div className="w-12 h-[1px] bg-neutral-900" />
						<div className="w-8 h-[1px] bg-neutral-900" />
					</div>
					<span className="text-[7px] font-mono text-neutral-700 tracking-[0.5em] uppercase select-none">
						88-DELTA-SYNC
					</span>
				</div>
			</div>

			{/* Subtle HUD Brackets (Projected) */}
			<div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-neutral-800" />
			<div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-neutral-800" />
		</div>
	);
};
