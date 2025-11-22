import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import React from "react";

interface UploadButtonProps {
	onClick: () => void;
	disabled?: boolean;
}

export function UploadButtonDataSlot({ onClick, disabled }: UploadButtonProps) {
	const [isHovered, setIsHovered] = React.useState(false);

	return (
		<div
			className="relative w-36 h-12 cursor-pointer flex items-center justify-center perspective-500"
			onMouseEnter={() => !disabled && setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onClick={!disabled ? onClick : undefined}
		>
			{/* Slot Housing */}
			<div className="absolute inset-0 bg-zinc-900 rounded-md border border-zinc-800 shadow-inner flex items-center justify-center">
				{/* The Slot Opening */}
				<div className="w-24 h-1.5 bg-black rounded-full shadow-[0_0_5px_rgba(0,0,0,0.8)] relative overflow-visible">
					{/* Glow inside slot */}
					<motion.div
						className="absolute inset-0 bg-blue-500/50 blur-sm"
						animate={{ opacity: isHovered ? 1 : 0 }}
					/>
				</div>
			</div>

			{/* The Data Card (Ejecting/Inserting) */}
			<motion.div
				className="absolute w-20 h-16 bg-zinc-200 rounded-t-md border border-zinc-300 shadow-md flex flex-col items-center justify-start pt-2 gap-1 z-[-1]"
				initial={{ y: 10, opacity: 0 }}
				animate={{
					y: isHovered ? -15 : 10,
					opacity: isHovered ? 1 : 0,
				}}
				transition={{ type: "spring", stiffness: 200, damping: 20 }}
			>
				<div className="w-12 h-1 bg-zinc-300 rounded-full" />
				<div className="w-8 h-1 bg-zinc-300 rounded-full" />
				<div className="flex items-center gap-1 mt-1">
					<ArrowUp className="w-3 h-3 text-zinc-500" />
					<span className="text-[8px] font-bold text-zinc-500">INSERT</span>
				</div>
			</motion.div>

			{/* Label on Housing */}
			<div className="absolute bottom-1.5 text-[9px] font-mono text-zinc-500 tracking-widest uppercase">
				DATA_INPUT
			</div>

			{/* Disabled Overlay */}
			{disabled && (
				<div className="absolute inset-0 bg-black/50 rounded-md cursor-not-allowed z-20" />
			)}
		</div>
	);
}
