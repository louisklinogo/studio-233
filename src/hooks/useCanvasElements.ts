import { useCallback, useState } from "react";
import type {
	CanvasElement,
	DrawingElement,
	ElementType,
	ShapeElement,
	TextElement,
} from "@/types/elements";

export function useCanvasElements() {
	const [elements, setElements] = useState<CanvasElement[]>([]);
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

	const getElement = useCallback(
		(id: string) => {
			return elements.find((el) => el.id === id);
		},
		[elements],
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
		zIndex: elements.length + 1,
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
		zIndex: elements.length + 1,
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
		getElement,
		createDefaultText,
		createDefaultShape,
	};
}
