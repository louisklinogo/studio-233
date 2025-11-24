import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import React from "react";

interface UploadButtonProps {
	onClick: () => void;
	disabled?: boolean;
}

export function UploadButtonMechanical({
	onClick,
	disabled,
}: UploadButtonProps) {
	const [isHovered, setIsHovered] = React.useState(false);
	const [isPressed, setIsPressed] = React.useState(false);

	return (
		<div
			className="relative w-32 h-12 cursor-pointer group"
			onMouseEnter={() => !disabled && setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onMouseDown={() => !disabled && setIsPressed(true)}
			onMouseUp={() => setIsPressed(false)}
			onClick={!disabled ? onClick : undefined}
		>
			{/* Base/Housing */}
			<div className="absolute inset-0 bg-zinc-800 rounded-lg shadow-lg border-b-2 border-zinc-900 transform translate-y-1"></div>

			{/* The Button Itself */}
			<motion.div
				className="absolute inset-0 bg-gradient-to-b from-zinc-700 to-zinc-800 rounded-lg border border-zinc-600 flex items-center justify-center gap-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
				animate={{
					y: isPressed ? 4 : isHovered ? -1 : 0,
				}}
				transition={{ type: "spring", stiffness: 400, damping: 20 }}
			>
				{/* Industrial Stripes */}
				<div className="absolute left-2 w-1 h-6 flex flex-col gap-1 opacity-30">
					<div className="w-full h-full bg-black rounded-full"></div>
				</div>
				<div className="absolute right-2 w-1 h-6 flex flex-col gap-1 opacity-30">
					<div className="w-full h-full bg-black rounded-full"></div>
				</div>

				<Upload className="w-4 h-4 text-zinc-200" />
				<span className="text-xs font-bold text-zinc-200 tracking-wider uppercase">
					UPLOAD
				</span>
			</motion.div>

			{/* Disabled Overlay */}
			{disabled && (
				<div className="absolute inset-0 bg-black/50 rounded-lg cursor-not-allowed" />
			)}
		</div>
	);
}
