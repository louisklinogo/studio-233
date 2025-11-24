import { useCallback, useEffect, useState } from "react";
import type {
	HistoryState,
	PlacedImage,
	PlacedVideo,
	SelectionBox,
} from "@studio233/canvas";
import type { CanvasElement } from "@studio233/canvas";

export function useCanvasState() {
	const [images, setImages] = useState<PlacedImage[]>([]);
	const [videos, setVideos] = useState<PlacedVideo[]>([]);
	// Note: elements state is currently managed by useCanvasElements hook separately
	// but for history to work, we need to sync them or merge the hooks.
	// Since useCanvasState is the "master" state manager, it should ideally handle all history.
	// However, useCanvasElements was introduced later.
	// We need to accept elements as props or arguments to saveToHistory if we want to persist them here.
	// OR we update this hook to manage elements as well.
	// Let's update this hook to manage elements, replacing the local state in useCanvasElements eventually,
	// but for now, we will add `elements` to the state here so history works.
	const [elements, setElements] = useState<CanvasElement[]>([]);

	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [selectionBox, setSelectionBox] = useState<SelectionBox>({
		startX: 0,
		startY: 0,
		endX: 0,
		endY: 0,
		visible: false,
	});
	const [isSelecting, setIsSelecting] = useState(false);
	const [history, setHistory] = useState<HistoryState[]>([]);
	const [historyIndex, setHistoryIndex] = useState(-1);

	// Save state to history
	const saveToHistory = useCallback(() => {
		const newState = {
			images: [...images],
			videos: [...videos],
			elements: [...elements],
			selectedIds: [...selectedIds],
		};
		const newHistory = history.slice(0, historyIndex + 1);
		newHistory.push(newState);
		setHistory(newHistory);
		setHistoryIndex(newHistory.length - 1);
	}, [images, videos, elements, selectedIds, history, historyIndex]);

	// Undo
	const undo = useCallback(() => {
		if (historyIndex > 0) {
			const prevState = history[historyIndex - 1];
			setImages(prevState.images);
			setVideos(prevState.videos || []);
			setElements(prevState.elements || []);
			setSelectedIds(prevState.selectedIds);
			setHistoryIndex(historyIndex - 1);
		}
	}, [history, historyIndex]);

	// Redo
	const redo = useCallback(() => {
		if (historyIndex < history.length - 1) {
			const nextState = history[historyIndex + 1];
			setImages(nextState.images);
			setVideos(nextState.videos || []);
			setElements(nextState.elements || []);
			setSelectedIds(nextState.selectedIds);
			setHistoryIndex(historyIndex + 1);
		}
	}, [history, historyIndex]);

	// Save initial state
	useEffect(() => {
		if (history.length === 0) {
			saveToHistory();
		}
	}, []);

	const deleteSelected = useCallback(() => {
		// Save to history before deleting
		saveToHistory();
		setImages((prev) => prev.filter((img) => !selectedIds.includes(img.id)));
		setVideos((prev) => prev.filter((vid) => !selectedIds.includes(vid.id)));
		setElements((prev) => prev.filter((el) => !selectedIds.includes(el.id)));
		setSelectedIds([]);
	}, [selectedIds, saveToHistory]);

	const duplicateSelected = useCallback(() => {
		// Save to history before duplicating
		saveToHistory();

		// Duplicate selected images
		const selectedImages = images.filter((img) => selectedIds.includes(img.id));
		const newImages = selectedImages.map((img) => ({
			...img,
			id: `img-${Date.now()}-${Math.random()}`,
			x: img.x + 20,
			y: img.y + 20,
		}));

		// Duplicate selected videos
		const selectedVideos = videos.filter((vid) => selectedIds.includes(vid.id));
		const newVideos = selectedVideos.map((vid) => ({
			...vid,
			id: `vid-${Date.now()}-${Math.random()}`,
			x: vid.x + 20,
			y: vid.y + 20,
			// Reset playback state for duplicated videos
			currentTime: 0,
			isPlaying: false,
		}));

		// Duplicate selected elements
		const selectedElements = elements.filter((el) =>
			selectedIds.includes(el.id),
		);
		const newElements = selectedElements.map((el) => ({
			...el,
			id: `el-${Date.now()}-${Math.random()}`,
			x: el.x + 20,
			y: el.y + 20,
		}));

		// Update both arrays
		setImages((prev) => [...prev, ...newImages]);
		setVideos((prev) => [...prev, ...newVideos]);
		setElements((prev) => [...prev, ...newElements]);

		// Select all duplicated items
		const newIds = [
			...newImages.map((img) => img.id),
			...newVideos.map((vid) => vid.id),
			...newElements.map((el) => el.id),
		];
		setSelectedIds(newIds);
	}, [images, videos, elements, selectedIds, saveToHistory]);

	const sendToFront = useCallback(() => {
		if (selectedIds.length === 0) return;

		saveToHistory();

		// Handle Images
		setImages((prev) => {
			const selected = prev.filter((i) => selectedIds.includes(i.id));
			const remaining = prev.filter((i) => !selectedIds.includes(i.id));
			return selected.length ? [...remaining, ...selected] : prev;
		});

		// Handle Elements
		setElements((prev) => {
			const selected = prev.filter((e) => selectedIds.includes(e.id));
			const remaining = prev.filter((e) => !selectedIds.includes(e.id));
			return selected.length ? [...remaining, ...selected] : prev;
		});
	}, [selectedIds, saveToHistory]);

	const sendToBack = useCallback(() => {
		if (selectedIds.length === 0) return;

		saveToHistory();

		setImages((prev) => {
			const selected = prev.filter((i) => selectedIds.includes(i.id));
			const remaining = prev.filter((i) => !selectedIds.includes(i.id));
			return selected.length ? [...selected, ...remaining] : prev;
		});

		setElements((prev) => {
			const selected = prev.filter((e) => selectedIds.includes(e.id));
			const remaining = prev.filter((e) => !selectedIds.includes(e.id));
			return selected.length ? [...selected, ...remaining] : prev;
		});
	}, [selectedIds, saveToHistory]);

	const bringForward = useCallback(() => {
		if (selectedIds.length === 0) return;
		saveToHistory();

		// Simple implementation: Move selected items one step up in their respective arrays
		const moveUp = <T extends { id: string }>(items: T[]) => {
			const result = [...items];
			for (let i = result.length - 2; i >= 0; i--) {
				if (
					selectedIds.includes(result[i].id) &&
					!selectedIds.includes(result[i + 1].id)
				) {
					[result[i], result[i + 1]] = [result[i + 1], result[i]];
				}
			}
			return result;
		};

		setImages(moveUp);
		setElements(moveUp);
	}, [selectedIds, saveToHistory]);

	const sendBackward = useCallback(() => {
		if (selectedIds.length === 0) return;
		saveToHistory();

		const moveDown = <T extends { id: string }>(items: T[]) => {
			const result = [...items];
			for (let i = 1; i < result.length; i++) {
				if (
					selectedIds.includes(result[i].id) &&
					!selectedIds.includes(result[i - 1].id)
				) {
					[result[i], result[i - 1]] = [result[i - 1], result[i]];
				}
			}
			return result;
		};

		setImages(moveDown);
		setElements(moveDown);
	}, [selectedIds, saveToHistory]);

	return {
		images,
		setImages,
		videos,
		setVideos,
		selectedIds,
		setSelectedIds,
		selectionBox,
		setSelectionBox,
		isSelecting,
		setIsSelecting,
		history,
		setHistory,
		historyIndex,
		setHistoryIndex,
		saveToHistory,
		undo,
		redo,
		deleteSelected,
		duplicateSelected,
		sendToFront,
		sendToBack,
		bringForward,
		sendBackward,
		elements,
		setElements,
	};
}
