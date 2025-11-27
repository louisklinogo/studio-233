import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createFalClient } from "@fal-ai/client";
import { createStep, createWorkflow } from "@mastra/core/workflows";
import { generateText } from "ai";
import { z } from "zod";

import { getEnv } from "../config";

const env = getEnv();

const textToImageStep = createStep({
	id: "text-to-image-step",
	inputSchema: z.object({
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
	}),
	outputSchema: z.object({
		url: z.string().url(),
		width: z.number(),
		height: z.number(),
		seed: z.number().optional(),
		provider: z.enum(["fal", "gemini"]),
	}),
	execute: async ({ inputData }) => {
		const { prompt, modelId, loraUrl, seed, imageSize, apiKey } = inputData;

		const googleKey = apiKey || env.googleApiKey;
		const falKey = apiKey || env.falKey;

		// Prefer Gemini when an explicit Gemini model is requested or when no FAL key is
		// available but a Google key is. This mirrors the behaviour of the existing
		// TRPC generateImageFromText helper used by the canvas prompt generator.
		const shouldUseGemini =
			modelId === "gemini-2.5-flash-image-preview" ||
			modelId === "gemini-3-pro-image-preview" ||
			modelId?.startsWith("gemini") ||
			(!falKey && !!googleKey);

		// Gemini text-to-image path (aligned with apps/web Gemini helper)
		if (shouldUseGemini) {
			if (!googleKey) {
				throw new Error(
					"Google Gemini API key is required. Set GOOGLE_GENERATIVE_AI_API_KEY or GEMINI_API_KEY.",
				);
			}

			const google = createGoogleGenerativeAI({ apiKey: googleKey });
			const result = await generateText({
				// Match the working canvas prompt generator, which uses
				// google("gemini-3-pro-preview") and then reads result.files.
				model: google("gemini-3-pro-preview"),
				prompt,
			});

			const file = result.files?.find((f) => f.mediaType.startsWith("image/"));

			if (!file) {
				throw new Error("Gemini did not return an image");
			}

			const base64 = Buffer.from(file.uint8Array).toString("base64");
			const dataUrl = `data:${file.mediaType};base64,${base64}`;

			return {
				url: dataUrl,
				width: 1024,
				height: 1024,
				seed: undefined,
				provider: "gemini" as const,
			};
		}

		// FAL text-to-image path (mirrors existing TRPC generateTextToImage)
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

		const resultData = (result as any).data || result;
		if (!resultData.images?.[0]) {
			throw new Error("No image generated");
		}

		return {
			url: resultData.images[0].url,
			width: resultData.images[0].width,
			height: resultData.images[0].height,
			seed: resultData.seed,
			provider: "fal" as const,
		};
	},
});

export const textToImageWorkflow = createWorkflow({
	id: "text-to-image",
	inputSchema: textToImageStep.inputSchema,
	outputSchema: textToImageStep.outputSchema,
})
	.then(textToImageStep)
	.commit();
