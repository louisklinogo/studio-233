import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import React from "react";

export function EmptyStateConversationStack() {
	const [isHovered, setIsHovered] = React.useState(false);

	return (
		<div
			className="relative flex items-center justify-center w-48 h-48 cursor-pointer"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{/* Bubble 3 (Back) */}
			<motion.div
				className="absolute w-32 h-16 bg-muted rounded-2xl border border-border/50 shadow-sm z-0"
				initial={{ y: 20, scale: 0.85, opacity: 0.6 }}
				animate={{
					y: isHovered ? 35 : 20,
					rotate: isHovered ? -5 : 0,
					scale: 0.85,
				}}
				transition={{ type: "spring", stiffness: 200, damping: 20 }}
			/>

			{/* Bubble 2 (Middle) */}
			<motion.div
				className="absolute w-36 h-20 bg-background rounded-2xl border border-border shadow-sm z-10 flex items-center justify-center"
				initial={{ y: 10, scale: 0.92, opacity: 0.8 }}
				animate={{
					y: isHovered ? 0 : 10,
					rotate: isHovered ? 3 : 0,
					scale: 0.92,
				}}
				transition={{ type: "spring", stiffness: 200, damping: 20 }}
			>
				<div className="w-16 h-2 bg-muted rounded-full opacity-50" />
			</motion.div>

			{/* Bubble 1 (Front) */}
			<motion.div
				className="absolute w-40 h-24 bg-gradient-to-br from-background to-muted/50 backdrop-blur-sm rounded-2xl rounded-tl-none border border-primary/20 shadow-lg z-20 flex items-center justify-center overflow-hidden"
				initial={{ y: 0, scale: 1 }}
				animate={{
					y: isHovered ? -25 : 0,
					rotate: isHovered ? -2 : 0,
					scale: 1,
				}}
				transition={{ type: "spring", stiffness: 200, damping: 20 }}
			>
				{/* Glass Shine */}
				<div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50" />

				{/* Content */}
				<div className="flex gap-3 items-center">
					<div className="p-2 bg-primary/10 rounded-full">
						<MessageSquare className="w-5 h-5 text-primary" />
					</div>
					<div className="space-y-2">
						<div className="w-16 h-2 bg-primary/20 rounded-full" />
						<div className="w-10 h-2 bg-primary/10 rounded-full" />
					</div>
				</div>
			</motion.div>

			{/* Shadow */}
			<motion.div
				className="absolute bottom-10 w-24 h-4 bg-black/10 rounded-[100%] blur-lg z-0"
				animate={{
					scale: isHovered ? 0.9 : 1,
					opacity: isHovered ? 0.3 : 0.5,
				}}
			/>
		</div>
	);
}
