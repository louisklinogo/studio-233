import type { FalClient } from "@fal-ai/client";
import type {
	CanvasCommand,
	TextToImageInput,
	TextToImageResult,
} from "@studio233/ai";
import type {
	ActiveGeneration,
	GenerationSettings,
	PlacedImage,
} from "@studio233/canvas";

type Placement = { x: number; y: number; width: number; height: number };

type GeminiEditParams = { imageUrl: string; prompt: string };
type GeminiEditResult = { image: string };

type UploadResult = { url: string };

type GenerationSettingsWithReference = GenerationSettings & {
	referenceImage?: string;
};

interface ImageProcessInput {
	src: string;
	x: number;
	y: number;
	width: number;
	height: number;
	cropX?: number;
	cropY?: number;
	cropWidth?: number;
	cropHeight?: number;
}

interface GenerationHandlerDeps {
	images: PlacedImage[];
	selectedIds: string[];
	generationSettings: GenerationSettingsWithReference;
	customApiKey?: string;
	canvasSize: { width: number; height: number };
	viewport: { x: number; y: number; scale: number };
	falClient: FalClient;
	setImages: React.Dispatch<React.SetStateAction<PlacedImage[]>>;
	setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
	setActiveGenerations: React.Dispatch<
		React.SetStateAction<Map<string, ActiveGeneration>>
	>;
	setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
	setIsApiKeyDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
	toast: (props: {
		title: string;
		description?: string;
		variant?: "default" | "destructive";
	}) => void;
	generateTextToImage: (params: TextToImageInput) => Promise<TextToImageResult>;
	editWithGemini?: (params: GeminiEditParams) => Promise<GeminiEditResult>;
	getPlacement?: (width?: number, height?: number) => Placement;
}

const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
	new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (blob) {
				resolve(blob);
			} else {
				reject(new Error("Failed to convert canvas to blob"));
			}
		}, "image/png");
	});

const readBlobAsDataUrl = (blob: Blob): Promise<string> =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = () =>
			reject(reader.error ?? new Error("Failed to read blob"));
		reader.readAsDataURL(blob);
	});

export const uploadImageDirect = async (
	dataUrl: string,
	falClient: FalClient,
	toast: GenerationHandlerDeps["toast"],
	setIsApiKeyDialogOpen: GenerationHandlerDeps["setIsApiKeyDialogOpen"],
): Promise<UploadResult> => {
	// Convert data URL to blob first
	const response = await fetch(dataUrl);
	const blob = await response.blob();

	try {
		// Check size before attempting upload
		if (blob.size > 10 * 1024 * 1024) {
			// 10MB warning
			console.warn(
				"Large image detected:",
				`${(blob.size / 1024 / 1024).toFixed(2)}MB`,
			);
		}

		// Upload directly to FAL through proxy (using the client instance)
		const uploadResult = await falClient.storage.upload(blob);

		return { url: uploadResult };
	} catch (error: unknown) {
		const status =
			typeof error === "object" && error && "status" in error
				? (error as { status?: number }).status
				: undefined;
		const message = error instanceof Error ? error.message : String(error);
		// Check for rate limit error
		const isRateLimit =
			status === 429 ||
			message.toLowerCase().includes("429") ||
			message.toLowerCase().includes("rate limit");

		if (isRateLimit) {
			toast({
				title: "Rate limit exceeded",
				description:
					"Add your FAL API key to bypass rate limits. Without an API key, uploads are limited.",
				variant: "destructive",
			});
			// Open API key dialog automatically
			setIsApiKeyDialogOpen(true);
		} else {
			toast({
				title: "Failed to upload image",
				description: message,
				variant: "destructive",
			});
		}

		// Re-throw the error so calling code knows upload failed
		throw error;
	}
};

export const generateImage = (
	imageUrl: string,
	x: number,
	y: number,
	groupId: string,
	generationSettings: GenerationSettings,
	setImages: GenerationHandlerDeps["setImages"],
	setActiveGenerations: GenerationHandlerDeps["setActiveGenerations"],
	width: number = 300,
	height: number = 300,
) => {
	const placeholderId = `generated-${Date.now()}`;
	setImages((prev) => [
		...prev,
		{
			id: placeholderId,
			src: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
			x,
			y,
			width,
			height,
			rotation: 0,
			isGenerated: true,
			parentGroupId: groupId,
		},
	]);

	// Store generation params
	setActiveGenerations((prev) =>
		new Map(prev).set(placeholderId, {
			imageUrl,
			prompt: generationSettings.prompt,
			loraUrl: generationSettings.loraUrl,
		}),
	);
};

