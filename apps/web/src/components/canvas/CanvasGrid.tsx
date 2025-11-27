import { useTheme } from "next-themes";
import React from "react";
import { Group, Line } from "react-konva";

interface CanvasGridProps {
	viewport: {
		x: number;
		y: number;
		scale: number;
	};
	canvasSize: {
		width: number;
		height: number;
	};
	gridSize?: number;
	gridColor?: string;
}

export const CanvasGrid: React.FC<CanvasGridProps> = ({
	viewport,
	canvasSize,
	// Match Dashboard: 40px grid size
	gridSize = 40,
	gridColor,
}) => {
	const { resolvedTheme } = useTheme();

	// Match Dashboard: #80808012 (approx 7% opacity gray)
	// Canvas rendering often needs slightly higher opacity than CSS for 1px lines to appear visually similar
	const effectiveGridColor =
		gridColor ||
		(resolvedTheme === "dark"
			? "rgba(128, 128, 128, 0.2)"
			: "rgba(128, 128, 128, 0.12)");
	const lines = [];

	// Calculate visible area in canvas coordinates
	const startX = Math.floor(-viewport.x / viewport.scale / gridSize) * gridSize;
	const startY = Math.floor(-viewport.y / viewport.scale / gridSize) * gridSize;
	const endX =
		Math.ceil((canvasSize.width - viewport.x) / viewport.scale / gridSize) *
		gridSize;
	const endY =
		Math.ceil((canvasSize.height - viewport.y) / viewport.scale / gridSize) *
		gridSize;

	// Vertical lines
	for (let x = startX; x <= endX; x += gridSize) {
		lines.push(
			<Line
				key={`v-${x}`}
				points={[x, startY, x, endY]}
				stroke={effectiveGridColor}
				strokeWidth={1 / viewport.scale} // Keep line width constant on screen
			/>,
		);
	}

	// Horizontal lines
	for (let y = startY; y <= endY; y += gridSize) {
		lines.push(
			<Line
				key={`h-${y}`}
				points={[startX, y, endX, y]}
				stroke={effectiveGridColor}
				strokeWidth={1 / viewport.scale} // Keep line width constant on screen
			/>,
		);
	}

	return <Group>{lines}</Group>;
};
