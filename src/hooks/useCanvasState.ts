import { useState, useCallback, useEffect } from "react";
import type {
    PlacedImage,
    PlacedVideo,
    SelectionBox,
    HistoryState,
} from "@/types/canvas";

export function useCanvasState() {
    const [images, setImages] = useState<PlacedImage[]>([]);
    const [videos, setVideos] = useState<PlacedVideo[]>([]);
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
            selectedIds: [...selectedIds],
        };
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newState);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [images, videos, selectedIds, history, historyIndex]);

    // Undo
    const undo = useCallback(() => {
        if (historyIndex > 0) {
            const prevState = history[historyIndex - 1];
            setImages(prevState.images);
            setVideos(prevState.videos || []);
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

        // Update both arrays
        setImages((prev) => [...prev, ...newImages]);
        setVideos((prev) => [...prev, ...newVideos]);

        // Select all duplicated items
        const newIds = [
            ...newImages.map((img) => img.id),
            ...newVideos.map((vid) => vid.id),
        ];
        setSelectedIds(newIds);
    }, [images, videos, selectedIds, saveToHistory]);

    const sendToFront = useCallback(() => {
        if (selectedIds.length === 0) return;

        saveToHistory();
        setImages((prev) => {
            // Get selected images in their current order
            const selectedImages = selectedIds
                .map((id) => prev.find((img) => img.id === id))
                .filter(Boolean) as PlacedImage[];

            // Get remaining images
            const remainingImages = prev.filter(
                (img) => !selectedIds.includes(img.id),
            );

            // Place selected images at the end (top layer)
            return [...remainingImages, ...selectedImages];
        });
    }, [selectedIds, saveToHistory]);

    const sendToBack = useCallback(() => {
        if (selectedIds.length === 0) return;

        saveToHistory();
        setImages((prev) => {
            // Get selected images in their current order
            const selectedImages = selectedIds
                .map((id) => prev.find((img) => img.id === id))
                .filter(Boolean) as PlacedImage[];

            // Get remaining images
            const remainingImages = prev.filter(
                (img) => !selectedIds.includes(img.id),
            );

            // Place selected images at the beginning (bottom layer)
            return [...selectedImages, ...remainingImages];
        });
    }, [selectedIds, saveToHistory]);

    const bringForward = useCallback(() => {
        if (selectedIds.length === 0) return;

        saveToHistory();
        setImages((prev) => {
            const result = [...prev];

            // Process selected images from back to front to maintain relative order
            for (let i = result.length - 2; i >= 0; i--) {
                if (
                    selectedIds.includes(result[i].id) &&
                    !selectedIds.includes(result[i + 1].id)
                ) {
                    // Swap with the next image if it's not also selected
                    [result[i], result[i + 1]] = [result[i + 1], result[i]];
                }
            }

            return result;
        });
    }, [selectedIds, saveToHistory]);

    const sendBackward = useCallback(() => {
        if (selectedIds.length === 0) return;

        saveToHistory();
        setImages((prev) => {
            const result = [...prev];

            // Process selected images from front to back to maintain relative order
            for (let i = 1; i < result.length; i++) {
                if (
                    selectedIds.includes(result[i].id) &&
                    !selectedIds.includes(result[i - 1].id)
                ) {
                    // Swap with the previous image if it's not also selected
                    [result[i], result[i - 1]] = [result[i - 1], result[i]];
                }
            }

            return result;
        });
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
    };
}
