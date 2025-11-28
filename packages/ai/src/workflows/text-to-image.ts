import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createFalClient } from "@fal-ai/client";
import { generateText } from "ai";
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

export const textToImageInputSchema = z.object({
	prompt: z.string().min(1),
	modelId: z.string().optional(),
	loraUrl: z.string().url().optional(),
	seed: z.number().optional(),
	imageSize: z
		.enum([
			"landscape_4_3",
			"portrait_4_3",
			"square",
			"landscape_16_9",
			"portrait_16_9",
		])
		.optional(),
	apiKey: z.string().optional(),
});

export const textToImageOutputSchema = canvasToolOutputSchema;

export type TextToImageInput = z.infer<typeof textToImageInputSchema>;
export type TextToImageResult = z.infer<typeof textToImageOutputSchema>;

export async function runTextToImageWorkflow(
	input: TextToImageInput,
): Promise<TextToImageResult> {
	const { prompt, modelId, loraUrl, seed, imageSize, apiKey } = input;

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
		const result = await generateText({
			model: google(IMAGE_GEN_MODEL),
			prompt,
		});

		const file = result.files?.find((f) => f.mediaType.startsWith("image/"));

		if (!file) {
			throw new Error("Gemini did not return an image");
		}

		const imageBuffer = Buffer.from(file.uint8Array);
		const blobUrl = await uploadImageBufferToBlob(imageBuffer, {
			contentType: file.mediaType,
			prefix: "gemini/text-to-image",
		});

		return {
			command: {
				type: "add-image",
				url: blobUrl,
				width: 1024,
				height: 1024,
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

	const result = await falClient.subscribe(
		"fal-ai/flux-kontext-lora/text-to-image",
		{
			input: {
				prompt,
				image_size: imageSize || "square",
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
