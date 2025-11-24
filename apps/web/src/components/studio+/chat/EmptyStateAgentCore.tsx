import { motion } from "framer-motion";
import { Code2, Sparkles, Zap } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

export function EmptyStateAgentCore() {
	const [isHovered, setIsHovered] = React.useState(false);

	return (
		<div
			className="relative flex items-center justify-center w-48 h-48 cursor-pointer"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{/* Orbiting Chips */}
			<motion.div
				className="absolute inset-0 flex items-center justify-center"
				animate={{ rotate: 360 }}
				transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
			>
				{/* Chip 1 - Top Left */}
				<motion.div
					className="absolute -top-2 -left-2 w-8 h-8 bg-background/80 backdrop-blur-md rounded-lg border border-border/50 shadow-sm flex items-center justify-center"
					animate={{
						y: isHovered ? -10 : 0,
						scale: isHovered ? 1.1 : 1,
						rotate: -360, // Counter-rotate to keep icon upright-ish relative to screen if desired, or let it spin
					}}
					transition={{
						duration: 20,
						repeat: Infinity,
						ease: "linear",
						reverse: true,
					}}
				>
					<Code2 className="w-4 h-4 text-blue-500" />
				</motion.div>
				{/* Chip 2 - Bottom Right */}
				<motion.div
					className="absolute -bottom-2 -right-2 w-8 h-8 bg-background/80 backdrop-blur-md rounded-lg border border-border/50 shadow-sm flex items-center justify-center"
					animate={{
						y: isHovered ? 10 : 0,
						scale: isHovered ? 1.1 : 1,
					}}
				>
					<Zap className="w-4 h-4 text-amber-500" />
				</motion.div>
			</motion.div>

			{/* Core Glow */}
			<motion.div
				className="absolute inset-0 bg-primary/20 rounded-full blur-3xl"
				animate={{
					scale: isHovered ? 1.2 : 1,
					opacity: isHovered ? 0.5 : 0.3,
				}}
				transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
			/>

			{/* The Glass Cube/Core */}
			<motion.div
				className="relative w-24 h-24 bg-gradient-to-br from-white/40 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl flex items-center justify-center overflow-hidden z-10"
				animate={{
					y: isHovered ? -10 : 0,
					rotate: isHovered ? 5 : 0,
					scale: isHovered ? 1.05 : 1,
				}}
				transition={{ type: "spring", stiffness: 300, damping: 20 }}
			>
				{/* Internal Gradient/Sheen */}
				<div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-50" />

				{/* Core Icon */}
				<motion.div
					animate={{
						scale: isHovered ? [1, 1.2, 1] : 1,
						rotate: isHovered ? [0, 15, -15, 0] : 0,
					}}
					transition={{ duration: 2, repeat: Infinity }}
				>
					<Sparkles className="w-10 h-10 text-primary fill-primary/20" />
				</motion.div>
			</motion.div>

			{/* Reflection/Shadow */}
			<motion.div
				className="absolute bottom-8 w-16 h-4 bg-black/20 rounded-[100%] blur-md z-0"
				animate={{
					scaleX: isHovered ? 0.8 : 1,
					opacity: isHovered ? 0.2 : 0.4,
				}}
			/>
		</div>
	);
}
