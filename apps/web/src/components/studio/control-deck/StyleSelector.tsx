"use client";

import React, { useRef } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { cn } from "@/lib/utils";
import { DeckButton } from "./DeckButton";

export interface StylePreset {
	id: string;
	label: string;
	icon?: any;
}

interface StyleSelectorProps {
	selectedStyleId: string;
	onSelectStyle: (styleId: string) => void;
	onUploadReference?: (file: File) => void;
	className?: string;
}

const PRESETS: StylePreset[] = [
	{ id: "simpsons", label: "Simpsons" },
	{ id: "anime", label: "Anime" },
	{ id: "oil_painting", label: "Oil Painting" },
	{ id: "cyberpunk", label: "Cyberpunk" },
	{ id: "claymation", label: "Claymation" },
	{ id: "sketch", label: "Sketch" },
];

export const StyleSelector: React.FC<StyleSelectorProps> = ({
	selectedStyleId,
	onSelectStyle,
	onUploadReference,
	className,
}) => {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file && onUploadReference) {
			onUploadReference(file);
			onSelectStyle("custom");
		}
	};

	const selectedPreset = PRESETS.find((p) => p.id === selectedStyleId);
	const label =
		selectedStyleId === "custom"
			? "Custom Ref"
			: selectedPreset?.label || "Style";

	return (
		<div className={cn("flex items-center", className)}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button className="h-10 px-3 flex items-center gap-2 bg-[#f4f4f0] dark:bg-[#111111] hover:bg-white dark:hover:bg-[#1a1a1a] transition-colors group outline-none">
						<SwissIcons.Zap
							size={14}
							className="text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-neutral-100"
						/>
						<span className="text-[10px] font-mono text-neutral-500 uppercase tracking-tight group-hover:text-neutral-900 dark:group-hover:text-neutral-100">
							{label}
						</span>
						<SwissIcons.ChevronDown size={10} className="text-neutral-400" />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					side="top"
					align="start"
					className="w-40 rounded-sm bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 p-0 shadow-xl"
				>
					{PRESETS.map((preset) => (
						<DropdownMenuItem
							key={preset.id}
							onClick={() => onSelectStyle(preset.id)}
							className={cn(
								"rounded-none text-xs font-mono py-2 px-3 cursor-pointer focus:bg-neutral-100 dark:focus:bg-neutral-800",
								selectedStyleId === preset.id &&
									"bg-neutral-100 dark:bg-neutral-800 text-[#FF4D00]",
							)}
						>
							{preset.label}
						</DropdownMenuItem>
					))}

					<DropdownMenuSeparator className="bg-neutral-200 dark:bg-neutral-700 m-0" />

					<DropdownMenuItem
						onClick={() => fileInputRef.current?.click()}
						className={cn(
							"rounded-none text-xs font-mono py-2 px-3 cursor-pointer focus:bg-neutral-100 dark:focus:bg-neutral-800",
							selectedStyleId === "custom" &&
								"bg-neutral-100 dark:bg-neutral-800 text-[#FF4D00]",
						)}
					>
						<div className="flex items-center gap-2">
							<SwissIcons.Upload size={12} />
							<span>Custom Reference...</span>
						</div>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<input
				type="file"
				ref={fileInputRef}
				className="hidden"
				accept="image/*"
				onChange={handleFileChange}
			/>
		</div>
	);
};
