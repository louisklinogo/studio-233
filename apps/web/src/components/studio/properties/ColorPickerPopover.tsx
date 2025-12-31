"use client";

import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { cn } from "@/lib/utils";

interface ColorPickerPopoverProps {
	color: string;
	onChange: (color: string) => void;
	className?: string;
	label?: string;
}

export const ColorPickerPopover: React.FC<ColorPickerPopoverProps> = ({
	color,
	onChange,
	className,
	label,
}) => {
	const [inputValue, setInputValue] = useState(color);

	useEffect(() => {
		setInputValue(color);
	}, [color]);

	const handleInputChange = (val: string) => {
		setInputValue(val);
		if (/^#[0-9A-F]{6}$/i.test(val) || /^#[0-9A-F]{3}$/i.test(val)) {
			onChange(val);
		}
	};

	return (
		<div className={cn("flex flex-col gap-2", className)}>
			{label && (
				<span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
					{label}
				</span>
			)}
			<Popover>
				<PopoverTrigger asChild>
					<motion.button
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						className="flex items-center gap-3 w-full group text-left"
					>
						<div
							className="w-10 h-10 rounded-sm border border-neutral-200 dark:border-neutral-800 shadow-sm relative overflow-hidden"
							style={{ backgroundColor: color }}
						>
							<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/10 transition-opacity">
								<SwissIcons.Edit
									size={12}
									className="text-white drop-shadow-md"
								/>
							</div>
						</div>
						<div className="flex-1 min-w-0">
							<div className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-900 px-3 py-2 rounded-sm font-mono text-[11px] uppercase text-neutral-900 dark:text-white tabular-nums tracking-widest truncate">
								{color.toUpperCase()}
							</div>
						</div>
					</motion.button>
				</PopoverTrigger>
				<PopoverContent
					className="w-fit p-4 bg-white dark:bg-[#0a0a0a] border-neutral-200 dark:border-neutral-800 rounded-sm shadow-2xl"
					side="right"
					align="start"
					sideOffset={12}
				>
					<div className="space-y-4">
						<div className="flex items-center justify-between mb-2">
							<span className="font-mono text-[10px] text-[#FF4D00] font-bold uppercase tracking-widest">
								Color_Calibration
							</span>
							<div className="w-2 h-[1px] bg-neutral-300 dark:bg-neutral-700" />
						</div>
						<HexColorPicker color={color} onChange={onChange} />
						<div className="flex items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-900">
							<span className="font-mono text-[10px] text-neutral-400">
								HEX:
							</span>
							<input
								value={inputValue}
								onChange={(e) => handleInputChange(e.target.value)}
								className="bg-transparent font-mono text-xs uppercase focus:outline-none text-neutral-900 dark:text-white w-20"
							/>
						</div>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
};
