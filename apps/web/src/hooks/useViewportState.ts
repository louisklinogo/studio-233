import Konva from "konva";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PlacedImage } from "@studio233/canvas";

export interface ViewportState {
	x: number;
	y: number;
	scale: number;
}

export function useViewportState(
	images: PlacedImage[],
	isSelecting: boolean,
	isDraggingImage: boolean,
) {
	// Viewport state
	const [viewport, setViewport] = useState<ViewportState>({
		x: 0,
		y: 0,
		scale: 1,
	});

	// Canvas sizing
	const [canvasSize, setCanvasSize] = useState({
		width: 1200,
		height: 800,
	});
	const [isCanvasReady, setIsCanvasReady] = useState(false);
	const containerRef = useRef<HTMLElement>(null);

	// Panning state
	const [isPanningCanvas, setIsPanningCanvas] = useState(false);
	const [lastPanPosition, setLastPanPosition] = useState({ x: 0, y: 0 });

	// Touch gesture state
	const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(
		null,
	);
	const [lastTouchCenter, setLastTouchCenter] = useState<{
		x: number;
		y: number;
	} | null>(null);
	const [isTouchingImage, setIsTouchingImage] = useState(false);

	// Stage ref
	const stageRef = useRef<Konva.Stage>(null);

	// Update canvas size
	const updateCanvasSize = useCallback(() => {
		if (containerRef.current) {
			setCanvasSize({
				width: containerRef.current.offsetWidth,
				height: containerRef.current.offsetHeight,
			});
		}
	}, []);

	// Handle wheel for zoom
	const handleWheel = useCallback(
		(e: Konva.KonvaEventObject<WheelEvent>) => {
			e.evt.preventDefault();

			const stage = stageRef.current;
			if (!stage) return;

			// Check if this is a pinch gesture (ctrl key is pressed on trackpad pinch)
			if (e.evt.ctrlKey) {
				// This is a pinch-to-zoom gesture
				const oldScale = viewport.scale;
				const pointer = stage.getPointerPosition();
				if (!pointer) return;

				const mousePointTo = {
					x: (pointer.x - viewport.x) / oldScale,
					y: (pointer.y - viewport.y) / oldScale,
				};

				// Zoom based on deltaY (negative = zoom in, positive = zoom out)
				const scaleBy = 1.01;
				const direction = e.evt.deltaY > 0 ? -1 : 1;
				const steps = Math.min(Math.abs(e.evt.deltaY), 10);
				let newScale = oldScale;

				for (let i = 0; i < steps; i++) {
					newScale = direction > 0 ? newScale * scaleBy : newScale / scaleBy;
				}

				// Limit zoom (10% to 500%)
				const scale = Math.max(0.1, Math.min(5, newScale));

				const newPos = {
					x: pointer.x - mousePointTo.x * scale,
					y: pointer.y - mousePointTo.y * scale,
				};

				setViewport({ x: newPos.x, y: newPos.y, scale });
			} else {
				// This is a pan gesture (two-finger swipe on trackpad or mouse wheel)
				const deltaX = e.evt.shiftKey ? e.evt.deltaY : e.evt.deltaX;
				const deltaY = e.evt.shiftKey ? 0 : e.evt.deltaY;

				// Invert the direction to match natural scrolling
				setViewport((prev) => ({
					...prev,
					x: prev.x - deltaX,
					y: prev.y - deltaY,
				}));
			}
		},
		[viewport],
	);

	// Touch event handlers for mobile
	const handleTouchStart = useCallback(
		(e: Konva.KonvaEventObject<TouchEvent>) => {
			const touches = e.evt.touches;
			const stage = stageRef.current;

			if (touches.length === 2) {
				// Two fingers - prepare for pinch-to-zoom
				const touch1 = { x: touches[0].clientX, y: touches[0].clientY };
				const touch2 = { x: touches[1].clientX, y: touches[1].clientY };

				const distance = Math.sqrt(
					Math.pow(touch2.x - touch1.x, 2) + Math.pow(touch2.y - touch1.y, 2),
				);

				const center = {
					x: (touch1.x + touch2.x) / 2,
					y: (touch1.y + touch2.y) / 2,
				};

				setLastTouchDistance(distance);
				setLastTouchCenter(center);
			} else if (touches.length === 1) {
				// Single finger - check if touching an image
				const touch = { x: touches[0].clientX, y: touches[0].clientY };

				// Check if we're touching an image
				if (stage) {
					const pos = stage.getPointerPosition();
					if (pos) {
						const canvasPos = {
							x: (pos.x - viewport.x) / viewport.scale,
							y: (pos.y - viewport.y) / viewport.scale,
						};

						// Check if touch is on any image
						const touchedImage = images.some((img) => {
							return (
								canvasPos.x >= img.x &&
								canvasPos.x <= img.x + img.width &&
								canvasPos.y >= img.y &&
								canvasPos.y <= img.y + img.height
							);
						});

						setIsTouchingImage(touchedImage);
					}
				}

				setLastTouchCenter(touch);
			}
		},
		[viewport, images],
	);

	const handleTouchMove = useCallback(
		(e: Konva.KonvaEventObject<TouchEvent>) => {
			const touches = e.evt.touches;

			if (touches.length === 2 && lastTouchDistance && lastTouchCenter) {
				// Two fingers - handle pinch-to-zoom
				e.evt.preventDefault();

				const touch1 = { x: touches[0].clientX, y: touches[0].clientY };
				const touch2 = { x: touches[1].clientX, y: touches[1].clientY };

				const distance = Math.sqrt(
					Math.pow(touch2.x - touch1.x, 2) + Math.pow(touch2.y - touch1.y, 2),
				);

				const center = {
					x: (touch1.x + touch2.x) / 2,
					y: (touch1.y + touch2.y) / 2,
				};

				// Calculate scale change
				const scaleFactor = distance / lastTouchDistance;
				const newScale = Math.max(
					0.1,
					Math.min(5, viewport.scale * scaleFactor),
				);

				// Calculate new position to zoom towards pinch center
				const stage = stageRef.current;
				if (stage) {
					const stageBox = stage.container().getBoundingClientRect();
					const stageCenter = {
						x: center.x - stageBox.left,
						y: center.y - stageBox.top,
					};

					const mousePointTo = {
						x: (stageCenter.x - viewport.x) / viewport.scale,
						y: (stageCenter.y - viewport.y) / viewport.scale,
					};

					const newPos = {
						x: stageCenter.x - mousePointTo.x * newScale,
						y: stageCenter.y - mousePointTo.y * newScale,
					};

					setViewport({ x: newPos.x, y: newPos.y, scale: newScale });
				}

				setLastTouchDistance(distance);
				setLastTouchCenter(center);
			} else if (
				touches.length === 1 &&
				lastTouchCenter &&
				!isSelecting &&
				!isDraggingImage &&
				!isTouchingImage
			) {
				// Single finger - handle pan (only if not selecting, dragging, or touching an image)
				// Don't prevent default if there might be system dialogs open
				const hasActiveFileInput = document.querySelector('input[type="file"]');
				if (!hasActiveFileInput) {
					e.evt.preventDefault();
				}

				const touch = { x: touches[0].clientX, y: touches[0].clientY };
				const deltaX = touch.x - lastTouchCenter.x;
				const deltaY = touch.y - lastTouchCenter.y;

				setViewport((prev) => ({
					...prev,
					x: prev.x + deltaX,
					y: prev.y + deltaY,
				}));

				setLastTouchCenter(touch);
			}
		},
		[
			viewport,
			lastTouchDistance,
			lastTouchCenter,
			isSelecting,
			isDraggingImage,
			isTouchingImage,
		],
	);

	const handleTouchEnd = useCallback(() => {
		setLastTouchDistance(null);
		setLastTouchCenter(null);
		setIsTouchingImage(false);
	}, []);

	// Zoom functions
	const zoomIn = useCallback(() => {
		const newScale = Math.min(5, viewport.scale * 1.2);
		const centerX = canvasSize.width / 2;
		const centerY = canvasSize.height / 2;

		const mousePointTo = {
			x: (centerX - viewport.x) / viewport.scale,
			y: (centerY - viewport.y) / viewport.scale,
		};

		setViewport({
			x: centerX - mousePointTo.x * newScale,
			y: centerY - mousePointTo.y * newScale,
			scale: newScale,
		});
	}, [viewport, canvasSize]);

	const zoomOut = useCallback(() => {
		const newScale = Math.max(0.1, viewport.scale / 1.2);
		const centerX = canvasSize.width / 2;
		const centerY = canvasSize.height / 2;

		const mousePointTo = {
			x: (centerX - viewport.x) / viewport.scale,
			y: (centerY - viewport.y) / viewport.scale,
		};

		setViewport({
			x: centerX - mousePointTo.x * newScale,
			y: centerY - mousePointTo.y * newScale,
			scale: newScale,
		});
	}, [viewport, canvasSize]);

	const resetZoom = useCallback(() => {
		setViewport({ x: 0, y: 0, scale: 1 });
	}, []);

	return {
		// State
		viewport,
		setViewport,
		canvasSize,
		setCanvasSize,
		isCanvasReady,
		setIsCanvasReady,
		isPanningCanvas,
		setIsPanningCanvas,
		lastPanPosition,
		setLastPanPosition,
		lastTouchDistance,
		lastTouchCenter,
		isTouchingImage,

		// Refs
		containerRef,
		stageRef,

		// Functions
		updateCanvasSize,
		handleWheel,
		handleTouchStart,
		handleTouchMove,
		handleTouchEnd,
		zoomIn,
		zoomOut,
		resetZoom,
	};
}
