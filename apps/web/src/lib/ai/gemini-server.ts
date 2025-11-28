import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { uploadImageBufferToBlob } from "@studio233/ai";
import { generateText } from "ai";

// Strict model definitions as requested
const PRIMARY_MODEL = "gemini-3-pro-preview";
const FALLBACK_MODEL = "gemini-2.5-flash-image-preview";

type GeminiContentPart =
	| { type: "text"; text: string }
	| { type: "image"; image: string | URL };

type GeminiTextResult = Awaited<ReturnType<typeof generateText>>;

interface GeminiGenerationOptions {
	prompt: string;
	imageUrl?: string; // Data URL or HTTP URL
	apiKey?: string;
}

/**
 * Generates content using Gemini with a strict primary -> fallback strategy.
 * Primary: gemini-3-pro-preview
 * Fallback: gemini-2.5-flash-image-preview
 */
export async function generateWithGemini(options: GeminiGenerationOptions) {
	const apiKey =
		options.apiKey ||
		process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
		process.env.GEMINI_API_KEY;

	if (!apiKey) {
		throw new Error("Google Gemini API key is required.");
	}

	const google = createGoogleGenerativeAI({ apiKey });

	// Helper to prepare input
	const prepareInput = (imageUrl?: string) => {
		const content: GeminiContentPart[] = [
			{ type: "text", text: options.prompt },
		];

		if (imageUrl) {
			// Simple check for data URL vs HTTP URL
			if (imageUrl.startsWith("data:")) {
				// @ai-sdk/google handles data URLs automatically in the 'image' field usually,
				// but let's parse it if needed or pass as is.
				// The Vercel AI SDK 'image' part accepts a URL or Base64 or Buffer.
				// Data URL string is supported.
				content.push({ type: "image", image: imageUrl });
			} else {
				content.push({ type: "image", image: new URL(imageUrl) });
			}
		}
		return content;
	};

	const inputContent = prepareInput(options.imageUrl);

	try {
		console.log(
			`[Gemini] Attempting generation with PRIMARY model: ${PRIMARY_MODEL}`,
		);
		const result = await generateText({
			model: google(PRIMARY_MODEL),
			messages: [
				{
					role: "user",
					content: inputContent,
				},
			],
		});

		return await processResult(result);
	} catch (error) {
		const err = error instanceof Error ? error : new Error(String(error));
		console.warn(
			`[Gemini] Primary model ${PRIMARY_MODEL} failed: ${err.message}. Switching to FALLBACK: ${FALLBACK_MODEL}`,
		);

		try {
			const result = await generateText({
				model: google(FALLBACK_MODEL),
				messages: [
					{
						role: "user",
						content: inputContent,
					},
				],
			});

			return await processResult(result);
		} catch (fallbackError) {
			const err =
				fallbackError instanceof Error
					? fallbackError
					: new Error(String(fallbackError));
			console.error(
				`[Gemini] Fallback model ${FALLBACK_MODEL} also failed: ${err.message}.`,
			);
			throw err;
		}
	}
}

async function processResult(result: GeminiTextResult) {
	// Check for images in the response (if Gemini generated an image)
	// Note: generateText from 'ai' package returns text.
	// If we want IMAGE generation, we might need a different call or check if the model returns image parts.
	// However, the user's script uses `generation_model.generate_content` which returns text/images.
	// The Vercel AI SDK `generateText` is primarily for text.
	// BUT, Gemini 2.5/3 can output images.
	// In the Vercel AI SDK, experimental_generateImage might be needed, OR we check if the response contains tool calls or attachments.

	// WAIT: The user's script uses `gemini-2.5-flash-image-preview` to GENERATE images.
	// In the existing router (gemini.ts), it uses `generateText` and checks `result.files`.
	// Let's replicate that exact logic from the existing router.

	// The existing router does:
	// const result = await generateText(...)
	// const file = result.files?.find(...)

	// So we will return both text and potential image URL.

	type GeminiFile = { mediaType: string; uint8Array: Uint8Array };
	const fileContainer = result as { files?: GeminiFile[] };
	const files = fileContainer.files ?? [];
	const imageFile = files.find((file) => file.mediaType.startsWith("image/"));

	let imageUrl = null;
	if (imageFile) {
		imageUrl = await uploadImageBufferToBlob(
			Buffer.from(imageFile.uint8Array),
			{
				contentType: imageFile.mediaType,
				prefix: "gemini/server-lib",
			},
		);
	}

	return {
		text: result.text,
		imageUrl: imageUrl,
	};
}
