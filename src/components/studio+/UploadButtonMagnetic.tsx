import { motion } from "framer-motion";
import { CloudUpload } from "lucide-react";
import React from "react";

interface UploadButtonProps {
	onClick: () => void;
	disabled?: boolean;
}

export function UploadButtonMagnetic({ onClick, disabled }: UploadButtonProps) {
	const [isHovered, setIsHovered] = React.useState(false);

	return (
		<div
			className="relative w-12 h-12 cursor-pointer flex items-center justify-center"
			onMouseEnter={() => !disabled && setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onClick={!disabled ? onClick : undefined}
		>
			{/* Shadow / Base */}
			<motion.div
				className="absolute bottom-0 w-10 h-10 bg-zinc-900/50 rounded-xl blur-md"
				animate={{
					scale: isHovered ? 0.8 : 1,
					opacity: isHovered ? 0.3 : 0.6,
				}}
			/>

			{/* Floating Cube */}
			<motion.div
				className="relative w-10 h-10 bg-zinc-800 rounded-xl border border-zinc-700 flex items-center justify-center shadow-xl"
				animate={{
					y: isHovered ? -6 : 0,
					scale: isHovered ? 1.05 : 1,
				}}
				transition={{ type: "spring", stiffness: 300, damping: 20 }}
			>
				<CloudUpload className="w-5 h-5 text-zinc-400" />

				{/* Corner Accents */}
				<div className="absolute top-1 left-1 w-1 h-1 bg-zinc-600 rounded-full" />
				<div className="absolute bottom-1 right-1 w-1 h-1 bg-zinc-600 rounded-full" />
			</motion.div>

			{/* Disabled Overlay */}
			{disabled && (
				<div className="absolute inset-0 bg-black/50 rounded-xl cursor-not-allowed" />
			)}
		</div>
	);
}
