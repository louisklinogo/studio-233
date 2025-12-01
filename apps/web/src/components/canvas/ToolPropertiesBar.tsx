"use client";

import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { cn } from "@/lib/utils";
import { StudioBrushSelector } from "./tool-options/StudioBrushSelector";
import { StudioColorPicker } from "./tool-options/StudioColorPicker";
import { StudioFontSelector } from "./tool-options/StudioFontSelector";
import {
	type ShapeType,
	StudioShapeSelector,
} from "./tool-options/StudioShapeSelector";

export type ToolType = "select" | "pan" | "text" | "shape" | "draw" | "add";

interface ToolPropertiesBarProps {
	activeTool: ToolType;
	// Text Props
	fontFamily?: string;
	setFontFamily?: (font: string) => void;
	fontSize?: number;
	setFontSize?: (size: number) => void;
	textColor?: string;
	setTextColor?: (color: string) => void;
	// Shape Props
	shapeType?: ShapeType;
	setShapeType?: (type: ShapeType) => void;
	fillColor?: string;
	setFillColor?: (color: string) => void;
	strokeColor?: string;
	setStrokeColor?: (color: string) => void;
	// Brush Props
	brushSize?: number;
	setBrushSize?: (size: number) => void;
	brushOpacity?: number;
	setBrushOpacity?: (opacity: number) => void;
	brushColor?: string;
	setBrushColor?: (color: string) => void;
}

export const ToolPropertiesBar: React.FC<ToolPropertiesBarProps> = ({
	activeTool,
	fontFamily = "Inter",
	setFontFamily,
	fontSize = 16,
	setFontSize,
	textColor = "#000000",
	setTextColor,
	shapeType = "rectangle",
	setShapeType,
	fillColor = "#000000",
	setFillColor,
	strokeColor = "transparent",
	setStrokeColor,
	brushSize = 5,
	setBrushSize,
	brushOpacity = 100,
	setBrushOpacity,
	brushColor = "#000000",
	setBrushColor,
}) => {
	// Only show for creation tools
	if (!["text", "shape", "draw"].includes(activeTool)) return null;

	return (
		<div className="fixed top-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
			<AnimatePresence mode="wait">
				<motion.div
					key={activeTool}
					initial={{ opacity: 0, y: -20, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: -10, scale: 0.95 }}
					transition={{ type: "spring", stiffness: 400, damping: 30 }}
					className={cn(
						"pointer-events-auto",
						"flex items-center p-1 gap-2",
						"bg-[#f4f4f0] dark:bg-[#111111]",
						"border border-neutral-200 dark:border-neutral-800",
						"rounded-md shadow-sm backdrop-blur-sm",
					)}
				>
					{/* Tool Label */}
					<div className="px-3 py-1 bg-neutral-200 dark:bg-neutral-800 rounded-sm">
						<span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
							{activeTool}
						</span>
					</div>

					<div className="w-[1px] h-4 bg-neutral-200 dark:bg-neutral-800" />

					{/* Text Options */}
					{activeTool === "text" && setFontFamily && setTextColor && (
						<>
							<StudioFontSelector value={fontFamily} onChange={setFontFamily} />
							<div className="w-[1px] h-4 bg-neutral-200 dark:bg-neutral-800" />
							<StudioColorPicker
								color={textColor}
								onChange={setTextColor}
								label="COLOR"
							/>
						</>
					)}

					{/* Shape Options */}
					{activeTool === "shape" &&
						setShapeType &&
						setFillColor &&
						setStrokeColor && (
							<>
								<StudioShapeSelector
									value={shapeType}
									onChange={setShapeType}
								/>
								<div className="w-[1px] h-4 bg-neutral-200 dark:bg-neutral-800" />
								<StudioColorPicker
									color={fillColor}
									onChange={setFillColor}
									label="FILL"
								/>
								<StudioColorPicker
									color={strokeColor}
									onChange={setStrokeColor}
									label="STROKE"
								/>
							</>
						)}

					{/* Draw Options */}
					{activeTool === "draw" &&
						setBrushSize &&
						setBrushOpacity &&
						setBrushColor && (
							<>
								<StudioBrushSelector
									size={brushSize}
									onSizeChange={setBrushSize}
									opacity={brushOpacity}
									onOpacityChange={setBrushOpacity}
								/>
								<div className="w-[1px] h-4 bg-neutral-200 dark:bg-neutral-800" />
								<StudioColorPicker
									color={brushColor}
									onChange={setBrushColor}
									label="COLOR"
								/>
							</>
						)}
				</motion.div>
			</AnimatePresence>
		</div>
	);
};
