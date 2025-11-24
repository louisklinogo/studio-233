import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { z } from "zod";
import { rateLimitedProcedure, router } from "../init";

// Re-use the same rate limiting logic used for FAL when no custom API key is provided
async function checkRateLimit(apiKey: string | undefined, ctx: any) {
	if (apiKey) return;

	const { shouldLimitRequest, createRateLimiter } = await import(
		"@/lib/ratelimit"
	);

	const limiter = {
		perMinute: createRateLimiter(5, "60 s"),
		perHour: createRateLimiter(15, "60 m"),
		perDay: createRateLimiter(50, "24 h"),
	};

	const ip =
		ctx.req?.headers.get?.("x-forwarded-for") ||
		ctx.req?.headers.get?.("x-real-ip") ||
		"unknown";

	const limiterResult = await shouldLimitRequest(limiter, ip);
	if (limiterResult.shouldLimitRequest) {
		throw new Error(
			`Rate limit exceeded per ${limiterResult.period}. Add your Google API key to bypass rate limits.`,
		);
	}
}

function parseImageInput(imageUrl: string): {
	image: string | URL | Buffer;
	mediaType: string;
} {
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

	// HTTP(S) URL
	if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
		const url = new URL(imageUrl);
		const pathname = url.pathname.toLowerCase();
		let mediaType = "image/png";

		if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg")) {
			mediaType = "image/jpeg";
		} else if (pathname.endsWith(".webp")) {
			mediaType = "image/webp";
		}

		return { image: url, mediaType };
	}

	throw new Error("Unsupported image source. Use a data URL or HTTPS URL.");
}

// Helper function for text-to-image generation
export async function generateImageFromText(
	prompt: string,
	apiKey?: string,
	ctx?: any,
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
		model: google("gemini-3-pro-preview"),
		prompt: prompt,
	});

	const file = result.files?.find((f) => f.mediaType.startsWith("image/"));

	if (!file) {
		throw new Error("Gemini did not return an image");
	}

	const base64 = Buffer.from(file.uint8Array).toString("base64");
	const dataUrl = `data:${file.mediaType};base64,${base64}`;

	return {
		url: dataUrl,
		width: 1024, // Gemini Flash Image defaults (usually square)
		height: 1024,
		seed: undefined, // Seed not returned by default API
	};
}

export async function generateImageFromTextWithFallback(
	prompt: string,
	imageUrl: string,
	apiKey?: string,
	ctx?: any,
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
	const { image, mediaType } = parseImageInput(imageUrl);

	const result = await generateText({
		model: google("gemini-3-pro-preview"),
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

	const base64 = Buffer.from(file.uint8Array).toString("base64");
	const dataUrl = `data:${file.mediaType};base64,${base64}`;

	return {
		url: dataUrl,
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

			const { image, mediaType } = parseImageInput(input.imageUrl);

			const result = await generateText({
				model: google("gemini-3-pro-preview"),
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

			const base64 = Buffer.from(file.uint8Array).toString("base64");
			const dataUrl = `data:${file.mediaType};base64,${base64}`;

			return { image: dataUrl };
		}),
});
