import { motion } from "framer-motion";
import { Command, Layers, TerminalSquare } from "lucide-react";
import React from "react";

export function EmptyStateProcessingTray() {
	const [isHovered, setIsHovered] = React.useState(false);

	return (
		<div
			className="relative flex items-center justify-center w-48 h-48 cursor-pointer perspective-1000"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{/* Tray Base */}
			<motion.div
				className="absolute bottom-12 w-40 h-24 bg-muted/30 border border-border/50 rounded-lg transform rotate-x-12 shadow-inner z-0"
				style={{ rotateX: 45 }}
			/>

			{/* Card 3 */}
			<motion.div
				className="absolute w-28 h-36 bg-background border border-border/50 rounded-lg shadow-sm z-10 flex items-center justify-center"
				initial={{ y: 10, z: -20, scale: 0.9 }}
				animate={{
					y: isHovered ? -10 : 10,
					rotateZ: isHovered ? -10 : -5,
					x: isHovered ? -20 : -5,
				}}
				transition={{ type: "spring", stiffness: 150, damping: 20 }}
			>
				<TerminalSquare className="w-8 h-8 text-muted-foreground/20" />
			</motion.div>

			{/* Card 2 */}
			<motion.div
				className="absolute w-28 h-36 bg-background border border-border/50 rounded-lg shadow-sm z-20 flex items-center justify-center"
				initial={{ y: 15, z: -10, scale: 0.95 }}
				animate={{
					y: isHovered ? 0 : 15,
					rotateZ: isHovered ? 5 : 2,
					x: isHovered ? 20 : 5,
				}}
				transition={{ type: "spring", stiffness: 150, damping: 20 }}
			>
				<Layers className="w-8 h-8 text-muted-foreground/30" />
			</motion.div>

			{/* Card 1 (Front) */}
			<motion.div
				className="absolute w-28 h-36 bg-gradient-to-br from-background to-muted rounded-lg border border-primary/20 shadow-lg z-30 flex flex-col items-center justify-center gap-3"
				initial={{ y: 20, z: 0, scale: 1 }}
				animate={{
					y: isHovered ? -20 : 20,
					rotateZ: isHovered ? 0 : 0,
					scale: isHovered ? 1.05 : 1,
				}}
				transition={{ type: "spring", stiffness: 150, damping: 20 }}
			>
				<div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
					<Command className="w-6 h-6 text-primary" />
				</div>
				<div className="w-16 h-1.5 bg-muted-foreground/20 rounded-full" />
			</motion.div>
		</div>
	);
}
