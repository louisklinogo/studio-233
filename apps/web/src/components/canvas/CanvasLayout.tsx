"use client";

import { motion } from "framer-motion";
import React from "react";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";

interface CanvasLayoutProps {
	isCalibrated: boolean;
	onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
	children: React.ReactNode;
}

export const CanvasLayout: React.FC<CanvasLayoutProps> = ({
	isCalibrated,
	onDrop,
	children,
}) => {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.98 }}
			animate={
				isCalibrated ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.98 }
			}
			transition={{ duration: 0.8, ease: "easeOut" }}
			className="bg-neutral-50 dark:bg-[#050505] text-foreground font-focal relative flex flex-row w-full overflow-hidden h-screen"
			style={{ height: "100dvh" }}
			onDrop={onDrop}
			onDragOver={(e) => e.preventDefault()}
			onDragEnter={(e) => e.preventDefault()}
			onDragLeave={(e) => e.preventDefault()}
		>
			<BackgroundGrid />
			{children}
		</motion.div>
	);
};
