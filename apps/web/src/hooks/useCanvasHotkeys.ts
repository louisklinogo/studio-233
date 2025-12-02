import type { GenerationSettings, PlacedImage } from "@studio233/canvas";
import { useEffect } from "react";

interface UseCanvasHotkeysParams {
	selectedIds: string[];
	images: PlacedImage[];
	isGenerating: boolean;
	generationSettings: GenerationSettings;
	undo: () => void;
	redo: () => void;
	setSelectedIds: (ids: string[]) => void;
	handleDelete: () => void;
	removeCanvasElement: (id: string) => void;
	handleDuplicate: () => void;
	handleRun: () => void;
	sendToFront: () => void;
	sendToBack: () => void;
	bringForward: () => void;
	sendBackward: () => void;
	croppingImageId: string | null;
	setCroppingImageId: (id: string | null) => void;
	zoomIn: () => void;
	zoomOut: () => void;
	resetZoom: () => void;
}

export function useCanvasHotkeys({
	selectedIds,
	images,
	isGenerating,
	generationSettings,
	undo,
	redo,
	setSelectedIds,
	handleDelete,
	removeCanvasElement,
	handleDuplicate,
	handleRun,
	sendToFront,
	sendToBack,
	bringForward,
	sendBackward,
	croppingImageId,
	setCroppingImageId,
	zoomIn,
	zoomOut,
	resetZoom,
}: UseCanvasHotkeysParams) {
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			const isMetaOrCtrl = event.metaKey || event.ctrlKey;
			const target = event.target as HTMLElement | null;
			const isInputElement =
				target?.matches("input, textarea") || target?.isContentEditable;

			// Undo / Redo
			if (isMetaOrCtrl && event.key === "z" && !event.shiftKey) {
				if (isInputElement) return;
				event.preventDefault();
				undo();
				return;
			}

			if (
				isMetaOrCtrl &&
				((event.key === "z" && event.shiftKey) ||
					event.key.toLowerCase() === "y")
			) {
				if (isInputElement) return;
				event.preventDefault();
				redo();
				return;
			}

			// Select all images
			if (isMetaOrCtrl && event.key.toLowerCase() === "a" && !isInputElement) {
				event.preventDefault();
				setSelectedIds(images.map((img) => img.id));
				return;
			}

			// Delete
			if (
				(event.key === "Delete" || event.key === "Backspace") &&
				!isInputElement
			) {
				if (selectedIds.length > 0) {
					event.preventDefault();
					handleDelete();
					selectedIds.forEach((id) => removeCanvasElement(id));
				}
				return;
			}

			// Duplicate
			if (isMetaOrCtrl && event.key.toLowerCase() === "d" && !isInputElement) {
				event.preventDefault();
				if (selectedIds.length > 0) {
					handleDuplicate();
				}
				return;
			}

			// Run generation
			if (
				isMetaOrCtrl &&
				(event.key === "Enter" || event.key === "Return") &&
				!isInputElement
			) {
				event.preventDefault();
				if (!isGenerating && generationSettings.prompt.trim()) {
					handleRun();
				}
				return;
			}

			// Layer ordering
			if (event.key === "]" && !isInputElement) {
				event.preventDefault();
				if (selectedIds.length > 0) {
					if (isMetaOrCtrl) {
						sendToFront();
					} else {
						bringForward();
					}
				}
				return;
			}

			if (event.key === "[" && !isInputElement) {
				event.preventDefault();
				if (selectedIds.length > 0) {
					if (isMetaOrCtrl) {
						sendToBack();
					} else {
						sendBackward();
					}
				}
				return;
			}

			// Escape to exit crop mode
			if (event.key === "Escape" && croppingImageId) {
				event.preventDefault();
				setCroppingImageId(null);
				return;
			}

			// Zoom in
			if ((event.key === "+" || event.key === "=") && !isInputElement) {
				event.preventDefault();
				zoomIn();
				return;
			}

			// Zoom out
			if (event.key === "-" && !isInputElement) {
				event.preventDefault();
				zoomOut();
				return;
			}

			// Reset zoom
			if (event.key === "0" && isMetaOrCtrl) {
				event.preventDefault();
				resetZoom();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [
		selectedIds,
		images,
		isGenerating,
		generationSettings.prompt,
		undo,
		redo,
		setSelectedIds,
		handleDelete,
		removeCanvasElement,
		handleDuplicate,
		handleRun,
		sendToFront,
		sendToBack,
		bringForward,
		sendBackward,
		croppingImageId,
		setCroppingImageId,
		zoomIn,
		zoomOut,
		resetZoom,
	]);
}
