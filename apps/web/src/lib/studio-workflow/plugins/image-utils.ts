type ImageDimensions = { width: number; height: number };

export async function loadImage(url: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
		img.src = url;
	});
}

export function getTargetDimensions(
	original: ImageDimensions,
	targetWidth?: number,
	targetHeight?: number,
	mode: "contain" | "cover" | "stretch" | "scale-down" = "contain",
): ImageDimensions {
	const nextWidth =
		targetWidth && targetWidth > 0 ? targetWidth : original.width;
	const nextHeight =
		targetHeight && targetHeight > 0 ? targetHeight : original.height;

	if (mode === "stretch") {
		return { width: nextWidth, height: nextHeight };
	}

	const ratioX = nextWidth / original.width;
	const ratioY = nextHeight / original.height;

	if (mode === "cover") {
		const ratio = Math.max(ratioX, ratioY);
		return {
			width: Math.max(1, Math.round(original.width * ratio)),
			height: Math.max(1, Math.round(original.height * ratio)),
		};
	}

	if (mode === "scale-down") {
		const ratio = Math.min(1, Math.min(ratioX, ratioY));
		return {
			width: Math.max(1, Math.round(original.width * ratio)),
			height: Math.max(1, Math.round(original.height * ratio)),
		};
	}

	const ratio = Math.min(ratioX, ratioY);
	return {
		width: Math.max(1, Math.round(original.width * ratio)),
		height: Math.max(1, Math.round(original.height * ratio)),
	};
}

export async function canvasFromImage(
	img: HTMLImageElement,
	dimensions: ImageDimensions,
): Promise<HTMLCanvasElement> {
	const canvas = document.createElement("canvas");
	canvas.width = dimensions.width;
	canvas.height = dimensions.height;
	const context = canvas.getContext("2d");

	if (!context) {
		throw new Error("Canvas context is not available");
	}

	context.drawImage(img, 0, 0, dimensions.width, dimensions.height);
	return canvas;
}

export async function blobFromCanvas(
	canvas: HTMLCanvasElement,
	mimeType: string,
	quality?: number,
): Promise<Blob> {
	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (!blob) {
					reject(new Error("Failed to generate image blob"));
					return;
				}
				resolve(blob);
			},
			mimeType,
			quality,
		);
	});
}

export function toQuality(value: unknown, fallback = 0.9): number {
	const numeric = typeof value === "number" ? value : Number(value);
	if (Number.isNaN(numeric)) return fallback;
	return Math.min(1, Math.max(0.01, numeric / 100));
}
