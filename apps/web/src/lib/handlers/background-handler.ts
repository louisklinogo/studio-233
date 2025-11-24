import type { PlacedImage } from "@studio233/canvas";
import { uploadImageDirect } from "./generation-handler";

interface BackgroundHandlerDeps {
	images: PlacedImage[];
	selectedIds: string[];
	setImages: React.Dispatch<React.SetStateAction<PlacedImage[]>>;
	toast: (props: {
		title: string;
		description?: string;
		variant?: "default" | "destructive";
	}) => void;
	saveToHistory: () => void;
	removeBackground: (params: {
		imageUrl: string;
		apiKey?: string;
	}) => Promise<{ url: string }>;
	customApiKey?: string;
	falClient: any;
	setIsApiKeyDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const handleRemoveBackground = async (deps: BackgroundHandlerDeps) => {
	const {
		images,
		selectedIds,
		setImages,
		toast,
		saveToHistory,
		removeBackground,
		customApiKey,
		falClient,
		setIsApiKeyDialogOpen,
	} = deps;

	if (selectedIds.length === 0) return;

	try {
		saveToHistory();

		for (const imageId of selectedIds) {
			const image = images.find((img) => img.id === imageId);
			if (!image) continue;

			// Show loading state
			toast({
				title: "Processing...",
				description: "Removing background from image",
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
			let processedImageUrl = "";

			try {
				// First try uploading to FAL storage
				const uploadResult = await uploadImageDirect(
					dataUrl,
					falClient,
					(props) => {
						// Suppress error toasts as we have a fallback
						if (props.variant === "destructive") return;
						toast(props);
					},
					// Suppress API key dialog as we have a fallback
					() => {},
				);
				processedImageUrl = uploadResult?.url;
			} catch (error) {
				console.log(
					"FAL upload failed, attempting Vercel Blob upload as fallback",
				);

				try {
					// Convert base64 data URL to File object
					const res = await fetch(dataUrl);
					const blob = await res.blob();
					const file = new File([blob], `bg-removal-${Date.now()}.png`, {
						type: "image/png",
					});

					// Dynamically import upload to avoid server-side issues
					const { upload } = await import("@vercel/blob/client");

					// Upload to Vercel Blob
					const newBlob = await upload(file.name, file, {
						access: "public",
						handleUploadUrl: "/api/upload",
					});

					processedImageUrl = newBlob.url;
					console.log(
						"Successfully uploaded to Vercel Blob:",
						processedImageUrl,
					);
				} catch (blobError) {
					console.error("Vercel Blob upload also failed:", blobError);
					// Final fallback: use the data URL directly (though risky for large files)
					console.log("Falling back to direct data URL usage");
					processedImageUrl = dataUrl;
				}
			}

			if (!processedImageUrl) {
				throw new Error("Failed to prepare image for background removal");
			}

			// Remove background using the API
			const result = await removeBackground({
				imageUrl: processedImageUrl,
				apiKey: customApiKey || undefined,
			});

			// Update the image in place
			setImages((prev) =>
				prev.map((img) =>
					img.id === imageId
						? {
								...img,
								src: result.url,
								// Remove crop values since we've applied them
								cropX: undefined,
								cropY: undefined,
								cropWidth: undefined,
								cropHeight: undefined,
							}
						: img,
				),
			);
		}

		toast({
			title: "Success",
			description: "Background removed successfully",
		});
	} catch (error) {
		console.error("Error removing background:", error);
		toast({
			title: "Failed to remove background",
			description: error instanceof Error ? error.message : "Unknown error",
			variant: "destructive",
		});
	}
};
