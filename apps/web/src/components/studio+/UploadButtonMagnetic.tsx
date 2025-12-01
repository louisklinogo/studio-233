import { motion } from "framer-motion";
import { CloudUpload } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

interface UploadButtonProps {
	onClick: () => void;
	disabled?: boolean;
}

export function UploadButtonMagnetic({ onClick, disabled }: UploadButtonProps) {
	return (
		<motion.button
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.95 }}
			onClick={!disabled ? onClick : undefined}
			disabled={disabled}
			className={cn(
				"relative group w-10 h-10 flex items-center justify-center bg-white dark:bg-[#111] border border-neutral-200 dark:border-neutral-800 rounded-[2px] shadow-sm transition-all",
				"hover:border-[#FF4D00] hover:shadow-md",
				disabled && "opacity-50 cursor-not-allowed hover:border-neutral-200",
			)}
		>
			<div className="relative z-10">
				<CloudUpload className="w-4 h-4 text-neutral-500 group-hover:text-[#FF4D00] transition-colors" />
			</div>

			{/* Mechanical "Pressed" Detail */}
			<div className="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-100/50 dark:to-neutral-900/50 opacity-0 group-active:opacity-100 transition-opacity" />
		</motion.button>
	);
}
