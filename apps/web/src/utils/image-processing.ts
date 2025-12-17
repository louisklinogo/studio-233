/**
 * Helper function to resize image if too large
 */
export const resizeImageIfNeeded = async (
	dataUrl: string,
	maxWidth: number = 2048,
	maxHeight: number = 2048,
): Promise<string> => {
	return new Promise((resolve, reject) => {
		const img = new window.Image();
		img.crossOrigin = "anonymous";
		img.onload = () => {
			// Check if resize is needed
			if (img.width <= maxWidth && img.height <= maxHeight) {
				resolve(dataUrl);
				return;
			}

			// Calculate new dimensions
			let newWidth = img.width;
			let newHeight = img.height;
			const aspectRatio = img.width / img.height;

			if (newWidth > maxWidth) {
				newWidth = maxWidth;
				newHeight = newWidth / aspectRatio;
			}
			if (newHeight > maxHeight) {
				newHeight = maxHeight;
				newWidth = newHeight * aspectRatio;
			}

			// Create canvas and resize
			const canvas = document.createElement("canvas");
			canvas.width = newWidth;
			canvas.height = newHeight;
			const ctx = canvas.getContext("2d");
			if (!ctx) {
				reject(new Error("Failed to get canvas context"));
				return;
			}

			ctx.drawImage(img, 0, 0, newWidth, newHeight);

			// Convert to data URL with compression
			canvas.toBlob(
				(blob) => {
					if (!blob) {
						reject(new Error("Failed to create blob"));
						return;
					}
					const reader = new FileReader();
					reader.onload = () => resolve(reader.result as string);
					reader.onerror = reject;
					reader.readAsDataURL(blob);
				},
				"image/jpeg",
				0.9, // 90% quality
			);
		};
		img.onerror = () => reject(new Error("Failed to load image"));
		img.src = dataUrl;
	});
};

/**
 * Helper function to create a cropped image
 */
export const createCroppedImage = async (
	imageSrc: string,
	cropX: number,
	cropY: number,
	cropWidth: number,
	cropHeight: number,
): Promise<string> => {
	return new Promise((resolve, reject) => {
		const img = new window.Image();
		img.crossOrigin = "anonymous"; // Enable CORS
		img.onload = () => {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");
			if (!ctx) {
				reject(new Error("Failed to get canvas context"));
				return;
			}

			// Set canvas size to the natural cropped dimensions
			canvas.width = cropWidth * img.naturalWidth;
			canvas.height = cropHeight * img.naturalHeight;

			// Draw the cropped portion at full resolution
			ctx.drawImage(
				img,
				cropX * img.naturalWidth,
				cropY * img.naturalHeight,
				cropWidth * img.naturalWidth,
				cropHeight * img.naturalHeight,
				0,
				0,
				canvas.width,
				canvas.height,
			);

			// Convert to data URL
			canvas.toBlob((blob) => {
				if (!blob) {
					reject(new Error("Failed to create blob"));
					return;
				}
				const reader = new FileReader();
				reader.onload = () => resolve(reader.result as string);
				reader.onerror = reject;
				reader.readAsDataURL(blob);
			}, "image/png");
		};
		img.onerror = () => reject(new Error("Failed to load image"));
		img.src = imageSrc;
	});
};
