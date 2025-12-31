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

interface StudioColorPickerProps {
	color: string;
	onChange: (color: string) => void;
	className?: string;
	label?: string;
}

export const StudioColorPicker: React.FC<StudioColorPickerProps> = ({
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
		<div className={cn("flex items-center", className)}>
			<Popover>
				<PopoverTrigger asChild>
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className={cn(
							"w-6 h-6 rounded-sm border border-neutral-200 dark:border-neutral-800 relative cursor-pointer shadow-sm shrink-0 overflow-hidden",
						)}
						style={{ backgroundColor: color }}
					>
						<div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/10 transition-opacity">
							<SwissIcons.Edit
								size={10}
								className="text-white drop-shadow-md"
							/>
						</div>
					</motion.button>
				</PopoverTrigger>
				<PopoverContent
					className="w-fit p-4 bg-white dark:bg-[#0a0a0a] border-neutral-200 dark:border-neutral-800 rounded-sm shadow-2xl"
					side="bottom"
					align="start"
					sideOffset={8}
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
