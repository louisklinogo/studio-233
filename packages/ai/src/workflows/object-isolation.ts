import { createFalClient } from "@fal-ai/client";
import sharp from "sharp";
import { z } from "zod";

import { getEnv } from "../config";
import { robustFetch } from "../utils/http";

const env = getEnv();

// Helper to download image
async function downloadImage(url: string): Promise<Buffer> {
	const response = await robustFetch(url, {
		maxRetries: 3,
		retryDelay: 1000,
		timeoutMs: 20000,
	});
	if (!response.ok)
		throw new Error(`Failed to download image: ${response.statusText}`);
	return Buffer.from(await response.arrayBuffer());
}

export const objectIsolationInputSchema = z.object({
	imageUrl: z.string().url(),
	prompt: z.string(),
	apiKey: z.string().optional(),
});

export const objectIsolationOutputSchema = z.object({
	imageUrl: z.string().url(),
	maskUrl: z.string().url(),
});

export type ObjectIsolationInput = z.infer<typeof objectIsolationInputSchema>;
export type ObjectIsolationResult = z.infer<typeof objectIsolationOutputSchema>;

export async function runObjectIsolationWorkflow(
	input: ObjectIsolationInput,
): Promise<ObjectIsolationResult> {
	const { imageUrl, prompt, apiKey } = input;
	const falKey = apiKey || env.falKey;

	if (!falKey) throw new Error("FAL API key required for object isolation");

	const fal = createFalClient({ credentials: () => falKey });

	const result = await fal.subscribe("fal-ai/evf-sam", {
		input: {
			image_url: imageUrl,
			prompt,
			mask_only: true,
			fill_holes: true,
			expand_mask: 2,
		},
	});

	if (!result.data?.image?.url) {
		throw new Error("No objects found matching the description");
	}

	const maskUrl = result.data.image.url;

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

	let processedMask = maskImage;
	if (
		originalMeta.width !== maskMeta.width ||
		originalMeta.height !== maskMeta.height
	) {
		processedMask = maskImage.resize(originalMeta.width, originalMeta.height);
	}

	const [rgbaOriginal, alphaMask] = await Promise.all([
		originalImage.ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
		processedMask.grayscale().raw().toBuffer({ resolveWithObject: true }),
	]);

	const outputBuffer = Buffer.alloc(rgbaOriginal.data.length);

	for (let i = 0; i < rgbaOriginal.info.width * rgbaOriginal.info.height; i++) {
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

	const blobData = Uint8Array.from(segmentedImage);
	const uploadResult = await fal.storage.upload(
		new Blob([blobData], { type: "image/png" }),
	);

	return {
		imageUrl: uploadResult,
		maskUrl,
	};
}

export const objectIsolationWorkflow = {
	id: "object-isolation",
	inputSchema: objectIsolationInputSchema,
	outputSchema: objectIsolationOutputSchema,
	run: runObjectIsolationWorkflow,
};
