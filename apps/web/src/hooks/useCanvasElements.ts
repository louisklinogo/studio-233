import { useCallback, useState } from "react";
import type {
	CanvasElement,
	DrawingElement,
	ElementType,
	ShapeElement,
	TextElement,
} from "@studio233/canvas";

export function useCanvasElements() {
	const [elements, setElements] = useState<CanvasElement[]>([]);
	// We might want to use this hook in page.tsx to lift state up, or keep it here if page.tsx delegates.
	// However, page.tsx currently manages images/videos separately.
	// To follow the "Iterative approach", we should probably export these actions
	// so page.tsx can use them or merge them into the main state.

	// But wait, page.tsx has its own `images` and `videos` state.
	// We are adding `texts`, `shapes`, `drawings` alongside them in page.tsx?
	// OR are we going to use `useCanvasElements` to manage ALL of them eventually?

	// For this task, let's assume page.tsx will use this hook or valid equivalents.
	// The user's prompt implies we should "Update CanvasStage.tsx to render new elements".
	// This means the state needs to be passed down to CanvasStage.

	const [selectedElementId, setSelectedElementId] = useState<string | null>(
		null,
	);

	const addElement = useCallback((element: CanvasElement) => {
		setElements((prev) => [...prev, element]);
		setSelectedElementId(element.id);
	}, []);

	const updateElement = useCallback(
		(id: string, updates: Partial<CanvasElement>) => {
			setElements((prev) =>
				prev.map((el) =>
					el.id === id ? ({ ...el, ...updates } as CanvasElement) : el,
				),
			);
		},
		[],
	);

	const removeElement = useCallback(
		(id: string) => {
			setElements((prev) => prev.filter((el) => el.id !== id));
			if (selectedElementId === id) {
				setSelectedElementId(null);
			}
		},
		[selectedElementId],
	);

	// Helper to create defaults
	const createDefaultText = (
		x: number,
		y: number,
		content = "Double click to edit",
	): TextElement => ({
		id: crypto.randomUUID(),
		type: "text",
		x,
		y,
		width: 200,
		height: 50,
		rotation: 0,
		opacity: 1,
		isVisible: true,
		isLocked: false,
		zIndex: 10,
		content,
		fontFamily: "Inter",
		fontSize: 24,
		fill: "#000000",
		align: "left",
	});

	const createDefaultShape = (
		x: number,
		y: number,
		shapeType: ShapeElement["shapeType"] = "rect",
	): ShapeElement => ({
		id: crypto.randomUUID(),
		type: "shape",
		x,
		y,
		width: 100,
		height: 100,
		rotation: 0,
		opacity: 1,
		isVisible: true,
		isLocked: false,
		zIndex: 10,
		shapeType,
		fill: "#e2e8f0",
		stroke: "#64748b",
		strokeWidth: 2,
		cornerRadius: 0,
	});

	return {
		elements,
		setElements,
		selectedElementId,
		setSelectedElementId,
		addElement,
		updateElement,
		removeElement,
		createDefaultText,
		createDefaultShape,
	};
}
