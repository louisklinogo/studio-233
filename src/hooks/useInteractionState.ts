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

	return {
		activeTool,
		setActiveTool,
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
