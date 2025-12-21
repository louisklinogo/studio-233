import React from "react";
import { cn } from "@/lib/utils";
import type { AspectRatio } from "./AspectRatioSelector";

interface AspectRatioPickerProps {
	onSelect: (ratio: AspectRatio) => void;
	message?: string;
}

const ratios: { label: AspectRatio; width: number; height: number }[] = [
	{ label: "1:1", width: 24, height: 24 },
	{ label: "16:9", width: 32, height: 18 },
	{ label: "9:16", width: 18, height: 32 },
	{ label: "4:3", width: 28, height: 21 },
	{ label: "3:4", width: 21, height: 28 },
	{ label: "3:2", width: 30, height: 20 },
	{ label: "2:3", width: 20, height: 30 },
	{ label: "21:9", width: 36, height: 15 },
	{ label: "5:4", width: 25, height: 20 },
	{ label: "4:5", width: 20, height: 25 },
];

export const AspectRatioPicker: React.FC<AspectRatioPickerProps> = ({
	onSelect,
	message,
}) => {
	return (
		<div className="flex flex-col gap-3 p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg border border-neutral-200 dark:border-neutral-800">
			<div className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
				{message || "Select an aspect ratio"}
			</div>
			<div className="grid grid-cols-5 gap-2">
				{ratios.map((ratio) => (
					<button
						key={ratio.label}
						onClick={() => onSelect(ratio.label)}
						className={cn(
							"group flex flex-col items-center gap-1.5 p-2 rounded-md",
							"hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors",
							"focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/20",
						)}
						title={ratio.label}
					>
						<div
							className="border-2 border-neutral-300 dark:border-neutral-600 group-hover:border-[#FF4D00] transition-colors bg-white dark:bg-neutral-950"
							style={{
								width: `${ratio.width}px`,
								height: `${ratio.height}px`,
							}}
						/>
						<span className="text-[10px] text-neutral-500 font-mono">
							{ratio.label}
						</span>
					</button>
				))}
			</div>
		</div>
	);
};
