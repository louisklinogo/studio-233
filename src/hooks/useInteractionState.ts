import { useState } from "react";
import type { ToolType } from "@/components/studio/BottomToolbar";

export function useInteractionState() {
	const [activeTool, setActiveTool] = useState<ToolType>("select");
	const [dragStartPositions, setDragStartPositions] = useState<
		Map<string, { x: number; y: number }>
	>(new Map());
	const [isDraggingImage, setIsDraggingImage] = useState(false);
	const [hiddenVideoControlsIds, setHiddenVideoControlsIds] = useState<
		Set<string>
	>(new Set());
	const [croppingImageId, setCroppingImageId] = useState<string | null>(null);

	// Isolation state
	const [isolateTarget, setIsolateTarget] = useState<string | null>(null);
	const [isolateInputValue, setIsolateInputValue] = useState("");
	const [isIsolating, setIsIsolating] = useState(false);

	// Default properties for tools
	const [defaultTextProps, setDefaultTextProps] = useState({
		fontFamily: "Inter",
		fontSize: 24,
		fill: "#000000",
		align: "left" as const,
	});

	const [defaultShapeProps, setDefaultShapeProps] = useState({
		fill: "#e2e8f0",
		stroke: "#64748b",
		strokeWidth: 2,
		cornerRadius: 0,
		shapeType: "rect" as const,
	});

	const [defaultDrawingProps, setDefaultDrawingProps] = useState({
		stroke: "#000000",
		strokeWidth: 3,
		tension: 0.5,
	});

	return {
		activeTool,
		setActiveTool,
		defaultTextProps,
		setDefaultTextProps,
		defaultShapeProps,
		setDefaultShapeProps,
		defaultDrawingProps,
		setDefaultDrawingProps,
		dragStartPositions,
		setDragStartPositions,
		isDraggingImage,
		setIsDraggingImage,
		hiddenVideoControlsIds,
		setHiddenVideoControlsIds,
		croppingImageId,
		setCroppingImageId,
		isolateTarget,
		setIsolateTarget,
		isolateInputValue,
		setIsolateInputValue,
		isIsolating,
		setIsIsolating,
	};
}
