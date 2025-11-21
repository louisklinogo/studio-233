import { motion } from "framer-motion";
import React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateCardStackProps {
	isDragging: boolean;
	onClick: () => void;
}

export function EmptyStateCardStack({
	isDragging,
	onClick,
}: EmptyStateCardStackProps) {
	const [isHovered, setIsHovered] = React.useState(false);
	const isActive = isDragging || isHovered;

	return (
		<div
			className={cn(
				"absolute inset-0 flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all duration-500 group",
				isDragging ? "bg-primary/5" : "hover:bg-muted/5",
			)}
			onClick={onClick}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{/* 3D Folder Container */}
			<div className="relative w-32 h-28 mb-10 perspective-1000">
				{/* Folder Back (Dark & Rounded) */}
				<div className="absolute inset-0 bg-[#1a1a1a] rounded-2xl shadow-2xl border border-white/5 transform translate-z-0 overflow-hidden">
					{/* Inner shadow/gradient for depth */}
					<div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
				</div>

				{/* Documents Stack */}
				<div className="absolute inset-x-4 bottom-4 h-24 z-10 flex items-end justify-center">
					{/* Doc 3 (Back) */}
					<motion.div
						className="absolute w-20 h-24 bg-[#f0f0f0] rounded-xl shadow-sm border border-white/50"
						initial={{ y: 0, rotate: -5, scale: 0.9 }}
						animate={{
							y: isActive ? -40 : 0,
							rotate: isActive ? -12 : -5,
							scale: 0.9,
						}}
						transition={{
							type: "spring",
							stiffness: 200,
							damping: 20,
							delay: 0.05,
						}}
					/>
					{/* Doc 2 (Middle) */}
					<motion.div
						className="absolute w-20 h-24 bg-[#f5f5f5] rounded-xl shadow-sm border border-white/50"
						initial={{ y: 0, rotate: 5, scale: 0.95 }}
						animate={{
							y: isActive ? -25 : 0,
							rotate: isActive ? 8 : 5,
							scale: 0.95,
						}}
						transition={{
							type: "spring",
							stiffness: 200,
							damping: 20,
							delay: 0.02,
						}}
					/>
					{/* Doc 1 (Front) */}
					<motion.div
						className="absolute w-20 h-24 bg-white rounded-xl shadow-md border border-white/80 flex flex-col p-3 gap-2"
						initial={{ y: 0, rotate: 0, scale: 1 }}
						animate={{
							y: isActive ? -15 : 0,
							rotate: isActive ? -2 : 0,
							scale: 1,
						}}
						transition={{ type: "spring", stiffness: 200, damping: 20 }}
					>
						{/* Skeleton lines */}
						<div className="w-8 h-1.5 bg-zinc-200 rounded-full mb-1" />
						<div className="w-full h-1 bg-zinc-100 rounded-full" />
						<div className="w-full h-1 bg-zinc-100 rounded-full" />
						<div className="w-2/3 h-1 bg-zinc-100 rounded-full" />
					</motion.div>
				</div>

				{/* Folder Front (Glass Pocket) */}
				<div className="absolute inset-x-0 bottom-0 h-[4.5rem] z-20">
					{/* Glass Container with Mask for Curve */}
					<div className="absolute inset-0 overflow-hidden rounded-b-2xl">
						{/* The Glass Itself */}
						<div className="absolute inset-0 bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-md border-t border-white/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]">
							{/* Milky Gradient Overlay */}
							<div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-50" />
						</div>
					</div>

					{/* The Curved Lip (SVG) */}
					<div className="absolute -top-3 left-0 right-0 h-6 z-20">
						<svg
							viewBox="0 0 100 20"
							className="w-full h-full"
							preserveAspectRatio="none"
						>
							<defs>
								<linearGradient
									id="glass-shine"
									x1="0%"
									y1="0%"
									x2="0%"
									y2="100%"
								>
									<stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
									<stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
								</linearGradient>
							</defs>
							{/* Main Shape */}
							<path
								d="M0 20 L0 12 Q0 2 10 2 L35 2 Q45 2 50 8 L100 8 L100 20 Z"
								fill="url(#glass-shine)"
								className="backdrop-blur-md"
							/>
							{/* Border Line */}
							<path
								d="M0 12 Q0 2 10 2 L35 2 Q45 2 50 8 L100 8"
								fill="none"
								stroke="rgba(255,255,255,0.4)"
								strokeWidth="0.5"
							/>
						</svg>
					</div>
				</div>
			</div>

			<motion.div
				initial={{ opacity: 0.8, y: 0 }}
				animate={{
					opacity: 1,
					y: isActive ? 5 : 0,
				}}
				className="relative z-30"
			>
				<h3 className="text-lg font-semibold mb-2 tracking-tight text-foreground">
					{isDragging ? "Drop files now" : "Upload Images"}
				</h3>

				<p className="text-sm text-muted-foreground max-w-[240px] leading-relaxed mb-6 mx-auto">
					Drag & drop your files here, or click to browse
				</p>

				<div className="flex items-center justify-center gap-3 text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
					<span className="bg-muted/50 px-2 py-1 rounded border border-border/50">
						PNG
					</span>
					<span className="bg-muted/50 px-2 py-1 rounded border border-border/50">
						JPG
					</span>
					<span className="bg-muted/50 px-2 py-1 rounded border border-border/50">
						WEBP
					</span>
				</div>
			</motion.div>
		</div>
	);
}
