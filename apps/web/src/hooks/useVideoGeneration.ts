import {
	ActiveVideoGeneration,
	PlacedImage,
	PlacedVideo,
	VideoGenerationSettings,
} from "@studio233/canvas";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useFalClient } from "@/hooks/useFalClient";
import { getVideoModelById } from "@/lib/video-models";
import { useTRPC } from "@/trpc/client";
import { convertImageToVideo } from "@/utils/video-utils";

export function useVideoGeneration(
	customApiKey: string,
	images: PlacedImage[],
	videos: PlacedVideo[],
	setImages: React.Dispatch<React.SetStateAction<PlacedImage[]>>,
	setVideos: React.Dispatch<React.SetStateAction<PlacedVideo[]>>,
	saveToHistory: () => void,
) {
	const { toast } = useToast();
	const falClient = useFalClient(customApiKey);
	const trpc = useTRPC();

	const [activeVideoGenerations, setActiveVideoGenerations] = useState<
		Map<string, ActiveVideoGeneration>
	>(new Map());

	// Dialog and Selection States
	const [isImageToVideoDialogOpen, setIsImageToVideoDialogOpen] =
		useState(false);
	const [selectedImageForVideo, setSelectedImageForVideo] = useState<
		string | null
	>(null);
	const [isConvertingToVideo, setIsConvertingToVideo] = useState(false);

	const [isVideoToVideoDialogOpen, setIsVideoToVideoDialogOpen] =
		useState(false);
	const [selectedVideoForVideo, setSelectedVideoForVideo] = useState<
		string | null
	>(null);
	const [isTransformingVideo, setIsTransformingVideo] = useState(false);

	const [isExtendVideoDialogOpen, setIsExtendVideoDialogOpen] = useState(false);
	const [selectedVideoForExtend, setSelectedVideoForExtend] = useState<
		string | null
	>(null);
	const [isExtendingVideo, setIsExtendingVideo] = useState(false);

	const [
		isRemoveVideoBackgroundDialogOpen,
		setIsRemoveVideoBackgroundDialogOpen,
	] = useState(false);
	const [
		selectedVideoForBackgroundRemoval,
		setSelectedVideoForBackgroundRemoval,
	] = useState<string | null>(null);
	const [isRemovingVideoBackground, setIsRemovingVideoBackground] =
		useState(false);

	const { mutateAsync: removeBackground } = useMutation(
		trpc.removeBackground.mutationOptions(),
	);

	// Handlers

	const handleConvertToVideo = (imageId: string) => {
		const image = images.find((img) => img.id === imageId);
		if (!image) return;

		setSelectedImageForVideo(imageId);
		setIsImageToVideoDialogOpen(true);
	};

	const handleImageToVideoConversion = async (
		settings: VideoGenerationSettings,
	) => {
		if (!selectedImageForVideo) return;

		const image = images.find((img) => img.id === selectedImageForVideo);
		if (!image) return;

		try {
			setIsConvertingToVideo(true);

			// Upload image if it's a data URL
			let imageUrl = image.src;
			if (imageUrl.startsWith("data:")) {
				const uploadResult = await falClient.storage.upload(
					await (await fetch(imageUrl)).blob(),
				);
				imageUrl = uploadResult;
			}

			// Create a unique ID for this generation
			const generationId = `img2vid_${Date.now()}_${Math.random().toString(36).substring(7)}`;

			// Add to active generations
			setActiveVideoGenerations((prev) => {
				const newMap = new Map(prev);
				newMap.set(generationId, {
					imageUrl,
					prompt: settings.prompt || "",
					duration: settings.duration || 5,
					modelId: settings.modelId,
					resolution: settings.resolution || "720p",
					cameraFixed: settings.cameraFixed,
					seed: settings.seed,
					sourceImageId: selectedImageForVideo,
				});
				return newMap;
			});

			setIsConvertingToVideo(false);
			setIsImageToVideoDialogOpen(false);

			// Get video model name for toast display
			let modelName = "Video Model";
			const modelId = settings.modelId || "ltx-video";
			const model = getVideoModelById(modelId);
			if (model) {
				modelName = model.name;
			}

			// Store the toast ID with the generation
			setActiveVideoGenerations((prev) => {
				const newMap = new Map(prev);
				const generation = newMap.get(generationId);
				if (generation) {
					newMap.set(generationId, generation);
				}
				return newMap;
			});
		} catch (error) {
			console.error("Error starting image-to-video conversion:", error);
			toast({
				title: "Conversion failed",
				description:
					error instanceof Error ? error.message : "Failed to start conversion",
				variant: "destructive",
			});
			setIsConvertingToVideo(false);
		}
	};

	const handleVideoToVideo = (videoId: string) => {
		const video = videos.find((vid) => vid.id === videoId);
		if (!video) return;

		setSelectedVideoForVideo(videoId);
		setIsVideoToVideoDialogOpen(true);
	};

	const handleVideoToVideoTransformation = async (
		settings: VideoGenerationSettings,
	) => {
		if (!selectedVideoForVideo) return;

		const video = videos.find((vid) => vid.id === selectedVideoForVideo);
		if (!video) return;

		try {
			setIsTransformingVideo(true);

			// Upload video if it's a data URL or local file
			let videoUrl = video.src;
			if (videoUrl.startsWith("data:") || videoUrl.startsWith("blob:")) {
				const uploadResult = await falClient.storage.upload(
					await (await fetch(videoUrl)).blob(),
				);
				videoUrl = uploadResult;
			}

			// Create a unique ID for this generation
			const generationId = `vid2vid_${Date.now()}_${Math.random().toString(36).substring(7)}`;

			// Add to active generations
			setActiveVideoGenerations((prev) => {
				const newMap = new Map(prev);
				newMap.set(generationId, {
					...settings,
					imageUrl: videoUrl,
					duration: video.duration || settings.duration || 5,
					modelId: settings.modelId || "seedance-pro",
					resolution: settings.resolution || "720p",
					isVideoToVideo: true,
					sourceVideoId: selectedVideoForVideo,
				});
				return newMap;
			});

			setIsVideoToVideoDialogOpen(false);

			let modelName = "Video Model";
			const modelId = settings.modelId || "seedance-pro";
			const model = getVideoModelById(modelId);
			if (model) {
				modelName = model.name;
			}

			const toastId = toast({
				title: `Transforming video (${modelName} - ${settings.resolution || "Default"})`,
				description: "This may take a minute...",
				duration: Infinity,
			}).id;

			setActiveVideoGenerations((prev) => {
				const newMap = new Map(prev);
				const generation = newMap.get(generationId);
				if (generation) {
					newMap.set(generationId, {
						...generation,
						toastId,
					});
				}
				return newMap;
			});
		} catch (error) {
			console.error("Error starting video-to-video transformation:", error);
			toast({
				title: "Transformation failed",
				description:
					error instanceof Error
						? error.message
						: "Failed to start transformation",
				variant: "destructive",
			});
			setIsTransformingVideo(false);
		}
	};

	const handleExtendVideo = (videoId: string) => {
		const video = videos.find((vid) => vid.id === videoId);
		if (!video) return;

		setSelectedVideoForExtend(videoId);
		setIsExtendVideoDialogOpen(true);
	};

	const handleVideoExtension = async (settings: VideoGenerationSettings) => {
		if (!selectedVideoForExtend) return;

		const video = videos.find((vid) => vid.id === selectedVideoForExtend);
		if (!video) return;

		try {
			setIsExtendingVideo(true);

			let videoUrl = video.src;
			if (videoUrl.startsWith("data:") || videoUrl.startsWith("blob:")) {
				const uploadResult = await falClient.storage.upload(
					await (await fetch(videoUrl)).blob(),
				);
				videoUrl = uploadResult;
			}

			const generationId = `extend_${Date.now()}_${Math.random().toString(36).substring(7)}`;

			setActiveVideoGenerations((prev) => {
				const newMap = new Map(prev);
				newMap.set(generationId, {
					...settings,
					imageUrl: videoUrl,
					duration: settings.duration || 5,
					modelId: settings.modelId || "kling-video",
					resolution: settings.resolution || "720p",
					isExtension: true,
					sourceVideoId: selectedVideoForExtend,
				});
				return newMap;
			});

			setIsExtendVideoDialogOpen(false);

			let modelName = "Video Model";
			const modelId = settings.modelId || "kling-video";
			const model = getVideoModelById(modelId);
			if (model) {
				modelName = model.name;
			}

			const toastId = toast({
				title: `Extending video (${modelName})`,
				description: "This may take a few minutes...",
				duration: Infinity,
			}).id;

			setActiveVideoGenerations((prev) => {
				const newMap = new Map(prev);
				const generation = newMap.get(generationId);
				if (generation) {
					newMap.set(generationId, {
						...generation,
						toastId,
					});
				}
				return newMap;
			});
		} catch (error) {
			console.error("Error starting video extension:", error);
			toast({
				title: "Extension failed",
				description:
					error instanceof Error
						? error.message
						: "Failed to start video extension",
				variant: "destructive",
			});
			setIsExtendingVideo(false);
		}
	};

	const handleRemoveVideoBackgroundTrigger = (videoId: string) => {
		const video = videos.find((vid) => vid.id === videoId);
		if (!video) return;

		setSelectedVideoForBackgroundRemoval(videoId);
		setIsRemoveVideoBackgroundDialogOpen(true);
	};

	const handleVideoBackgroundRemoval = async (backgroundColor: string) => {
		if (!selectedVideoForBackgroundRemoval) return;

		const video = videos.find(
			(vid) => vid.id === selectedVideoForBackgroundRemoval,
		);
		if (!video) return;

		try {
			setIsRemovingVideoBackground(true);
			setIsRemoveVideoBackgroundDialogOpen(false);

			let videoUrl = video.src;
			if (videoUrl.startsWith("data:") || videoUrl.startsWith("blob:")) {
				const uploadResult = await falClient.storage.upload(
					await (await fetch(videoUrl)).blob(),
				);
				videoUrl = uploadResult;
			}

			const generationId = `rmbg_${Date.now()}_${Math.random().toString(36).substring(7)}`;

			const colorMap: Record<string, string> = {
				transparent: "Transparent",
				black: "Black",
				white: "White",
				gray: "Gray",
				red: "Red",
				green: "Green",
				blue: "Blue",
				yellow: "Yellow",
				cyan: "Cyan",
				magenta: "Magenta",
				orange: "Orange",
			};

			const apiBackgroundColor = colorMap[backgroundColor] || "Black";

			setActiveVideoGenerations((prev) => {
				const newMap = new Map(prev);
				newMap.set(generationId, {
					imageUrl: videoUrl,
					prompt: `Removing background from video`,
					duration: video.duration || 5,
					modelId: "bria-video-background-removal",
					modelConfig: getVideoModelById("bria-video-background-removal"),
					sourceVideoId: video.id,
					backgroundColor: apiBackgroundColor,
				});
				return newMap;
			});

			setActiveVideoGenerations((prev) => {
				const newMap = new Map(prev);
				const generation = newMap.get(generationId);
				if (generation) {
					newMap.set(generationId, {
						...generation,
					});
				}
				return newMap;
			});
		} catch (error) {
			console.error("Error removing video background:", error);
			toast({
				title: "Error processing video",
				description:
					error instanceof Error ? error.message : "An error occurred",
				variant: "destructive",
			});

			setActiveVideoGenerations((prev) => {
				const newMap = new Map(prev);
				const generationId = Array.from(prev.keys()).find(
					(key) =>
						prev.get(key)?.sourceVideoId === selectedVideoForBackgroundRemoval,
				);
				if (generationId) {
					newMap.delete(generationId);
				}
				return newMap;
			});
		} finally {
			setSelectedVideoForBackgroundRemoval(null);
		}
	};

	const handleVideoGenerationComplete = async (
		videoId: string,
		videoUrl: string,
		duration: number,
	) => {
		try {
			console.log("Video generation complete:", {
				videoId,
				videoUrl,
				duration,
			});

			const generation = activeVideoGenerations.get(videoId);
			const sourceImageId = generation?.sourceImageId || selectedImageForVideo;
			const isBackgroundRemoval =
				generation?.modelId === "bria-video-background-removal";

			if (generation?.toastId) {
				const toastElement = document.querySelector(
					`[data-toast-id="${generation.toastId}"]`,
				);
				if (toastElement) {
					const closeButton = toastElement.querySelector(
						"[data-radix-toast-close]",
					);
					if (closeButton instanceof HTMLElement) {
						closeButton.click();
					}
				}
			}

			if (sourceImageId) {
				const image = images.find((img) => img.id === sourceImageId);
				if (image) {
					const video = convertImageToVideo(image, videoUrl, duration, false);

					video.x = image.x + image.width + 20;
					video.y = image.y;

					setVideos((prev) => [...prev, { ...video, isVideo: true as const }]);
					saveToHistory();
				} else {
					console.error("Source image not found:", sourceImageId);
					toast({
						title: "Error creating video",
						description: "The source image could not be found.",
						variant: "destructive",
					});
				}
			} else if (generation?.sourceVideoId || generation?.isVideoToVideo) {
				const sourceVideoId =
					generation?.sourceVideoId ||
					selectedVideoForVideo ||
					selectedVideoForExtend;
				const isExtension = generation?.isVideoExtension;

				if (sourceVideoId) {
					const sourceVideo = videos.find((vid) => vid.id === sourceVideoId);
					if (sourceVideo) {
						const newVideo: PlacedVideo = {
							id: `video_${Date.now()}_${Math.random().toString(36).substring(7)}`,
							src: videoUrl,
							x: sourceVideo.x + sourceVideo.width + 20,
							y: sourceVideo.y,
							width: sourceVideo.width,
							height: sourceVideo.height,
							rotation: 0,
							isPlaying: false,
							currentTime: 0,
							duration: duration,
							volume: 1,
							muted: false,
							isLooping: false,
							isVideo: true as const,
						};

						setVideos((prev) => [...prev, newVideo]);
						saveToHistory();
					} else {
						console.error("Source video not found:", sourceVideoId);
						toast({
							title: "Error creating video",
							description: "The source video could not be found.",
							variant: "destructive",
						});
					}
				}

				setIsTransformingVideo(false);
				setSelectedVideoForVideo(null);
				setIsExtendingVideo(false);
				setSelectedVideoForExtend(null);
			} else {
				console.log("Generated video URL:", videoUrl);
			}

			setActiveVideoGenerations((prev) => {
				const newMap = new Map(prev);
				newMap.delete(videoId);
				return newMap;
			});

			if (isBackgroundRemoval) {
				setIsRemovingVideoBackground(false);
			} else {
				setIsConvertingToVideo(false);
				setSelectedImageForVideo(null);
			}
		} catch (error) {
			console.error("Error completing video generation:", error);
		}
	};

	const handleVideoGenerationError = (videoId: string, error: string) => {
		console.error("Video generation error:", error);

		const generation = activeVideoGenerations.get(videoId);
		const isBackgroundRemoval =
			generation?.modelId === "bria-video-background-removal";

		toast({
			title: isBackgroundRemoval
				? "Background removal failed"
				: "Video generation failed",
			description: error,
			variant: "destructive",
		});

		setActiveVideoGenerations((prev) => {
			const newMap = new Map(prev);
			newMap.delete(videoId);
			return newMap;
		});

		if (isBackgroundRemoval) {
			setIsRemovingVideoBackground(false);
		} else {
			setIsConvertingToVideo(false);
			setIsTransformingVideo(false);
			setIsExtendingVideo(false);
		}
	};

	return {
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
		handleRemoveVideoBackgroundTrigger,
		handleVideoBackgroundRemoval,
		handleVideoGenerationComplete,
		handleVideoGenerationError,
	};
}
