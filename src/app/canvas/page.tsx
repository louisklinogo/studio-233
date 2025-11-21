"use client";

import { createFalClient } from "@fal-ai/client";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import Konva from "konva";
import {
	ChevronDown,
	ExternalLink,
	History,
	ImageIcon,
	LayoutGrid,
	Paperclip,
	PlayIcon,
	Redo,
	SlidersHorizontal,
	Trash2,
	Undo,
	X,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { CalibrationScreen } from "@/components/canvas/CalibrationScreen";
import { CanvasStage } from "@/components/canvas/CanvasStage";
import { DimensionDisplay } from "@/components/canvas/DimensionDisplay";
import { FloatingContextMenu } from "@/components/canvas/FloatingContextMenu";
import { GithubBadge } from "@/components/canvas/GithubBadge";
import { MiniMap } from "@/components/canvas/MiniMap";
import { MobileToolbar } from "@/components/canvas/MobileToolbar";
// Import extracted components
import { ShortcutBadge } from "@/components/canvas/ShortcutBadge";
import { StreamingImage } from "@/components/canvas/StreamingImage";
import { StreamingVideo } from "@/components/canvas/StreamingVideo";
import { VideoControls } from "@/components/canvas/VideoControls";
import { VideoOverlays } from "@/components/canvas/VideoOverlays";
import { GenerationsIndicator } from "@/components/generations-indicator";
import { Logo, SpinnerIcon } from "@/components/icons";
import {
	BottomToolbar,
	type ToolType,
} from "@/components/studio/BottomToolbar";
import {
	CreativeToolbar,
	type ToolType as CreativeToolType,
} from "@/components/studio/CreativeToolbar";
import { ChatPanel } from "@/components/studio/chat/ChatPanel";
import { DialogManager } from "@/components/studio/DialogManager";
import {
	ImageGeneratorPanel,
	ImageGeneratorSettings,
} from "@/components/studio/ImageGeneratorPanel";
import { PropertiesBar } from "@/components/studio/properties/PropertiesBar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useCalibration } from "@/hooks/useCalibration";
import { useCanvasElements } from "@/hooks/useCanvasElements";
import { useCanvasState } from "@/hooks/useCanvasState";
// Import additional extracted components
import { useFalClient } from "@/hooks/useFalClient";
import { useInteractionState } from "@/hooks/useInteractionState";
import { useUIState } from "@/hooks/useUIState";
import { useVideoGeneration } from "@/hooks/useVideoGeneration";
import { useViewportState } from "@/hooks/useViewportState";
import { handleRemoveBackground as handleRemoveBackgroundHandler } from "@/lib/handlers/background-handler";
// Import handlers
import {
	generateImage,
	handleRun as handleRunHandler,
	uploadImageDirect,
} from "@/lib/handlers/generation-handler";
import { styleModels } from "@/lib/models";
import { type CanvasState, canvasStorage } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { getVideoModelById } from "@/lib/video-models";
import { useTRPC } from "@/trpc/client";
// Import types
import type {
	ActiveGeneration,
	ActiveVideoGeneration,
	GenerationSettings,
	HistoryState,
	PlacedImage,
	PlacedVideo,
	SelectionBox,
	VideoGenerationSettings,
} from "@/types/canvas";
import {
	imageToCanvasElement,
	videoToCanvasElement,
} from "@/utils/canvas-utils";
import {
	createCroppedImage,
	resizeImageIfNeeded,
} from "@/utils/image-processing";
import { checkOS } from "@/utils/os-utils";
import { convertImageToVideo } from "@/utils/video-utils";

export default function OverlayPage() {
	const { theme, setTheme } = useTheme();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isStorageLoaded, setIsStorageLoaded] = useState(false);

	// Use the robust calibration hook
	const { isCalibrated, shouldShowBoot, handleAnimationComplete } =
		useCalibration(isStorageLoaded);

	const {
		isChatOpen,
		setIsChatOpen,
		isSettingsDialogOpen,
		setIsSettingsDialogOpen,
		showGrid,
		setShowGrid,
		showMinimap,
		setShowMinimap,
		isStyleDialogOpen,
		setIsStyleDialogOpen,
		isApiKeyDialogOpen,
		setIsApiKeyDialogOpen,
		customApiKey,
		setCustomApiKey,
		tempApiKey,
		setTempApiKey,
		themeColor,
		setThemeColor,
	} = useUIState();

	const {
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
	} = useInteractionState();
	const {
		images,
		setImages,
		videos,
		setVideos,
		// elements are now managed by useCanvasState
		elements: canvasElements,
		setElements: setCanvasElements,
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
		deleteSelected: handleDelete,
		duplicateSelected: handleDuplicate,
		sendToFront,
		sendToBack,
		bringForward,
		sendBackward,
	} = useCanvasState();

	// Helper wrapper to update elements while we transition
	// Eventually updateElement should be part of useCanvasState or we expose setElements there
	const updateCanvasElement = (id: string, updates: any) => {
		setCanvasElements((prev) =>
			prev.map((el) => (el.id === id ? { ...el, ...updates } : el)),
		);
	};

	// Helper wrapper to add elements
	// Eventually addElement should be part of useCanvasState
	const addCanvasElement = (element: any) => {
		setCanvasElements((prev) => [...prev, element]);
	};

	const removeCanvasElement = (id: string) => {
		setCanvasElements((prev) => prev.filter((el) => el.id !== id));
	};

	// isStorageLoaded is already defined at top level now
	const [visibleIndicators, setVisibleIndicators] = useState<Set<string>>(
		new Set(),
	);
	const simpsonsStyle = styleModels.find((m) => m.id === "simpsons");
	const { toast } = useToast();

	const [generationSettings, setGenerationSettings] =
		useState<GenerationSettings>({
			prompt: simpsonsStyle?.prompt || "",
			loraUrl: simpsonsStyle?.loraUrl || "",
			styleId: simpsonsStyle?.id || "simpsons",
		});
	const [previousStyleId, setPreviousStyleId] = useState<string>(
		simpsonsStyle?.id || "simpsons",
	);
	const [isGenerating, setIsGenerating] = useState(false);
	const [isImageGeneratorOpen, setIsImageGeneratorOpen] = useState(false);
	const [activeGenerations, setActiveGenerations] = useState<
		Map<string, ActiveGeneration>
	>(new Map());

	const [_, setIsSaving] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);

	// Context menu state
	const [contextMenuPosition, setContextMenuPosition] = useState<{
		x: number;
		y: number;
	} | null>(null);

	// Viewport hook
	const {
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
		containerRef,
		stageRef,
		updateCanvasSize,
		handleWheel,
		handleTouchStart,
		handleTouchMove,
		handleTouchEnd,
		zoomIn,
		zoomOut,
		resetZoom,
	} = useViewportState(images, isSelecting, isDraggingImage);

	// Track when generation completes
	const [previousGenerationCount, setPreviousGenerationCount] = useState(0);

	// Create FAL client instance with proxy
	const falClient = useFalClient(customApiKey);

	const trpc = useTRPC();

	const { mutateAsync: removeBackground } = useMutation(
		trpc.removeBackground.mutationOptions(),
	);

	// Video generation hook
	const {
		activeVideoGenerations,
		setActiveVideoGenerations,
		isImageToVideoDialogOpen,
		setIsImageToVideoDialogOpen,
		selectedImageForVideo,
		setSelectedImageForVideo,
		isConvertingToVideo,
		isVideoToVideoDialogOpen,
		setIsVideoToVideoDialogOpen,
		selectedVideoForVideo,
		setSelectedVideoForVideo,
		isTransformingVideo,
		isExtendVideoDialogOpen,
		setIsExtendVideoDialogOpen,
		selectedVideoForExtend,
		setSelectedVideoForExtend,
		isExtendingVideo,
		isRemoveVideoBackgroundDialogOpen,
		setIsRemoveVideoBackgroundDialogOpen,
		selectedVideoForBackgroundRemoval,
		setSelectedVideoForBackgroundRemoval,
		isRemovingVideoBackground,
		handleConvertToVideo,
		handleImageToVideoConversion,
		handleVideoToVideo,
		handleVideoToVideoTransformation,
		handleExtendVideo,
		handleVideoExtension,
		handleRemoveVideoBackgroundTrigger: handleRemoveVideoBackground,
		handleVideoBackgroundRemoval,
		handleVideoGenerationComplete,
		handleVideoGenerationError,
	} = useVideoGeneration(
		customApiKey,
		images,
		videos,
		setImages,
		setVideos,
		saveToHistory,
	);

	const [isIsolateDialogOpen, setIsIsolateDialogOpen] = useState(false);

	useEffect(() => {
		const currentCount =
			activeGenerations.size +
			activeVideoGenerations.size +
			(isGenerating ? 1 : 0) +
			(isRemovingVideoBackground ? 1 : 0) +
			(isIsolating ? 1 : 0) +
			(isExtendingVideo ? 1 : 0) +
			(isTransformingVideo ? 1 : 0);

		// If we went from having generations to having none, show success
		if (previousGenerationCount > 0 && currentCount === 0) {
			setShowSuccess(true);
			// Hide success after 2 seconds
			const timeout = setTimeout(() => {
				setShowSuccess(false);
			}, 2000);
			return () => clearTimeout(timeout);
		}

		setPreviousGenerationCount(currentCount);
	}, [
		activeGenerations.size,
		activeVideoGenerations.size,
		isGenerating,
		isRemovingVideoBackground,
		isIsolating,
		isExtendingVideo,
		isTransformingVideo,
		previousGenerationCount,
	]);

	// Function to handle video generation progress
	const handleVideoGenerationProgress = (
		videoId: string,
		progress: number,
		status: string,
	) => {
		// You could update a progress indicator here if needed
		console.log(`Video generation progress: ${progress}% - ${status}`);
	};

	const { mutateAsync: isolateObject } = useMutation(
		trpc.isolateObject.mutationOptions(),
	);

	const { mutateAsync: generateTextToImage } = useMutation(
		trpc.generateTextToImage.mutationOptions(),
	);

	const { mutateAsync: editWithGemini, isPending: isGeminiEditing } =
		useMutation(trpc.gemini.editImage.mutationOptions());

	// Save current state to storage
	const saveToStorage = useCallback(async () => {
		try {
			setIsSaving(true);

			// Save canvas state (positions, transforms, etc.)
			const canvasState: CanvasState = {
				elements: [
					...images.map(imageToCanvasElement),
					...videos.map(videoToCanvasElement),
				],
				backgroundColor: "#ffffff",
				lastModified: Date.now(),
				viewport: viewport,
			};
			canvasStorage.saveCanvasState(canvasState);

			// Save actual image data to IndexedDB
			for (const image of images) {
				// Skip if it's a placeholder for generation
				if (
					image.src.startsWith("data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP")
				)
					continue;

				// Check if we already have this image stored
				const existingImage = await canvasStorage.getImage(image.id);
				if (!existingImage) {
					await canvasStorage.saveImage(image.src, image.id);
				}
			}

			// Save video data to IndexedDB
			for (const video of videos) {
				// Skip if it's a placeholder for generation
				if (
					video.src.startsWith("data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP")
				)
					continue;

				// Check if we already have this video stored
				const existingVideo = await canvasStorage.getVideo(video.id);
				if (!existingVideo) {
					await canvasStorage.saveVideo(video.src, video.duration, video.id);
				}
			}

			// Clean up unused images and videos
			await canvasStorage.cleanupOldData();

			// Brief delay to show the indicator
			setTimeout(() => setIsSaving(false), 300);
		} catch (error) {
			console.error("Failed to save to storage:", error);
			setIsSaving(false);
		}
	}, [images, videos, viewport]);

	// Load state from storage
	const loadFromStorage = useCallback(async () => {
		try {
			const canvasState = canvasStorage.getCanvasState();
			if (!canvasState) {
				setIsStorageLoaded(true);
				return;
			}

			const loadedImages: PlacedImage[] = [];
			const loadedVideos: PlacedVideo[] = [];

			for (const element of canvasState.elements) {
				if (element.type === "image" && element.imageId) {
					const imageData = await canvasStorage.getImage(element.imageId);
					if (imageData) {
						loadedImages.push({
							id: element.id,
							src: imageData.originalDataUrl,
							x: element.transform.x,
							y: element.transform.y,
							width: element.width || 300,
							height: element.height || 300,
							rotation: element.transform.rotation,
							...(element.transform.cropBox && {
								cropX: element.transform.cropBox.x,
								cropY: element.transform.cropBox.y,
								cropWidth: element.transform.cropBox.width,
								cropHeight: element.transform.cropBox.height,
							}),
						});
					}
				} else if (element.type === "video" && element.videoId) {
					const videoData = await canvasStorage.getVideo(element.videoId);
					if (videoData) {
						loadedVideos.push({
							id: element.id,
							src: videoData.originalDataUrl,
							x: element.transform.x,
							y: element.transform.y,
							width: element.width || 300,
							height: element.height || 300,
							rotation: element.transform.rotation,
							isVideo: true,
							duration: element.duration || videoData.duration,
							currentTime: element.currentTime || 0,
							isPlaying: element.isPlaying || false,
							volume: element.volume || 1,
							muted: element.muted || false,
							isLoaded: false, // Initialize as not loaded
							...(element.transform.cropBox && {
								cropX: element.transform.cropBox.x,
								cropY: element.transform.cropBox.y,
								cropWidth: element.transform.cropBox.width,
								cropHeight: element.transform.cropBox.height,
							}),
						});
					}
				}
			}

			// Set loaded images and videos
			if (loadedImages.length > 0) {
				setImages(loadedImages);
			}

			if (loadedVideos.length > 0) {
				setVideos(loadedVideos);
			}

			// Restore viewport if available
			if (canvasState.viewport) {
				setViewport(canvasState.viewport);
			}
		} catch (error) {
			console.error("Failed to load from storage:", error);
			toast({
				title: "Failed to restore canvas",
				description: "Starting with a fresh canvas",
				variant: "destructive",
			});
		} finally {
			setIsStorageLoaded(true);
		}
	}, [toast]);

	// Track previous style when changing styles (but not when reverting from custom)
	useEffect(() => {
		const currentStyleId = generationSettings.styleId;
		if (
			currentStyleId &&
			currentStyleId !== "custom" &&
			currentStyleId !== previousStyleId
		) {
			setPreviousStyleId(currentStyleId);
		}
	}, [generationSettings.styleId, previousStyleId]);

	// Set canvas ready state after mount
	useEffect(() => {
		// Only set canvas ready after we have valid dimensions
		if (canvasSize.width > 0 && canvasSize.height > 0) {
			setIsCanvasReady(true);
		}
	}, [canvasSize]);

	// Update canvas size on window resize
	useEffect(() => {
		// Set initial size
		updateCanvasSize();

		// Use ResizeObserver for more robust sizing
		const observer = new ResizeObserver(() => {
			updateCanvasSize();
		});

		if (containerRef.current) {
			observer.observe(containerRef.current);
		}

		return () => observer.disconnect();
	}, []);

	// Prevent body scrolling on mobile
	useEffect(() => {
		// Prevent scrolling on mobile
		document.body.style.overflow = "hidden";
		document.body.style.position = "fixed";
		document.body.style.width = "100%";
		document.body.style.height = "100%";

		return () => {
			document.body.style.overflow = "";
			document.body.style.position = "";
			document.body.style.width = "";
			document.body.style.height = "";
		};
	}, []);

	// Load from storage on mount
	useEffect(() => {
		loadFromStorage();
	}, [loadFromStorage]);

	// Auto-save to storage when images change (with debounce)
	useEffect(() => {
		if (!isStorageLoaded) return; // Don't save until we've loaded
		if (activeGenerations.size > 0) return;

		const timeoutId = setTimeout(() => {
			saveToStorage();
		}, 1000); // Save after 1 second of no changes

		return () => clearTimeout(timeoutId);
	}, [
		images,
		viewport,
		isStorageLoaded,
		saveToStorage,
		activeGenerations.size,
	]);

	// Load default images only if no saved state
	useEffect(() => {
		if (!isStorageLoaded) return;
		if (images.length > 0) return; // Already have images from storage

		const loadDefaultImages = async () => {
			const defaultImagePaths = [
				"/hat.png",
				"/man.png",
				"/og-img-compress.png",
				"/chad.png",
				"/anime.png",
				"/cat.jpg",
				"/overlay.png",
			];
			const loadedImages: PlacedImage[] = [];

			for (let i = 0; i < defaultImagePaths.length; i++) {
				const path = defaultImagePaths[i];
				try {
					const response = await fetch(path);
					const blob = await response.blob();
					const reader = new FileReader();

					reader.onload = (e) => {
						const img = new window.Image();
						img.crossOrigin = "anonymous"; // Enable CORS
						img.onload = () => {
							const id = `default-${path.replace("/", "").replace(".png", "")}-${Date.now()}`;
							const aspectRatio = img.width / img.height;
							const maxSize = 200;
							let width = maxSize;
							let height = maxSize / aspectRatio;

							if (height > maxSize) {
								height = maxSize;
								width = maxSize * aspectRatio;
							}

							// Position images in a row at center of viewport
							const spacing = 250;
							const totalWidth = spacing * (defaultImagePaths.length - 1);
							const viewportCenterX = canvasSize.width / 2;
							const viewportCenterY = canvasSize.height / 2;
							const startX = viewportCenterX - totalWidth / 2;
							const x = startX + i * spacing - width / 2;
							const y = viewportCenterY - height / 2;

							setImages((prev) => [
								...prev,
								{
									id,
									src: e.target?.result as string,
									x,
									y,
									width,
									height,
									rotation: 0,
								},
							]);
						};
						img.src = e.target?.result as string;
					};

					reader.readAsDataURL(blob);
				} catch (error) {
					console.error(`Failed to load default image ${path}:`, error);
				}
			}
		};

		loadDefaultImages();
	}, [isStorageLoaded, images.length]);

	// Handle file upload
	const handleFileUpload = (
		files: FileList | null,
		position?: { x: number; y: number },
	) => {
		if (!files) return;

		Array.from(files).forEach((file, index) => {
			if (file.type.startsWith("image/")) {
				const reader = new FileReader();
				reader.onload = (e) => {
					const id = `img-${Date.now()}-${Math.random()}`;
					const img = new window.Image();
					img.crossOrigin = "anonymous"; // Enable CORS
					img.onload = () => {
						const aspectRatio = img.width / img.height;
						const maxSize = 300;
						let width = maxSize;
						let height = maxSize / aspectRatio;

						if (height > maxSize) {
							height = maxSize;
							width = maxSize * aspectRatio;
						}

						// Place image at position or center of current viewport
						let x, y;
						if (position) {
							// Convert screen position to canvas coordinates
							x = (position.x - viewport.x) / viewport.scale - width / 2;
							y = (position.y - viewport.y) / viewport.scale - height / 2;
						} else {
							// Center of viewport
							const viewportCenterX =
								(canvasSize.width / 2 - viewport.x) / viewport.scale;
							const viewportCenterY =
								(canvasSize.height / 2 - viewport.y) / viewport.scale;
							x = viewportCenterX - width / 2;
							y = viewportCenterY - height / 2;
						}

						// Add offset for multiple files
						if (index > 0) {
							x += index * 20;
							y += index * 20;
						}

						setImages((prev) => [
							...prev,
							{
								id,
								src: e.target?.result as string,
								x,
								y,
								width,
								height,
								rotation: 0,
							},
						]);
					};
					img.src = e.target?.result as string;
				};
				reader.readAsDataURL(file);
			}
		});
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();

		// Get drop position relative to the stage
		const stage = stageRef.current;
		if (stage) {
			const container = stage.container();
			const rect = container.getBoundingClientRect();
			const dropPosition = {
				x: e.clientX - rect.left,
				y: e.clientY - rect.top,
			};
			handleFileUpload(e.dataTransfer.files, dropPosition);
		} else {
			handleFileUpload(e.dataTransfer.files);
		}
	};

	// Handle selection
	const handleSelect = (id: string, e: Konva.KonvaEventObject<MouseEvent>) => {
		if (e.evt.shiftKey || e.evt.metaKey || e.evt.ctrlKey) {
			setSelectedIds((prev) =>
				prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
			);
		} else {
			setSelectedIds([id]);
		}
	};

	// Handle drag selection and panning
	const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
		const clickedOnEmpty = e.target === e.target.getStage();
		const stage = e.target.getStage();
		const mouseButton = e.evt.button; // 0 = left, 1 = middle, 2 = right

		// If middle mouse button, start panning. Or if left click + pan tool
		if (mouseButton === 1 || (mouseButton === 0 && activeTool === "pan")) {
			e.evt.preventDefault();
			setIsPanningCanvas(true);
			setLastPanPosition({ x: e.evt.clientX, y: e.evt.clientY });
			return;
		}

		// If in crop mode and clicked outside, exit crop mode
		if (croppingImageId) {
			const clickedNode = e.target;
			const cropGroup = clickedNode.findAncestor((node: any) => {
				return node.attrs && node.attrs.name === "crop-overlay";
			});

			if (!cropGroup) {
				setCroppingImageId(null);
				return;
			}
		}

		// Start selection box when left-clicking on empty space
		// Only if Select tool is active
		if (
			clickedOnEmpty &&
			!croppingImageId &&
			mouseButton === 0 &&
			activeTool === "select"
		) {
			const pos = stage?.getPointerPosition();
			if (pos) {
				// Convert screen coordinates to canvas coordinates
				const canvasPos = {
					x: (pos.x - viewport.x) / viewport.scale,
					y: (pos.y - viewport.y) / viewport.scale,
				};

				setIsSelecting(true);
				setSelectionBox({
					startX: canvasPos.x,
					startY: canvasPos.y,
					endX: canvasPos.x,
					endY: canvasPos.y,
					visible: true,
				});
				setSelectedIds([]);
			}
		}
	};

	const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
		const stage = e.target.getStage();

		// Handle canvas panning with middle mouse
		if (isPanningCanvas) {
			const deltaX = e.evt.clientX - lastPanPosition.x;
			const deltaY = e.evt.clientY - lastPanPosition.y;

			setViewport((prev) => ({
				...prev,
				x: prev.x + deltaX,
				y: prev.y + deltaY,
			}));

			setLastPanPosition({ x: e.evt.clientX, y: e.evt.clientY });
			return;
		}

		// Handle selection
		if (!isSelecting) return;

		const pos = stage?.getPointerPosition();
		if (pos) {
			// Convert screen coordinates to canvas coordinates
			const canvasPos = {
				x: (pos.x - viewport.x) / viewport.scale,
				y: (pos.y - viewport.y) / viewport.scale,
			};

			setSelectionBox((prev) => ({
				...prev,
				endX: canvasPos.x,
				endY: canvasPos.y,
			}));
		}
	};

	const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
		// Stop canvas panning
		if (isPanningCanvas) {
			setIsPanningCanvas(false);
			return;
		}

		if (!isSelecting) return;

		// Calculate which images and videos are in the selection box
		const box = {
			x: Math.min(selectionBox.startX, selectionBox.endX),
			y: Math.min(selectionBox.startY, selectionBox.endY),
			width: Math.abs(selectionBox.endX - selectionBox.startX),
			height: Math.abs(selectionBox.endY - selectionBox.startY),
		};

		// Only select if the box has some size
		if (box.width > 5 || box.height > 5) {
			// Check for images in the selection box
			const selectedImages = images.filter((img) => {
				// Check if image intersects with selection box
				return !(
					img.x + img.width < box.x ||
					img.x > box.x + box.width ||
					img.y + img.height < box.y ||
					img.y > box.y + box.height
				);
			});

			// Check for videos in the selection box
			const selectedVideos = videos.filter((vid) => {
				// Check if video intersects with selection box
				return !(
					vid.x + vid.width < box.x ||
					vid.x > box.x + box.width ||
					vid.y + vid.height < box.y ||
					vid.y > box.y + box.height
				);
			});

			// Combine selected images and videos
			const selectedIds = [
				...selectedImages.map((img) => img.id),
				...selectedVideos.map((vid) => vid.id),
			];

			if (selectedIds.length > 0) {
				setSelectedIds(selectedIds);
			}
		}

		setIsSelecting(false);
		setSelectionBox({ ...selectionBox, visible: false });
	};

	// Note: Overlapping detection has been removed in favor of explicit "Combine Images" action
	// Users can now manually combine images via the context menu before running generation

	// Handle context menu actions
	const handleRun = async (settings?: ImageGeneratorSettings) => {
		// If settings are provided from the panel, update the generation settings
		if (settings) {
			setGenerationSettings((prev) => ({
				...prev,
				prompt: settings.prompt,
				modelId: settings.modelId,
				// Assuming loraUrl and styleId might need handling if model is not custom
			}));
		}

		await handleRunHandler({
			images,
			selectedIds,
			generationSettings: settings
				? {
						...generationSettings,
						...settings,
						loraUrl: generationSettings.loraUrl,
					}
				: generationSettings,
			customApiKey,
			canvasSize,
			viewport,
			falClient,
			setImages,
			setSelectedIds,
			setActiveGenerations,
			setIsGenerating,
			setIsApiKeyDialogOpen,
			toast,
			generateTextToImage,
			editWithGemini,
		});
	};

	const handleRemoveBackground = async () => {
		await handleRemoveBackgroundHandler({
			images,
			selectedIds,
			setImages,
			toast,
			saveToHistory,
			removeBackground,
			customApiKey,
			falClient,
			setIsApiKeyDialogOpen,
		});
	};

	const handleChat = (prompt: string) => {
		// For now, just update the prompt and show a toast
		// In the future, this will handle actual agent interactions
		setGenerationSettings((prev) => ({ ...prev, prompt }));
		toast({
			title: "Message received",
			description: "Agent functionality coming soon!",
		});
	};

	const handleGeminiEdit = async () => {
		if (selectedIds.length !== 1) return;

		const selectedId = selectedIds[0];
		const image = images.find((img) => img.id === selectedId);
		if (!image) return;

		// Avoid editing placeholder/streaming images
		if (image.src.startsWith("data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP")) {
			toast({
				title: "Image not ready",
				description: "Please wait for the image to finish loading.",
				variant: "destructive",
			});
			return;
		}

		try {
			toast({
				title: "Editing with Gemini",
				description: "Sending image to Gemini, this may take a few seconds...",
			});

			const result = await editWithGemini({
				imageUrl: image.src,
				prompt:
					generationSettings.prompt.trim() ||
					"Improve this image in a visually appealing way.",
			});

			const newImage: PlacedImage = {
				...image,
				id: `gemini-${Date.now()}-${Math.random().toString(36).slice(2)}`,
				src: result.image,
				x: image.x + image.width + 20,
				y: image.y,
			};

			saveToHistory();
			setImages((prev) => [...prev, newImage]);
			setSelectedIds([newImage.id]);

			toast({
				title: "Gemini edit complete",
				description: "A new edited image has been added next to the original.",
			});
		} catch (error) {
			console.error("Gemini edit failed:", error);
			toast({
				title: "Gemini edit failed",
				description:
					error instanceof Error ? error.message : "Unknown error from Gemini",
				variant: "destructive",
			});
		}
	};

	const handleIsolate = async () => {
		// Close the dialog first
		setIsIsolateDialogOpen(false);

		if (!isolateTarget || !isolateInputValue.trim() || isIsolating) {
			return;
		}

		setIsIsolating(true);

		try {
			const image = images.find((img) => img.id === isolateTarget);
			if (!image) {
				setIsIsolating(false);
				return;
			}

			// Show loading state
			toast({
				title: "Processing...",
				description: `Isolating "${isolateInputValue}" from image`,
			});

			// Process the image to get the cropped/processed version
			const imgElement = new window.Image();
			imgElement.crossOrigin = "anonymous"; // Enable CORS
			imgElement.src = image.src;
			await new Promise((resolve) => {
				imgElement.onload = resolve;
			});

			// Create canvas for processing
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");
			if (!ctx) throw new Error("Failed to get canvas context");

			// Get crop values
			const cropX = image.cropX || 0;
			const cropY = image.cropY || 0;
			const cropWidth = image.cropWidth || 1;
			const cropHeight = image.cropHeight || 1;

			// Set canvas size based on crop
			canvas.width = cropWidth * imgElement.naturalWidth;
			canvas.height = cropHeight * imgElement.naturalHeight;

			// Draw cropped image
			ctx.drawImage(
				imgElement,
				cropX * imgElement.naturalWidth,
				cropY * imgElement.naturalHeight,
				cropWidth * imgElement.naturalWidth,
				cropHeight * imgElement.naturalHeight,
				0,
				0,
				canvas.width,
				canvas.height,
			);

			// Convert to blob and upload
			const blob = await new Promise<Blob>((resolve) => {
				canvas.toBlob((blob) => resolve(blob!), "image/png");
			});

			const reader = new FileReader();
			const dataUrl = await new Promise<string>((resolve) => {
				reader.onload = (e) => resolve(e.target?.result as string);
				reader.readAsDataURL(blob);
			});

			// Upload the processed image
			const uploadResult = await uploadImageDirect(
				dataUrl,
				falClient,
				toast,
				setIsApiKeyDialogOpen,
			);

			// Isolate object using EVF-SAM2
			console.log("Calling isolateObject with:", {
				imageUrl: uploadResult?.url || "",
				textInput: isolateInputValue,
			});

			const result = await isolateObject({
				imageUrl: uploadResult?.url || "",
				textInput: isolateInputValue,
				apiKey: customApiKey || undefined,
			});

			console.log("IsolateObject result:", result);

			// Use the segmented image URL directly (backend already applied the mask)
			if (result.url) {
				console.log("Original image URL:", image.src);
				console.log("New isolated image URL:", result.url);
				console.log("Result object:", JSON.stringify(result, null, 2));

				// AUTO DOWNLOAD FOR DEBUGGING
				try {
					const link = document.createElement("a");
					link.href = result.url;
					link.download = `isolated-${isolateInputValue}-${Date.now()}.png`;
					link.target = "_blank"; // Open in new tab to see the image
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
					console.log("Auto-downloaded isolated image for debugging");
				} catch (e) {
					console.error("Failed to auto-download:", e);
				}

				// Force load the new image before updating state
				const testImg = new window.Image();
				testImg.crossOrigin = "anonymous";
				testImg.onload = () => {
					console.log(
						"New image loaded successfully:",
						testImg.width,
						"x",
						testImg.height,
					);

					// Create a test canvas to verify the image has transparency
					const testCanvas = document.createElement("canvas");
					testCanvas.width = testImg.width;
					testCanvas.height = testImg.height;
					const testCtx = testCanvas.getContext("2d");
					if (testCtx) {
						// Fill with red background
						testCtx.fillStyle = "red";
						testCtx.fillRect(0, 0, testCanvas.width, testCanvas.height);
						// Draw the image on top
						testCtx.drawImage(testImg, 0, 0);

						// Get a pixel from what should be transparent area (corner)
						const pixelData = testCtx.getImageData(0, 0, 1, 1).data;
						console.log("Corner pixel (should show red if transparent):", {
							r: pixelData[0],
							g: pixelData[1],
							b: pixelData[2],
							a: pixelData[3],
						});
					}

					// Update the image in place with the segmented image
					saveToHistory();

					// Create a completely new image URL with timestamp
					const newImageUrl = `${result.url}${result.url.includes("?") ? "&" : "?"}t=${Date.now()}&cache=no`;

					// Get the current image to preserve position
					const currentImage = images.find((img) => img.id === isolateTarget);
					if (!currentImage) {
						console.error("Could not find current image!");
						return;
					}

					// Create new image with isolated- prefix ID
					const newImage: PlacedImage = {
						...currentImage,
						id: `isolated-${Date.now()}-${Math.random()}`,
						src: newImageUrl,
						// Remove crop values since we've applied them
						cropX: undefined,
						cropY: undefined,
						cropWidth: undefined,
						cropHeight: undefined,
					};

					setImages((prev) => {
						// Replace old image with new one at same index
						const newImages = [...prev];
						const index = newImages.findIndex(
							(img) => img.id === isolateTarget,
						);
						if (index !== -1) {
							newImages[index] = newImage;
						}
						return newImages;
					});

					// Update selection
					setSelectedIds([newImage.id]);

					toast({
						title: "Success",
						description: `Isolated "${isolateInputValue}" successfully`,
					});
				};

				testImg.onerror = (e) => {
					console.error("Failed to load new image:", e);
					toast({
						title: "Failed to load isolated image",
						description: "The isolated image could not be loaded",
						variant: "destructive",
					});
				};

				testImg.src = result.url;
			} else {
				toast({
					title: "No object found",
					description: `Could not find "${isolateInputValue}" in the image`,
					variant: "destructive",
				});
			}

			// Reset the isolate input
			setIsolateTarget(null);
			setIsolateInputValue("");
			setIsIsolating(false);
		} catch (error) {
			console.error("Error isolating object:", error);
			toast({
				title: "Failed to isolate object",
				description: error instanceof Error ? error.message : "Unknown error",
				variant: "destructive",
			});
			setIsolateTarget(null);
			setIsolateInputValue("");
			setIsIsolating(false);
		}
	};

	const handleCombineImages = async () => {
		if (selectedIds.length < 2) return;

		// Save to history before combining
		saveToHistory();

		// Get selected images and sort by layer order
		const selectedImages = selectedIds
			.map((id) => images.find((img) => img.id === id))
			.filter((img) => img !== undefined) as PlacedImage[];

		const sortedImages = [...selectedImages].sort((a, b) => {
			const indexA = images.findIndex((img) => img.id === a.id);
			const indexB = images.findIndex((img) => img.id === b.id);
			return indexA - indexB;
		});

		// Load all images to calculate scale factors
		const imageElements: {
			img: PlacedImage;
			element: HTMLImageElement;
			scale: number;
		}[] = [];
		let maxScale = 1;

		for (const img of sortedImages) {
			const imgElement = new window.Image();
			imgElement.crossOrigin = "anonymous"; // Enable CORS
			imgElement.src = img.src;
			await new Promise((resolve) => {
				imgElement.onload = resolve;
			});

			// Calculate scale factor (original size / display size)
			// Account for crops if they exist
			const effectiveWidth = img.cropWidth
				? imgElement.naturalWidth * img.cropWidth
				: imgElement.naturalWidth;
			const effectiveHeight = img.cropHeight
				? imgElement.naturalHeight * img.cropHeight
				: imgElement.naturalHeight;

			const scaleX = effectiveWidth / img.width;
			const scaleY = effectiveHeight / img.height;
			const scale = Math.min(scaleX, scaleY); // Use min to maintain aspect ratio

			maxScale = Math.max(maxScale, scale);
			imageElements.push({ img, element: imgElement, scale });
		}

		// Use a reasonable scale - not too large to avoid memory issues
		const optimalScale = Math.min(maxScale, 4); // Cap at 4x to prevent huge images

		// Calculate bounding box of all selected images
		let minX = Infinity,
			minY = Infinity;
		let maxX = -Infinity,
			maxY = -Infinity;

		sortedImages.forEach((img) => {
			minX = Math.min(minX, img.x);
			minY = Math.min(minY, img.y);
			maxX = Math.max(maxX, img.x + img.width);
			maxY = Math.max(maxY, img.y + img.height);
		});

		const combinedWidth = maxX - minX;
		const combinedHeight = maxY - minY;

		// Create canvas at higher resolution
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		if (!ctx) {
			console.error("Failed to get canvas context");
			return;
		}

		canvas.width = Math.round(combinedWidth * optimalScale);
		canvas.height = Math.round(combinedHeight * optimalScale);

		console.log(
			`Creating combined image at ${canvas.width}x${canvas.height} (scale: ${optimalScale.toFixed(2)}x)`,
		);

		// Draw each image in order using the pre-loaded elements
		for (const { img, element: imgElement } of imageElements) {
			// Calculate position relative to the combined canvas, scaled up
			const relX = (img.x - minX) * optimalScale;
			const relY = (img.y - minY) * optimalScale;
			const scaledWidth = img.width * optimalScale;
			const scaledHeight = img.height * optimalScale;

			ctx.save();

			// Handle rotation if needed
			if (img.rotation) {
				ctx.translate(relX + scaledWidth / 2, relY + scaledHeight / 2);
				ctx.rotate((img.rotation * Math.PI) / 180);
				ctx.drawImage(
					imgElement,
					-scaledWidth / 2,
					-scaledHeight / 2,
					scaledWidth,
					scaledHeight,
				);
			} else {
				// Handle cropping if exists
				if (
					img.cropX !== undefined &&
					img.cropY !== undefined &&
					img.cropWidth !== undefined &&
					img.cropHeight !== undefined
				) {
					ctx.drawImage(
						imgElement,
						img.cropX * imgElement.naturalWidth,
						img.cropY * imgElement.naturalHeight,
						img.cropWidth * imgElement.naturalWidth,
						img.cropHeight * imgElement.naturalHeight,
						relX,
						relY,
						scaledWidth,
						scaledHeight,
					);
				} else {
					ctx.drawImage(
						imgElement,
						0,
						0,
						imgElement.naturalWidth,
						imgElement.naturalHeight,
						relX,
						relY,
						scaledWidth,
						scaledHeight,
					);
				}
			}

			ctx.restore();
		}

		// Convert to blob and create data URL
		const blob = await new Promise<Blob>((resolve) => {
			canvas.toBlob((blob) => resolve(blob!), "image/png");
		});

		const reader = new FileReader();
		const dataUrl = await new Promise<string>((resolve) => {
			reader.onload = (e) => resolve(e.target?.result as string);
			reader.readAsDataURL(blob);
		});

		// Create new combined image
		const combinedImage: PlacedImage = {
			id: `combined-${Date.now()}-${Math.random()}`,
			src: dataUrl,
			x: minX,
			y: minY,
			width: combinedWidth,
			height: combinedHeight,
			rotation: 0,
		};

		// Remove the original images and add the combined one
		setImages((prev) => [
			...prev.filter((img) => !selectedIds.includes(img.id)),
			combinedImage,
		]);

		// Select the new combined image
		setSelectedIds([combinedImage.id]);
	};

	// Handle keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Check if target is an input element
			const isInputElement =
				e.target && (e.target as HTMLElement).matches("input, textarea");

			// Undo/Redo
			if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
				e.preventDefault();
				undo();
			} else if (
				(e.metaKey || e.ctrlKey) &&
				((e.key === "z" && e.shiftKey) || e.key === "y")
			) {
				e.preventDefault();
				redo();
			}
			// Select all
			else if ((e.metaKey || e.ctrlKey) && e.key === "a" && !isInputElement) {
				e.preventDefault();
				setSelectedIds(images.map((img) => img.id));
			}
			// Delete
			else if (
				(e.key === "Delete" || e.key === "Backspace") &&
				!isInputElement
			) {
				if (selectedIds.length > 0) {
					e.preventDefault();
					handleDelete();
					// Also delete elements
					selectedIds.forEach((id) => removeCanvasElement(id));
				}
			}
			// Duplicate
			else if ((e.metaKey || e.ctrlKey) && e.key === "d" && !isInputElement) {
				e.preventDefault();
				if (selectedIds.length > 0) {
					handleDuplicate();
				}
			}
			// Run generation
			else if (
				(e.metaKey || e.ctrlKey) &&
				e.key === "Enter" &&
				!isInputElement
			) {
				e.preventDefault();
				if (!isGenerating && generationSettings.prompt.trim()) {
					handleRun();
				}
			}
			// Layer ordering shortcuts
			else if (e.key === "]" && !isInputElement) {
				e.preventDefault();
				if (selectedIds.length > 0) {
					if (e.metaKey || e.ctrlKey) {
						sendToFront();
					} else {
						bringForward();
					}
				}
			} else if (e.key === "[" && !isInputElement) {
				e.preventDefault();
				if (selectedIds.length > 0) {
					if (e.metaKey || e.ctrlKey) {
						sendToBack();
					} else {
						sendBackward();
					}
				}
			}
			// Escape to exit crop mode
			else if (e.key === "Escape" && croppingImageId) {
				e.preventDefault();
				setCroppingImageId(null);
			}
			// Zoom in
			else if ((e.key === "+" || e.key === "=") && !isInputElement) {
				e.preventDefault();
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
			}
			// Zoom out
			else if (e.key === "-" && !isInputElement) {
				e.preventDefault();
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
			}
			// Reset zoom
			else if (e.key === "0" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setViewport({ x: 0, y: 0, scale: 1 });
			}
		};

		const handleKeyUp = (e: KeyboardEvent) => {
			// Currently no key up handlers needed
		};

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
		};
	}, [
		selectedIds,
		images,
		generationSettings,
		undo,
		redo,
		handleDelete,
		handleDuplicate,
		handleRun,
		croppingImageId,
		viewport,
		canvasSize,
		sendToFront,
		sendToBack,
		bringForward,
		sendBackward,
	]);

	return (
		<>
			<AnimatePresence>
				{!isCalibrated && shouldShowBoot && (
					<CalibrationScreen onComplete={handleAnimationComplete} />
				)}
			</AnimatePresence>

			{/* Main Content - always rendered but hidden until calibrated to allow hydration */}
			<motion.div
				initial={{ opacity: 0, scale: 0.98 }}
				animate={
					isCalibrated ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.98 }
				}
				transition={{ duration: 0.8, ease: "easeOut" }}
				className="bg-background text-foreground font-focal relative flex flex-row w-full overflow-hidden h-screen"
				style={{ height: "100dvh" }}
				onDrop={handleDrop}
				onDragOver={(e) => e.preventDefault()}
				onDragEnter={(e) => e.preventDefault()}
				onDragLeave={(e) => e.preventDefault()}
			>
				{/* Hidden file input for toolbar */}
				<input
					type="file"
					ref={fileInputRef}
					className="hidden"
					multiple
					accept="image/*,video/*"
					onChange={(e) => handleFileUpload(e.target.files)}
				/>

				{/* Creative Toolbar (Area A) - Left Side */}
				<CreativeToolbar
					activeTool={activeTool}
					setActiveTool={setActiveTool}
					onAddClick={() => fileInputRef.current?.click()} // Fallback
					onUploadImage={() => fileInputRef.current?.click()}
					onUploadVideo={() => fileInputRef.current?.click()} // Can separate if needed
					onOpenImageGenerator={() => setIsImageGeneratorOpen(true)}
					onOpenVideoGenerator={() => setIsImageToVideoDialogOpen(true)} // Reuse existing for now or create new
					onAddFrame={() => {
						toast({
							title: "Frame added",
							description: "Frame tool coming soon",
						});
					}}
				/>

				{/* Image Generator Panel */}
				<ImageGeneratorPanel
					isOpen={isImageGeneratorOpen}
					onClose={() => setIsImageGeneratorOpen(false)}
					onRun={async (settings) => {
						// We need to handle the reference image specifically if provided
						if (settings.referenceImage) {
							// For now, we can upload it using the existing upload handler logic or pass it down
							// Since settings.referenceImage is a Data URL, it needs to be uploaded or used directly
							// The handleRun function processes the generation logic.
							// We might need to modify handleRun to accept the reference image directly.
						}

						await handleRun(settings);
						setIsImageGeneratorOpen(false);
					}}
					isGenerating={isGenerating}
					initialPrompt={generationSettings.prompt}
				/>

				{/* Render streaming components for active generations */}
				{Array.from(activeGenerations.entries()).map(
					([imageId, generation]) => (
						<StreamingImage
							key={imageId}
							imageId={imageId}
							generation={generation}
							apiKey={customApiKey}
							onStreamingUpdate={(id, url) => {
								setImages((prev) =>
									prev.map((img) =>
										img.id === id ? { ...img, src: url } : img,
									),
								);
							}}
							onComplete={(id, finalUrl) => {
								setImages((prev) =>
									prev.map((img) =>
										img.id === id ? { ...img, src: finalUrl } : img,
									),
								);
								setActiveGenerations((prev) => {
									const newMap = new Map(prev);
									newMap.delete(id);
									return newMap;
								});
								setIsGenerating(false);

								// Immediately save after generation completes
								setTimeout(() => {
									saveToStorage();
								}, 100); // Small delay to ensure state updates are processed
							}}
							onError={(id, error) => {
								console.error(`Generation error for ${id}:`, error);
								// Remove the failed image
								setImages((prev) => prev.filter((img) => img.id !== id));
								setActiveGenerations((prev) => {
									const newMap = new Map(prev);
									newMap.delete(id);
									return newMap;
								});
								setIsGenerating(false);
								toast({
									title: "Generation failed",
									description: error.toString(),
									variant: "destructive",
								});
							}}
						/>
					),
				)}

				{/* Main content */}
				<main
					ref={containerRef}
					className="flex-1 relative flex items-center justify-center min-w-0"
				>
					<div className="relative w-full h-full">
						{/* Gradient Overlays */}
						<div
							className="pointer-events-none absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background to-transparent z-10"
							aria-hidden="true"
						/>
						<div
							className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-10"
							aria-hidden="true"
						/>
						<div
							className="pointer-events-none absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10"
							aria-hidden="true"
						/>
						<div
							className="pointer-events-none absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10"
							aria-hidden="true"
						/>
						<CanvasStage
							canvasSize={canvasSize}
							viewport={viewport}
							isCanvasReady={isCanvasReady}
							stageRef={stageRef}
							images={images}
							videos={videos}
							elements={canvasElements}
							selectedIds={selectedIds}
							selectionBox={selectionBox}
							isSelecting={isSelecting}
							showGrid={showGrid}
							isPanningCanvas={isPanningCanvas}
							croppingImageId={croppingImageId}
							dragStartPositions={dragStartPositions}
							isDraggingImage={isDraggingImage}
							activeTool={activeTool}
							defaultTextProps={defaultTextProps}
							defaultShapeProps={defaultShapeProps}
							defaultDrawingProps={defaultDrawingProps}
							setImages={setImages}
							setVideos={setVideos}
							setElements={setCanvasElements}
							setSelectedIds={setSelectedIds}
							setIsDraggingImage={setIsDraggingImage}
							setHiddenVideoControlsIds={setHiddenVideoControlsIds}
							setDragStartPositions={setDragStartPositions}
							setCroppingImageId={setCroppingImageId}
							saveToHistory={saveToHistory}
							setActiveTool={setActiveTool}
							onMouseDown={handleMouseDown}
							onMouseMove={handleMouseMove}
							onMouseUp={handleMouseUp}
							onMouseLeave={() => {
								if (isPanningCanvas) {
									setIsPanningCanvas(false);
								}
							}}
							onWheel={handleWheel}
							onTouchStart={handleTouchStart}
							onTouchMove={handleTouchMove}
							onTouchEnd={handleTouchEnd}
							onContextMenu={(e) => {
								// Prevent default browser menu
								e.evt.preventDefault();

								// Check if this is a forwarded event from a video overlay
								const videoId = (e.evt as any)?.videoId || (e as any)?.videoId;
								if (videoId) {
									// This is a right-click on a video
									if (!selectedIds.includes(videoId)) {
										setSelectedIds([videoId]);
									}
									// Set context menu position
									setContextMenuPosition({
										x: e.evt.clientX,
										y: e.evt.clientY,
									});
									return;
								}

								// Get clicked position
								const stage = e.target.getStage();
								if (!stage) return;

								const point = stage.getPointerPosition();
								if (!point) return;

								// Convert to canvas coordinates
								const canvasPoint = {
									x: (point.x - viewport.x) / viewport.scale,
									y: (point.y - viewport.y) / viewport.scale,
								};

								// Check if we clicked on a video first (check in reverse order for top-most)
								const clickedVideo = [...videos].reverse().find((vid) => {
									return (
										canvasPoint.x >= vid.x &&
										canvasPoint.x <= vid.x + vid.width &&
										canvasPoint.y >= vid.y &&
										canvasPoint.y <= vid.y + vid.height
									);
								});

								if (clickedVideo) {
									if (!selectedIds.includes(clickedVideo.id)) {
										setSelectedIds([clickedVideo.id]);
									}
									setContextMenuPosition({
										x: e.evt.clientX,
										y: e.evt.clientY,
									});
									return;
								}

								// Check if we clicked on an image (check in reverse order for top-most image)
								const clickedImage = [...images].reverse().find((img) => {
									// Simple bounding box check
									// TODO: Could be improved to handle rotation
									return (
										canvasPoint.x >= img.x &&
										canvasPoint.x <= img.x + img.width &&
										canvasPoint.y >= img.y &&
										canvasPoint.y <= img.y + img.height
									);
								});

								if (clickedImage) {
									if (!selectedIds.includes(clickedImage.id)) {
										// If clicking on unselected image, select only that image
										setSelectedIds([clickedImage.id]);
									}
									// If already selected, keep current selection for multi-select context menu
									setContextMenuPosition({
										x: e.evt.clientX,
										y: e.evt.clientY,
									});
								} else {
									// Clicked on empty space - show menu anyway or clear selection?
									// For now, let's show the menu at cursor
									setContextMenuPosition({
										x: e.evt.clientX,
										y: e.evt.clientY,
									});
								}
							}}
							handleSelect={handleSelect}
						/>

						<PropertiesBar
							elements={canvasElements}
							selectedIds={selectedIds}
							updateElement={updateCanvasElement}
							onDelete={() => {
								if (selectedIds.length > 0) {
									selectedIds.forEach((id) => removeCanvasElement(id));
									handleDelete();
								}
							}}
							activeTool={activeTool}
							defaultTextProps={defaultTextProps}
							setDefaultTextProps={setDefaultTextProps}
							defaultShapeProps={defaultShapeProps}
							setDefaultShapeProps={setDefaultShapeProps}
							defaultDrawingProps={defaultDrawingProps}
							setDefaultDrawingProps={setDefaultDrawingProps}
						/>

						<FloatingContextMenu
							position={contextMenuPosition}
							onOpenChange={(open) => {
								if (!open) {
									setContextMenuPosition(null);
									// Reset isolate state when context menu closes
									setIsolateTarget(null);
									setIsolateInputValue("");
								}
							}}
							selectedIds={selectedIds}
							images={images}
							videos={videos}
							isGenerating={isGenerating}
							generationSettings={generationSettings}
							isolateInputValue={isolateInputValue}
							isIsolating={isIsolating}
							handleRun={handleRun}
							handleGeminiEdit={handleGeminiEdit}
							isGeminiEditing={isGeminiEditing}
							handleDuplicate={handleDuplicate}
							handleRemoveBackground={handleRemoveBackground}
							handleCombineImages={handleCombineImages}
							handleDelete={handleDelete}
							handleOpenIsolateDialog={() => {
								if (
									selectedIds.length === 1 &&
									!videos.some((v) => v.id === selectedIds[0])
								) {
									setIsolateTarget(selectedIds[0]);
									setIsolateInputValue("");
									setIsIsolateDialogOpen(true);
								}
							}}
							handleIsolate={handleIsolate}
							handleConvertToVideo={handleConvertToVideo}
							handleVideoToVideo={handleVideoToVideo}
							handleExtendVideo={handleExtendVideo}
							handleRemoveVideoBackground={handleRemoveVideoBackground}
							setCroppingImageId={setCroppingImageId}
							setIsolateInputValue={setIsolateInputValue}
							setIsolateTarget={setIsolateTarget}
							sendToFront={sendToFront}
							sendToBack={sendToBack}
							bringForward={bringForward}
							sendBackward={sendBackward}
						/>

						<div className="absolute top-4 left-4 z-20 flex flex-col items-start gap-2">
							{/* Desktop Project Anchor */}
							<div className="hidden md:flex items-center gap-0 p-1 bg-background/80 backdrop-blur-md border rounded-2xl shadow-lg transition-all hover:bg-background/100 hover:shadow-xl">
								<Link
									href="/"
									className="p-2 hover:bg-muted rounded-xl transition-colors group"
									title="Back to Dashboard"
								>
									<LayoutGrid className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
								</Link>
								<div className="w-[1px] h-4 bg-border mx-1" />
								<button className="px-3 py-1.5 text-xs font-mono font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors text-left">
									UNTITLED_PROJECT_01
								</button>
							</div>

							{/* Fal logo */}
							<div className="md:hidden border bg-background/80 py-2 px-3 flex flex-row rounded-xl gap-2 items-center">
								<Link
									href="https://fal.ai"
									target="_blank"
									className="block transition-opacity"
								>
									<Logo className="h-8 w-16 text-foreground" />
								</Link>
							</div>

							{/* Mobile tool icons - animated based on selection */}
							<MobileToolbar
								selectedIds={selectedIds}
								images={images}
								isGenerating={isGenerating}
								generationSettings={generationSettings}
								handleRun={handleRun}
								handleDuplicate={handleDuplicate}
								handleRemoveBackground={handleRemoveBackground}
								handleCombineImages={handleCombineImages}
								handleDelete={handleDelete}
								setCroppingImageId={setCroppingImageId}
								sendToFront={sendToFront}
								sendToBack={sendToBack}
								bringForward={bringForward}
								sendBackward={sendBackward}
							/>
						</div>

						{/* Assistant Panel Toggle Trigger (Floating) */}
						<div className="absolute top-4 right-4 z-20 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
							<Link href="/studio">
								<Button
									variant="secondary"
									className="h-10 px-4 rounded-full shadow-md bg-background/90 backdrop-blur hover:bg-background border border-border/50 gap-2"
								>
									<div className="p-1 bg-primary/10 rounded-md">
										<History className="w-3 h-3 text-primary" />
									</div>
									<span className="text-xs font-medium">Studio</span>
								</Button>
							</Link>

							{!isChatOpen && (
								<Button
									size="icon"
									variant="secondary"
									className="h-10 w-10 rounded-full shadow-md bg-background/90 backdrop-blur hover:bg-background border border-border/50"
									onClick={() => setIsChatOpen(true)}
								>
									<SpinnerIcon className="h-5 w-5" />
								</Button>
							)}
						</div>

						{/* Prompt bar removed - Moved to AssistantPanel */}

						{/* Mini-map */}
						{showMinimap && (
							<MiniMap
								images={images}
								videos={videos}
								viewport={viewport}
								canvasSize={canvasSize}
							/>
						)}

						{/* {isSaving && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 bg-background/95 border rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm">
              <SpinnerIcon className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Saving...</span>
            </div>
          )} */}

						{/* Zoom controls */}

						<GithubBadge />

						{/* Dimension display for selected images */}
						<DimensionDisplay
							selectedImages={images.filter((img) =>
								selectedIds.includes(img.id),
							)}
							viewport={viewport}
						/>

						{/* Bottom Toolbar - Navigation & History */}
						<BottomToolbar
							undo={undo}
							redo={redo}
							canUndo={historyIndex > 0}
							canRedo={historyIndex < history.length - 1}
							zoom={viewport.scale}
							setZoom={(newScale) => {
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
							}}
							onFitToScreen={() => {
								// Calculate fit scale
								// For now, just reset to 100% at center
								setViewport({
									x: 0,
									y: 0,
									scale: 1,
								});
							}}
							selectedCount={selectedIds.length}
						/>
					</div>
				</main>

				{/* Chat Panel - slide in from right */}
				<AnimatePresence>
					{isChatOpen && (
						<motion.div
							initial={{ width: 0, opacity: 0, marginRight: 0 }}
							animate={{ width: 450, opacity: 1, marginRight: 16 }}
							exit={{ width: 0, opacity: 0, marginRight: 0 }}
							transition={{ duration: 0.3, ease: "easeInOut" }}
							className="h-[calc(100%-2rem)] my-4 rounded-2xl border border-border z-[9999] relative flex-shrink-0 bg-background shadow-2xl overflow-hidden"
						>
							<ChatPanel
								isOpen={isChatOpen}
								onClose={() => setIsChatOpen(false)}
								onChat={handleChat}
								className="h-full w-full"
							/>
						</motion.div>
					)}
				</AnimatePresence>

				<DialogManager
					isStyleDialogOpen={isStyleDialogOpen}
					setIsStyleDialogOpen={setIsStyleDialogOpen}
					isSettingsDialogOpen={isSettingsDialogOpen}
					setIsSettingsDialogOpen={setIsSettingsDialogOpen}
					isApiKeyDialogOpen={isApiKeyDialogOpen}
					setIsApiKeyDialogOpen={setIsApiKeyDialogOpen}
					showGrid={showGrid}
					setShowGrid={setShowGrid}
					showMinimap={showMinimap}
					setShowMinimap={setShowMinimap}
					generationSettings={generationSettings}
					setGenerationSettings={setGenerationSettings}
					customApiKey={customApiKey}
					setCustomApiKey={setCustomApiKey}
					tempApiKey={tempApiKey}
					setTempApiKey={setTempApiKey}
					theme={theme}
					setTheme={setTheme}
					themeColor={themeColor}
					setThemeColor={setThemeColor}
					isImageToVideoDialogOpen={isImageToVideoDialogOpen}
					setIsImageToVideoDialogOpen={setIsImageToVideoDialogOpen}
					selectedImageForVideo={selectedImageForVideo}
					setSelectedImageForVideo={setSelectedImageForVideo}
					isConvertingToVideo={isConvertingToVideo}
					handleImageToVideoConversion={handleImageToVideoConversion}
					isVideoToVideoDialogOpen={isVideoToVideoDialogOpen}
					setIsVideoToVideoDialogOpen={setIsVideoToVideoDialogOpen}
					selectedVideoForVideo={selectedVideoForVideo}
					setSelectedVideoForVideo={setSelectedVideoForVideo}
					isTransformingVideo={isTransformingVideo}
					handleVideoToVideoTransformation={handleVideoToVideoTransformation}
					isExtendVideoDialogOpen={isExtendVideoDialogOpen}
					setIsExtendVideoDialogOpen={setIsExtendVideoDialogOpen}
					selectedVideoForExtend={selectedVideoForExtend}
					setSelectedVideoForExtend={setSelectedVideoForExtend}
					isExtendingVideo={isExtendingVideo}
					handleVideoExtension={handleVideoExtension}
					isRemoveVideoBackgroundDialogOpen={isRemoveVideoBackgroundDialogOpen}
					setIsRemoveVideoBackgroundDialogOpen={
						setIsRemoveVideoBackgroundDialogOpen
					}
					selectedVideoForBackgroundRemoval={selectedVideoForBackgroundRemoval}
					setSelectedVideoForBackgroundRemoval={
						setSelectedVideoForBackgroundRemoval
					}
					isRemovingVideoBackground={isRemovingVideoBackground}
					handleVideoBackgroundRemoval={handleVideoBackgroundRemoval}
					images={images}
					videos={videos}
					toast={toast}
					isolateInputValue={isolateInputValue}
					setIsolateInputValue={setIsolateInputValue}
					isIsolating={isIsolating}
					handleIsolate={handleIsolate}
					isIsolateDialogOpen={isIsolateDialogOpen}
					setIsIsolateDialogOpen={setIsIsolateDialogOpen}
				/>

				{/* Video Generation Streaming Components */}
				{Array.from(activeVideoGenerations.entries()).map(
					([id, generation]) => (
						<StreamingVideo
							key={id}
							videoId={id}
							generation={generation}
							onComplete={handleVideoGenerationComplete}
							onError={handleVideoGenerationError}
							onProgress={handleVideoGenerationProgress}
							apiKey={customApiKey}
						/>
					),
				)}

				{/* Video Controls Overlays */}
				<VideoOverlays
					videos={videos}
					selectedIds={selectedIds}
					viewport={viewport}
					hiddenVideoControlsIds={hiddenVideoControlsIds}
					setVideos={setVideos}
				/>
			</motion.div>
		</>
	);
}
