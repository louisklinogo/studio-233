import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { uploadImageBufferToBlob } from "@studio233/ai/utils/blob-storage";
import { generateText } from "ai";

// Strict model definitions
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
			if (imageUrl.startsWith("data:")) {
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