export const handleRun = async (deps: GenerationHandlerDeps) => {
	const {
		images,
		selectedIds,
		generationSettings,
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
		getPlacement,
	} = deps;

	if (!generationSettings.prompt) {
		toast({
			title: "No Prompt",
			description: "Please enter a prompt to generate an image",
			variant: "destructive",
		});
		return;
	}

	setIsGenerating(true);

	// Determine images to process:
	// 1. Selected images on canvas
	// 2. OR reference image from settings (newly uploaded in panel)
	let imagesToProcess: ImageProcessInput[] = [];

	// Use selected images from canvas if any
	const selectedImages = images.filter((img) => selectedIds.includes(img.id));

	if (selectedImages.length > 0) {
		imagesToProcess = selectedImages.map((img) => ({
			src: img.src,
			x: img.x,
			y: img.y,
			width: img.width,
			height: img.height,
			cropX: img.cropX,
			cropY: img.cropY,
			cropWidth: img.cropWidth,
			cropHeight: img.cropHeight,
		}));
	} else if (generationSettings.referenceImage) {
		// Use the reference image uploaded in the panel
		// Calculate center position
		const viewportCenterX =
			(canvasSize.width / 2 - viewport.x) / viewport.scale;
		const viewportCenterY =
			(canvasSize.height / 2 - viewport.y) / viewport.scale;

		imagesToProcess = [
			{
				src: generationSettings.referenceImage,
				x: viewportCenterX - 150, // Center - half default width
				y: viewportCenterY - 150,
				width: 300, // Default width
				height: 300,
			},
		];
	}

	// If no images to process, do text-to-image generation
	if (imagesToProcess.length === 0) {
		try {
			const result = await generateTextToImage({
				prompt: generationSettings.prompt,
				modelId: generationSettings.modelId,
				loraUrl: generationSettings.loraUrl || undefined,
				aspectRatio: generationSettings.aspectRatio,
				apiKey: customApiKey || undefined,
			});

			const command = result.command;
			if (!command || command.type !== "add-image") {
				throw new Error("Text-to-image workflow returned no image command");
			}

			const resolvedCommand: CanvasCommand = {
				...command,
				meta: {
					...command.meta,
					prompt: generationSettings.prompt,
					modelId: generationSettings.modelId,
					loraUrl: generationSettings.loraUrl,
				},
			};

			const width = resolvedCommand.width;
			const height = resolvedCommand.height;

			const placement = getPlacement
				? getPlacement(width, height)
				: (() => {
						const viewportCenterX =
							(canvasSize.width / 2 - viewport.x) / viewport.scale;
						const viewportCenterY =
							(canvasSize.height / 2 - viewport.y) / viewport.scale;
						return {
							x: viewportCenterX - width / 2,
							y: viewportCenterY - height / 2,
							width,
							height,
						};
					})();

			const id = `generated-${Date.now()}-${Math.random()}`;
			setImages((prev) => [
				...prev,
				{
					id,
					src: resolvedCommand.url,
					x: placement.x,
					y: placement.y,
					width: placement.width,
					height: placement.height,
					rotation: 0,
					isGenerated: true,
				},
			]);

			setSelectedIds([id]);
		} catch (error) {
			console.error("Error generating image:", error);
			toast({
				title: "Generation failed",
				description:
					error instanceof Error ? error.message : "Failed to generate image",
				variant: "destructive",
			});
		} finally {
			setIsGenerating(false);
		}
		return;
	}

	// Process each image individually
	for (const img of imagesToProcess) {
		try {
			// Check for Gemini Model
			if (generationSettings.modelId === "gemini-2.5-flash-image-preview") {
				if (!editWithGemini) {
					console.warn("Gemini edit function not provided");
					continue;
				}

				// We need the original image URL to pass to Gemini
				// The 'img.src' is likely a blob URL or data URL if local, or a remote URL if previously uploaded.
				// Gemini router handles data URLs and remote URLs.

				// However, if the image has crop/rotation, we might want to process it first?
				// The existing logic below processes the image into a canvas to handle crops.
				// We should reuse that logic.

				// Let's continue to the canvas processing part below, and then branch off at the upload/generation step.
				// But wait, the current structure is a bit tangled.
				// Let's restructure slightly.

				// Actually, we can just let it fall through to the canvas processing,
				// get the `dataUrl` from the canvas, and then decide what to do with it.
			}

			// Get crop values (only applicable if it was a placed image, otherwise default)
			const cropX = img.cropX ?? 0;
			const cropY = img.cropY ?? 0;
			const cropWidth = img.cropWidth ?? 1;
			const cropHeight = img.cropHeight ?? 1;

			// Load the image
			const imgElement = new window.Image();
			imgElement.crossOrigin = "anonymous"; // Enable CORS
			imgElement.src = img.src;
			await new Promise((resolve) => {
				imgElement.onload = resolve;
			});

			// Create a canvas for the image at original resolution
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");
			if (!ctx) throw new Error("Failed to get canvas context");

			// Calculate the effective original dimensions accounting for crops
			let effectiveWidth = imgElement.naturalWidth;
			let effectiveHeight = imgElement.naturalHeight;

			if (cropWidth !== 1 || cropHeight !== 1) {
				effectiveWidth = cropWidth * imgElement.naturalWidth;
				effectiveHeight = cropHeight * imgElement.naturalHeight;
			}

			// Set canvas size to the original resolution (not display size)
			canvas.width = effectiveWidth;
			canvas.height = effectiveHeight;

			console.log(
				`Processing image at ${canvas.width}x${canvas.height} (original res)`,
			);

			// Always use the crop values (default to full image if not set)
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
			const blob = await canvasToBlob(canvas);
			const dataUrl = await readBlobAsDataUrl(blob);

			// BRANCH: If Gemini, call editWithGemini directly with the dataUrl
			if (
				generationSettings.modelId === "gemini-2.5-flash-image-preview" &&
				editWithGemini
			) {
				try {
					const result = await editWithGemini({
						imageUrl: dataUrl, // Pass the processed canvas data URL
						prompt: generationSettings.prompt,
					});

					// Gemini returns { image: dataUrl }
					// We can add this directly to canvas
					const id = `gemini-${Date.now()}-${Math.random().toString(36).slice(2)}`;

					// Calculate dimensions (Gemini might return different size, or same?)
					// The returned image is a base64 string.
					// We can create an Image object to get dimensions if needed, or just use the input dimensions?
					// Let's assume input dimensions for placement, but the image itself might be different.

					setImages((prev) => [
						...prev,
						{
							id,
							src: result.image,
							x: img.x + img.width + 20, // Place next to original
							y: img.y,
							width: img.width, // Preserve display size
							height: img.height,
							rotation: 0,
							isGenerated: true,
						},
					]);

					continue; // Skip the rest of the loop (upload -> fal generation)
				} catch (geminiError: unknown) {
					const msg =
						geminiError instanceof Error
							? geminiError.message
							: "Unknown error";
					console.error("Gemini generation failed:", geminiError);
					toast({
						title: "Gemini Generation Failed",
						description: msg,
						variant: "destructive",
					});
					continue;
				}
			}

			let uploadResult: UploadResult | null = null;
			try {
				uploadResult = await uploadImageDirect(
					dataUrl,
					falClient,
					toast,
					setIsApiKeyDialogOpen,
				);
			} catch (uploadError) {
				console.error("Failed to upload image:", uploadError);
				// Skip this image if upload fails
				continue;
			}

			// Only proceed with generation if upload succeeded
			if (!uploadResult?.url) {
				console.error("Upload succeeded but no URL returned");
				continue;
			}

			const groupId = `single-${Date.now()}-${Math.random()}`;
			generateImage(
				uploadResult.url,
				img.x + img.width + 20,
				img.y,
				groupId,
				generationSettings,
				setImages,
				setActiveGenerations,
				img.width,
				img.height,
			);
		} catch (error) {
			console.error("Error processing image:", error);
			toast({
				title: "Failed to process image",
				description:
					error instanceof Error ? error.message : "Failed to process image",
				variant: "destructive",
			});
		}
	}

	// Done processing all images
	setIsGenerating(false);
};
