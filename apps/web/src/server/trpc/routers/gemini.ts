import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { IMAGE_GEN_MODEL, uploadImageBufferToBlob } from "@studio233/ai";
import { generateText } from "ai";
import { z } from "zod";
import type { Context } from "../context";
import { rateLimitedProcedure, router } from "../init";

// Re-use the same rate limiting logic used for FAL when no custom API key is provided
async function checkRateLimit(apiKey: string | undefined, ctx?: Context) {
	if (apiKey) return;

	const { shouldLimitRequest, createRateLimiter } = await import(
		"@/lib/ratelimit"
	);

	const limiter = {
		perMinute: createRateLimiter(5, "60 s"),
		perHour: createRateLimiter(15, "60 m"),
		perDay: createRateLimiter(50, "24 h"),
	};

	const req = ctx?.req;
	const ip =
		req?.headers.get?.("x-forwarded-for") ||
		req?.headers.get?.("x-real-ip") ||
		"unknown";

	const limiterResult = await shouldLimitRequest(limiter, ip);
	if (limiterResult.shouldLimitRequest) {
		throw new Error(
			`Rate limit exceeded per ${limiterResult.period}. Add your Google API key to bypass rate limits.`,
		);
	}
}

async function parseImageInput(imageUrl: string): Promise<{
	image: Buffer;
	mediaType: string;
}> {
	// Data URL (e.g. data:image/png;base64,...)
	if (imageUrl.startsWith("data:")) {
		const match = /^data:(.+);base64,(.*)$/.exec(imageUrl);
		if (!match) {
			throw new Error("Invalid data URL for image");
		}
		const [, mimeType, base64] = match;
		const buffer = Buffer.from(base64, "base64");
		return { image: buffer, mediaType: mimeType };
	}

	// HTTP(S) URL - Pre-fetch to avoid AI SDK's internal fetch timeout issues
	if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
		const response = await fetch(imageUrl);
		if (!response.ok) {
			throw new Error(
				`Failed to fetch image: ${response.status} ${response.statusText}`,
			);
		}
		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Determine media type from Content-Type header or fall back to pathname
		let mediaType = response.headers.get("content-type") || "image/png";
		// Strip charset or other params (e.g., "image/png; charset=utf-8" -> "image/png")
		mediaType = mediaType.split(";")[0].trim();

		return { image: buffer, mediaType };
	}

	throw new Error("Unsupported image source. Use a data URL or HTTPS URL.");
}

// Helper function for text-to-image generation
export async function generateImageFromText(
	prompt: string,
	apiKey?: string,
	ctx?: Context,
) {
	await checkRateLimit(apiKey, ctx);

	const key =
		apiKey ||
		process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
		process.env.GEMINI_API_KEY;

	if (!key) {
		throw new Error(
			"Google Gemini API key is required. Set GOOGLE_GENERATIVE_AI_API_KEY or GEMINI_API_KEY.",
		);
	}

	const google = createGoogleGenerativeAI({ apiKey: key });

	const result = await generateText({
		model: google(IMAGE_GEN_MODEL),
		prompt: prompt,
	});

	const file = result.files?.find((f) => f.mediaType.startsWith("image/"));

	if (!file) {
		throw new Error("Gemini did not return an image");
	}

	const blobUrl = await uploadImageBufferToBlob(Buffer.from(file.uint8Array), {
		contentType: file.mediaType,
		prefix: "gemini/trpc-text-to-image",
	});

	return {
		url: blobUrl,
		width: 1024, // Gemini Flash Image defaults (usually square)
		height: 1024,
		seed: undefined, // Seed not returned by default API
	};
}

export async function generateImageFromTextWithFallback(
	prompt: string,
	imageUrl: string,
	apiKey?: string,
	ctx?: Context,
) {
	await checkRateLimit(apiKey, ctx);

	const key =
		apiKey ||
		process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
		process.env.GEMINI_API_KEY;

	if (!key) {
		throw new Error(
			"Google Gemini API key is required. Set GOOGLE_GENERATIVE_AI_API_KEY or GEMINI_API_KEY.",
		);
	}

	const google = createGoogleGenerativeAI({ apiKey: key });
	const { image, mediaType } = await parseImageInput(imageUrl);

	const result = await generateText({
		model: google(IMAGE_GEN_MODEL),
		prompt: [
			{
				role: "user" as const,
				content: [
					{
						type: "text" as const,
						text: prompt,
					},
					{
						type: "image" as const,
						image,
						mediaType,
					},
				],
			},
		],
	});

	const file = result.files?.find((f) => f.mediaType.startsWith("image/"));

	if (!file) {
		throw new Error("Gemini did not return an image");
	}

	const blobUrl = await uploadImageBufferToBlob(Buffer.from(file.uint8Array), {
		contentType: file.mediaType,
		prefix: "gemini/trpc-edit",
	});

	return {
		url: blobUrl,
		width: 1024,
		height: 1024,
	};
}

export const geminiRouter = router({
	generateImage: rateLimitedProcedure
		.input(
			z.object({
				prompt: z.string().min(1),
				apiKey: z.string().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const result = await generateImageFromText(
				input.prompt,
				input.apiKey,
				ctx,
			);
			return { image: result.url };
		}),

	editImage: rateLimitedProcedure
		.input(
			z.object({
				imageUrl: z.string(),
				prompt: z.string().min(1),
				apiKey: z.string().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			await checkRateLimit(input.apiKey, ctx);

			const apiKey =
				input.apiKey ||
				process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
				process.env.GEMINI_API_KEY;

			if (!apiKey) {
				throw new Error(
					"Google Gemini API key is required. Set GOOGLE_GENERATIVE_AI_API_KEY or GEMINI_API_KEY.",
				);
			}

			const google = createGoogleGenerativeAI({ apiKey });

			const { image, mediaType } = await parseImageInput(input.imageUrl);

			const result = await generateText({
				model: google(IMAGE_GEN_MODEL),
				prompt: [
					{
						role: "user" as const,
						content: [
							{
								type: "text" as const,
								text: input.prompt,
							},
							{
								type: "image" as const,
								image,
								mediaType,
							},
						],
					},
				],
			});

			const file = result.files?.find((f) => f.mediaType.startsWith("image/"));

			if (!file) {
				throw new Error("Gemini did not return an image");
			}

			const imageUrl = await uploadImageBufferToBlob(
				Buffer.from(file.uint8Array),
				{
					contentType: file.mediaType,
					prefix: "gemini/trpc-edit",
				},
			);

			return { image: imageUrl };
		}),
});
