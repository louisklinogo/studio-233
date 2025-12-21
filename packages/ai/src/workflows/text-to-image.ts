import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createFalClient } from "@fal-ai/client";
import { generateText } from "ai";
import sharp from "sharp";
import { z } from "zod";

import { getEnv } from "../config";
import { IMAGE_GEN_MODEL } from "../model-config";
import { canvasToolOutputSchema } from "../schemas/tool-output";
import { uploadImageBufferToBlob } from "../utils/blob-storage";

const env = getEnv();

type FalImage = {
	url: string;
	width: number;
	height: number;
};

type FalImageResponse = {
	data?: {
		images?: FalImage[];
	};
	images?: FalImage[];
};

const ASPECT_RATIO_OPTIONS = [
	"1:1",
	"2:3",
	"3:2",
	"3:4",
	"4:3",
	"4:5",
	"5:4",
	"9:16",
	"16:9",
	"21:9",
] as const;

const IMAGE_SIZE_OPTIONS = [
	"landscape_4_3",
	"portrait_4_3",
	"square",
	"landscape_16_9",
	"portrait_16_9",
] as const;

type AspectRatioOption = (typeof ASPECT_RATIO_OPTIONS)[number];
type ImageSizeOption = (typeof IMAGE_SIZE_OPTIONS)[number];

const aspectRatioEnum = z.enum(ASPECT_RATIO_OPTIONS);
const imageSizeEnum = z.enum(IMAGE_SIZE_OPTIONS);

const aspectRatioOptionsSet = new Set<AspectRatioOption>(ASPECT_RATIO_OPTIONS);
const imageSizeOptionsSet = new Set<ImageSizeOption>(IMAGE_SIZE_OPTIONS);

const isAspectRatioOption = (value: unknown): value is AspectRatioOption => {
	return (
		typeof value === "string" &&
		aspectRatioOptionsSet.has(value as AspectRatioOption)
	);
};

const isImageSizeOption = (value: unknown): value is ImageSizeOption => {
	return (
		typeof value === "string" &&
		imageSizeOptionsSet.has(value as ImageSizeOption)
	);
};

const imageSizeToAspectRatio: Record<ImageSizeOption, AspectRatioOption> = {
	square: "1:1",
	landscape_4_3: "4:3",
	portrait_4_3: "3:4",
	landscape_16_9: "16:9",
	portrait_16_9: "9:16",
};

const aspectRatioToImageSize: Record<AspectRatioOption, ImageSizeOption> = {
	"1:1": "square",
	"2:3": "portrait_4_3",
	"3:2": "landscape_4_3",
	"3:4": "portrait_4_3",
	"4:3": "landscape_4_3",
	"4:5": "portrait_4_3",
	"5:4": "landscape_4_3",
	"9:16": "portrait_16_9",
	"16:9": "landscape_16_9",
	"21:9": "landscape_16_9",
};

export const textToImageInputSchema = z.object({
	prompt: z.string().min(1),
	modelId: z.string().optional(),
	loraUrl: z.string().url().optional(),
	seed: z.number().optional(),
	aspectRatio: aspectRatioEnum.optional(),
	imageSize: z.union([imageSizeEnum, aspectRatioEnum]).optional(),
	apiKey: z.string().optional(),
});

export const textToImageOutputSchema = canvasToolOutputSchema;

export type TextToImageInput = z.infer<typeof textToImageInputSchema>;
export type TextToImageResult = z.infer<typeof textToImageOutputSchema>;

export async function runTextToImageWorkflow(
	input: TextToImageInput,
): Promise<TextToImageResult> {
	const { prompt, modelId, loraUrl, seed, imageSize, aspectRatio, apiKey } =
		input;

	const normalizedImageSize = isAspectRatioOption(imageSize)
		? aspectRatioToImageSize[imageSize]
		: imageSize;

	const aspectRatioOverride =
		aspectRatio ??
		(isAspectRatioOption(imageSize) ? imageSize : undefined) ??
		(normalizedImageSize
			? imageSizeToAspectRatio[normalizedImageSize]
			: undefined);

	const googleKey = apiKey || env.googleApiKey;
	const falKey = apiKey || env.falKey;

	const shouldUseGemini =
		modelId === "gemini-2.5-flash-image-preview" ||
		modelId === IMAGE_GEN_MODEL ||
		modelId?.startsWith("gemini") ||
		(!falKey && !!googleKey);

	if (shouldUseGemini) {
		if (!googleKey) {
			throw new Error(
				"Google Gemini API key is required. Set GOOGLE_GENERATIVE_AI_API_KEY or GEMINI_API_KEY.",
			);
		}

		const google = createGoogleGenerativeAI({ apiKey: googleKey });
		const providerOptions = aspectRatioOverride
			? {
					google: {
						imageConfig: {
							aspectRatio: aspectRatioOverride,
						},
					},
				}
			: undefined;
		const result = await generateText({
			model: google(IMAGE_GEN_MODEL),
			prompt,
			providerOptions,
		});

		const file = result.files?.find((f) => f.mediaType.startsWith("image/"));

		if (!file) {
			throw new Error("Gemini did not return an image");
		}

		const imageBuffer = Buffer.from(file.uint8Array);
		let width = 1024;
		let height = 1024;

		try {
			const meta = await sharp(imageBuffer).metadata();
			width = meta.width ?? width;
			height = meta.height ?? height;
		} catch (error) {
			console.error("Failed to read Gemini image dimensions", {
				error: error instanceof Error ? error.message : String(error),
			});
		}
		const blobUrl = await uploadImageBufferToBlob(imageBuffer, {
			contentType: file.mediaType,
			prefix: "gemini/text-to-image",
		});

		return {
			command: {
				type: "add-image",
				url: blobUrl,
				width,
				height,
				meta: {
					provider: "gemini",
					prompt,
				},
			},
		};
	}

	if (!falKey) {
		throw new Error(
			"FAL API key is required for text-to-image generation and no Gemini fallback is available. Set FAL_KEY or GOOGLE_GENERATIVE_AI_API_KEY.",
		);
	}

	const falClient = createFalClient({
		credentials: () => falKey,
	});

	const loras = loraUrl ? [{ path: loraUrl, scale: 1 }] : [];

	const resolvedFalImageSize =
		normalizedImageSize ||
		(aspectRatioOverride
			? aspectRatioToImageSize[aspectRatioOverride]
			: undefined) ||
		"square";

	const result = await falClient.subscribe(
		"fal-ai/flux-kontext-lora/text-to-image",
		{
			input: {
				prompt,
				image_size: resolvedFalImageSize,
				num_inference_steps: 30,
				guidance_scale: 2.5,
				num_images: 1,
				enable_safety_checker: true,
				output_format: "png",
				seed,
				loras,
			},
		},
	);

	const falResponse = result as FalImageResponse;
	const resultData = falResponse.data ?? falResponse;
	if (!resultData.images?.[0]) {
		throw new Error("No image generated");
	}

	return {
		command: {
			type: "add-image",
			url: resultData.images[0].url,
			width: resultData.images[0].width,
			height: resultData.images[0].height,
			meta: {
				provider: "fal",
				prompt,
			},
		},
	};
}

export const textToImageWorkflow = {
	id: "text-to-image",
	inputSchema: textToImageInputSchema,
	outputSchema: textToImageOutputSchema,
	run: runTextToImageWorkflow,
};
