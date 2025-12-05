"use client";

import { motion } from "framer-motion";
import React from "react";
import { StudioBrushSelector } from "@/components/canvas/tool-options/StudioBrushSelector";
import { StudioColorPicker } from "@/components/canvas/tool-options/StudioColorPicker";
import { StudioFontSelector } from "@/components/canvas/tool-options/StudioFontSelector";
import { SwissIcons } from "@/components/ui/SwissIcons";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ToolPropertiesBarProps {
	activeTool: "select" | "text" | "shape" | "draw";
	fontFamily?: string;
	setFontFamily?: (font: string) => void;
	textColor?: string;
	setTextColor?: (color: string) => void;
	shapeType?: "rectangle" | "circle" | "triangle";
	setShapeType?: (type: "rectangle" | "circle" | "triangle") => void;
	fillColor?: string;
	setFillColor?: (color: string) => void;
	strokeColor?: string;
	setStrokeColor?: (color: string) => void;
	brushSize?: number;
	setBrushSize?: (size: number) => void;
	brushOpacity?: number;
	setBrushOpacity?: (opacity: number) => void;
	brushColor?: string;
	setBrushColor?: (color: string) => void;
}

const Separator = () => (
	<div className="w-[1px] h-6 bg-neutral-300 dark:bg-neutral-700 mx-[1px]" />
);

const Label = ({ children }: { children: React.ReactNode }) => (
	<div className="h-10 px-3 flex items-center justify-center bg-[#f4f4f0] dark:bg-[#111111] text-[10px] font-mono uppercase tracking-wider text-neutral-400 select-none">
		{children}
	</div>
);

export const ToolPropertiesBar: React.FC<ToolPropertiesBarProps> = ({
	activeTool,
	fontFamily,
	setFontFamily,
	textColor,
	setTextColor,
	shapeType,
	setShapeType,
	fillColor,
	setFillColor,
	strokeColor,
	setStrokeColor,
	brushSize,
	setBrushSize,
	brushOpacity,
	setBrushOpacity,
	brushColor,
	setBrushColor,
}) => {
	if (activeTool === "select") return null;

	return (
		<div className="fixed top-6 left-1/2 -translate-x-1/2 z-40">
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -20 }}
				transition={{ type: "spring", stiffness: 400, damping: 30 }}
				className={cn(
					"flex items-center gap-[1px]",
					"bg-neutral-200 dark:bg-neutral-800", // Grid lines
					"border border-neutral-300 dark:border-neutral-700",
					"rounded-sm shadow-xl overflow-hidden",
				)}
			>
				{/* Inner container for solid background of items */}
				<div className="flex items-center gap-[1px] bg-neutral-200 dark:bg-neutral-800">
					{/* Tool Label */}
					<Label>{activeTool}</Label>

					<Separator />

					{activeTool === "text" && (
						<>
							<div className="bg-[#f4f4f0] dark:bg-[#111111] h-10 flex items-center px-1">
								<StudioFontSelector
									value={fontFamily || "Inter"}
									onChange={setFontFamily || (() => {})}
								/>
							</div>
							<Separator />
							<div className="bg-[#f4f4f0] dark:bg-[#111111] h-10 flex items-center px-1">
								<StudioColorPicker
									color={textColor || "#000000"}
									onChange={setTextColor || (() => {})}
								/>
							</div>
						</>
					)}

					{activeTool === "shape" && (
						<>
							<div className="bg-[#f4f4f0] dark:bg-[#111111] h-10 flex items-center px-1 gap-1">
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<button
												onClick={() => setShapeType?.("rectangle")}
												className={cn(
													"p-2 rounded-sm hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors",
													shapeType === "rectangle" &&
														"bg-neutral-200 dark:bg-neutral-800",
												)}
											>
												<div className="w-4 h-4 border-2 border-current rounded-[1px]" />
											</button>
										</TooltipTrigger>
										<TooltipContent>Rectangle</TooltipContent>
									</Tooltip>
									<Tooltip>
										<TooltipTrigger asChild>
											<button
												onClick={() => setShapeType?.("circle")}
												className={cn(
													"p-2 rounded-sm hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors",
													shapeType === "circle" &&
														"bg-neutral-200 dark:bg-neutral-800",
												)}
											>
												<div className="w-4 h-4 border-2 border-current rounded-full" />
											</button>
										</TooltipTrigger>
										<TooltipContent>Circle</TooltipContent>
									</Tooltip>
									<Tooltip>
										<TooltipTrigger asChild>
											<button
												onClick={() => setShapeType?.("triangle")}
												className={cn(
													"p-2 rounded-sm hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors",
													shapeType === "triangle" &&
														"bg-neutral-200 dark:bg-neutral-800",
												)}
											>
												<div
													className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-current"
													style={{ transform: "translateY(-1px)" }}
												/>
											</button>
										</TooltipTrigger>
										<TooltipContent>Triangle</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
							<Separator />
							<div className="bg-[#f4f4f0] dark:bg-[#111111] h-10 flex items-center px-3 gap-3">
								<div className="flex items-center gap-2">
									<span className="text-[10px] uppercase font-mono text-neutral-400">
										Fill
									</span>
									<StudioColorPicker
										color={fillColor || "#000000"}
										onChange={setFillColor || (() => {})}
									/>
								</div>
								<div className="w-[1px] h-4 bg-neutral-200 dark:bg-neutral-800" />
								<div className="flex items-center gap-2">
									<span className="text-[10px] uppercase font-mono text-neutral-400">
										Stroke
									</span>
									<StudioColorPicker
										color={strokeColor || "transparent"}
										onChange={setStrokeColor || (() => {})}
									/>
								</div>
							</div>
						</>
					)}

					{activeTool === "draw" && (
						<>
							<div className="bg-[#f4f4f0] dark:bg-[#111111] h-10 flex items-center px-1">
								<StudioBrushSelector
									size={brushSize || 5}
									setSize={setBrushSize || (() => {})}
									opacity={brushOpacity || 100}
									setOpacity={setBrushOpacity || (() => {})}
								/>
							</div>
							<Separator />
							<div className="bg-[#f4f4f0] dark:bg-[#111111] h-10 flex items-center px-1">
								<StudioColorPicker
									color={brushColor || "#000000"}
									onChange={setBrushColor || (() => {})}
								/>
							</div>
						</>
					)}
				</div>
			</motion.div>
		</div>
	);
};
