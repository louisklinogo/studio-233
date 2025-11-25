import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createFalClient } from "@fal-ai/client";
import { createStep, createWorkflow } from "@mastra/core/workflows";
import { generateText } from "ai";
import { z } from "zod";

// Helper for Gemini fallback
async function removeBackgroundWithGemini(imageUrl: string, apiKey?: string) {
	const key =
		apiKey ||
		process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
		process.env.GEMINI_API_KEY;
	if (!key) throw new Error("No Google API key found for fallback");

	const google = createGoogleGenerativeAI({ apiKey: key });

	// Parse image input (simplified for URL)
	const imagePart = { type: "image" as const, image: new URL(imageUrl) };

	const result = await generateText({
		model: google("gemini-3-pro-preview"),
		prompt: [
			{
				role: "user",
				content: [
					{
						type: "text",
						text: "Remove the background from this image. Return ONLY the image with transparent background. Keep the subject intact.",
					},
					imagePart,
				],
			},
		],
	});

	const file = result.files?.find((f) => f.mediaType.startsWith("image/"));
	if (!file) throw new Error("Gemini did not return an image");

	const base64 = Buffer.from(file.uint8Array).toString("base64");
	return `data:${file.mediaType};base64,${base64}`;
}

const removeBackgroundStep = createStep({
	id: "remove-background",
	inputSchema: z.object({
		imageUrl: z.string().url(),
		apiKey: z.string().optional(),
	}),
	outputSchema: z.object({
		imageUrl: z.string().url(),
		provider: z.enum(["fal", "gemini"]),
	}),
	execute: async ({ inputData }) => {
		const { imageUrl, apiKey } = inputData;
		const falKey = apiKey || process.env.FAL_KEY;

		// Try FAL first
		if (falKey) {
			try {
				const fal = createFalClient({ credentials: () => falKey });
				const result = await fal.subscribe("fal-ai/bria/background/remove", {
					input: { image_url: imageUrl, sync_mode: true },
				});

				if (result.data?.image?.url) {
					return { imageUrl: result.data.image.url, provider: "fal" as const };
				}
			} catch (error) {
				console.warn(
					"FAL background removal failed, attempting fallback:",
					error,
				);
			}
		}

		// Fallback to Gemini
		try {
			const geminiUrl = await removeBackgroundWithGemini(imageUrl);
			return { imageUrl: geminiUrl, provider: "gemini" as const };
		} catch (error) {
			throw new Error(
				`Background removal failed: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	},
});

const verifyQualityStep = createStep({
	id: "verify-quality",
	inputSchema: z.object({
		imageUrl: z.string().url(),
		provider: z.enum(["fal", "gemini"]),
	}),
	outputSchema: z.object({
		verified: z.boolean(),
		qualityScore: z.number(),
	}),
	execute: async ({ inputData }) => {
		// Mock verification for now
		// In production, this could call a vision model to check for artifacts
		return { verified: true, qualityScore: 0.95 };
	},
});

export const backgroundRemovalWorkflow = createWorkflow({
	id: "background-removal",
	inputSchema: z.object({
		imageUrl: z.string().url(),
		apiKey: z.string().optional(),
	}),
	outputSchema: verifyQualityStep.outputSchema,
})
	.then(removeBackgroundStep)
	.then(verifyQualityStep)
	.commit();
