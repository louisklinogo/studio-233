import { createFalClient } from "@fal-ai/client";
import { createStep, createWorkflow } from "@mastra/core/workflows";
import sharp from "sharp";
import { z } from "zod";

// Helper to download image
async function downloadImage(url: string): Promise<Buffer> {
	const response = await fetch(url);
	if (!response.ok)
		throw new Error(`Failed to download image: ${response.statusText}`);
	return Buffer.from(await response.arrayBuffer());
}

const isolateObjectStep = createStep({
	id: "isolate-object",
	inputSchema: z.object({
		imageUrl: z.string().url(),
		prompt: z.string(),
		apiKey: z.string().optional(),
	}),
	outputSchema: z.object({
		imageUrl: z.string().url(),
		maskUrl: z.string().url(),
	}),
	execute: async ({ context }) => {
		const { imageUrl, prompt, apiKey } = context;
		const falKey = apiKey || process.env.FAL_KEY;

		if (!falKey) throw new Error("FAL API key required for object isolation");

		const fal = createFalClient({ credentials: () => falKey });

		// 1. Generate segmentation mask
		const result = await fal.subscribe("fal-ai/evf-sam", {
			input: {
				image_url: imageUrl,
				prompt: prompt,
				mask_only: true,
				fill_holes: true,
				expand_mask: 2,
			},
		});

		if (!result.data?.image?.url) {
			throw new Error("No objects found matching the description");
		}

		const maskUrl = result.data.image.url;

		// 2. Process image with Sharp (apply mask)
		const [originalBuffer, maskBuffer] = await Promise.all([
			downloadImage(imageUrl),
			downloadImage(maskUrl),
		]);

		const originalImage = sharp(originalBuffer);
		const maskImage = sharp(maskBuffer);

		const [originalMeta, maskMeta] = await Promise.all([
			originalImage.metadata(),
			maskImage.metadata(),
		]);

		// Resize mask if needed
		let processedMask = maskImage;
		if (
			originalMeta.width !== maskMeta.width ||
			originalMeta.height !== maskMeta.height
		) {
			processedMask = maskImage.resize(originalMeta.width, originalMeta.height);
		}

		// Apply mask
		const [rgbaOriginal, alphaMask] = await Promise.all([
			originalImage.ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
			processedMask.grayscale().raw().toBuffer({ resolveWithObject: true }),
		]);

		const outputBuffer = Buffer.alloc(rgbaOriginal.data.length);

		for (
			let i = 0;
			i < rgbaOriginal.info.width * rgbaOriginal.info.height;
			i++
		) {
			const rgbOffset = i * 4;
			const maskOffset = i;

			outputBuffer[rgbOffset] = rgbaOriginal.data[rgbOffset];
			outputBuffer[rgbOffset + 1] = rgbaOriginal.data[rgbOffset + 1];
			outputBuffer[rgbOffset + 2] = rgbaOriginal.data[rgbOffset + 2];
			outputBuffer[rgbOffset + 3] = alphaMask.data[maskOffset];
		}

		const segmentedImage = await sharp(outputBuffer, {
			raw: {
				width: rgbaOriginal.info.width,
				height: rgbaOriginal.info.height,
				channels: 4,
			},
		})
			.png()
			.toBuffer();

		// 3. Upload result
		const uploadResult = await fal.storage.upload(
			new Blob([segmentedImage], { type: "image/png" }),
		);

		return {
			imageUrl: uploadResult,
			maskUrl: maskUrl,
		};
	},
});

export const objectIsolationWorkflow = createWorkflow({
	id: "object-isolation",
	triggerSchema: z.object({
		imageUrl: z.string().url(),
		prompt: z.string(),
		apiKey: z.string().optional(),
	}),
})
	.then(isolateObjectStep)
	.commit();
