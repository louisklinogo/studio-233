import { motion } from "framer-motion";
import React from "react";
import { cn } from "@/lib/utils";

interface WorkbenchStageProps {
	children?: React.ReactNode;
	className?: string;
}

export function WorkbenchStage({ children, className }: WorkbenchStageProps) {
	return (
		<div
			className={cn(
				"flex-1 relative bg-background overflow-hidden flex flex-col",
				className,
			)}
		>
			{/* Dot Pattern Background */}
			<div
				className="absolute inset-0 z-0 opacity-[0.4]"
				style={{
					backgroundImage: "radial-gradient(#e5e7eb 1px, transparent 1px)",
					backgroundSize: "24px 24px",
				}}
			/>

			{/* Content Layer */}
			<div className="relative z-10 flex-1 flex flex-col">{children}</div>
		</div>
	);
}

export function EmptyWorkbenchState() {
	return (
		<div className="flex-1 flex flex-col items-center justify-center p-8 text-center perspective-[1000px]">
			<motion.div
				initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
				animate={{ opacity: 1, scale: 1, rotateX: 0 }}
				transition={{ delay: 0.2, type: "spring", stiffness: 100, damping: 20 }}
				className="max-w-md space-y-8 flex flex-col items-center"
			>
				{/* 3D Glass Cube */}
				<div className="relative w-32 h-32 transform-style-3d animate-float">
					<div className="absolute inset-0 transform-style-3d rotate-x-12 rotate-y-12 hover:rotate-y-[45deg] transition-transform duration-1000 ease-in-out">
						{/* Cube Faces */}
						<div className="absolute inset-0 border border-white/20 bg-white/5 backdrop-blur-md rounded-xl translate-z-[32px] shadow-lg" />
						<div className="absolute inset-0 border border-white/20 bg-white/5 backdrop-blur-md rounded-xl translate-z-[-32px]" />
						<div className="absolute inset-0 border border-white/20 bg-white/5 backdrop-blur-md rounded-xl rotate-y-90 translate-z-[32px]" />
						<div className="absolute inset-0 border border-white/20 bg-white/5 backdrop-blur-md rounded-xl rotate-y-90 translate-z-[-32px]" />
						<div className="absolute inset-0 border border-white/20 bg-white/5 backdrop-blur-md rounded-xl rotate-x-90 translate-z-[32px]" />
						<div className="absolute inset-0 border border-white/20 bg-white/5 backdrop-blur-md rounded-xl rotate-x-90 translate-z-[-32px]" />

						{/* Inner Glow */}
						<div className="absolute inset-4 bg-primary/20 rounded-full blur-xl animate-pulse translate-z-0" />
					</div>
				</div>

				<div className="space-y-2">
					<h3 className="text-xl font-semibold text-foreground tracking-tight">
						Ready to Create
					</h3>
					<p className="text-muted-foreground max-w-xs mx-auto leading-relaxed">
						Select assets from the library or use the chat to start a new
						workflow.
					</p>
				</div>
			</motion.div>

			<style jsx global>{`
				.transform-style-3d {
					transform-style: preserve-3d;
				}
				.translate-z-\[32px\] { transform: translateZ(32px); }
				.translate-z-\[-32px\] { transform: translateZ(-32px); }
				.rotate-y-90 { transform: rotateY(90deg); }
				.rotate-x-90 { transform: rotateX(90deg); }
				.rotate-x-12 { transform: rotateX(12deg); }
				.rotate-y-12 { transform: rotateY(12deg); }
				@keyframes float {
					0%, 100% { transform: translateY(0px); }
					50% { transform: translateY(-10px); }
				}
				.animate-float {
					animation: float 6s ease-in-out infinite;
				}
			`}</style>
		</div>
	);
}
