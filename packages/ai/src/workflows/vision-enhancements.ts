import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import sharp from "sharp";
import { z } from "zod";

import { getEnv } from "../config";
import { GEMINI_TEXT_MODEL } from "../model-config";
import { uploadImageBufferToBlob } from "../utils/blob-storage";
import { withDevTools } from "../utils/model";

const env = getEnv();

async function downloadImageBuffer(imageUrl: string) {
	const response = await fetch(imageUrl);
	if (!response.ok) {
		throw new Error(
			`Failed to download image: ${response.status} ${response.statusText}`,
		);
	}
	return Buffer.from(await response.arrayBuffer());
}

export const imageReframeInputSchema = z.object({
	imageUrl: z.string().url(),
	targetWidth: z.number().int().positive(),
	targetHeight: z.number().int().positive(),
	strategy: z.enum(["cover", "contain", "attention"]).default("cover"),
});

export const imageReframeOutputSchema = z.object({
	imageUrl: z.string().url(),
	width: z.number(),
	height: z.number(),
	strategy: z.enum(["cover", "contain", "attention"]),
});

export type ImageReframeInput = z.infer<typeof imageReframeInputSchema>;
export type ImageReframeResult = z.infer<typeof imageReframeOutputSchema>;

export async function runImageReframeWorkflow(
	input: ImageReframeInput,
): Promise<ImageReframeResult> {
	const buffer = await downloadImageBuffer(input.imageUrl);
	const resized = await sharp(buffer)
		.resize(input.targetWidth, input.targetHeight, {
			fit: input.strategy === "contain" ? "contain" : "cover",
			position:
				input.strategy === "attention" ? sharp.strategy.attention : "centre",
		})
		.png()
		.toBuffer();

	const uploadedImageUrl = await uploadImageBufferToBlob(resized, {
		contentType: "image/png",
		prefix: "vision/reframe",
	});

	return {
		imageUrl: uploadedImageUrl,
		width: input.targetWidth,
		height: input.targetHeight,
		strategy: input.strategy,
	};
}

export const imageReframeWorkflow = {
	id: "image-reframe",
	inputSchema: imageReframeInputSchema,
	outputSchema: imageReframeOutputSchema,
	run: runImageReframeWorkflow,
};

export const imageUpscaleInputSchema = z.object({
	imageUrl: z.string().url(),
	scale: z.number().min(1).max(4).default(2),
	maxDimension: z.number().min(512).max(4096).default(2048),
});

export const imageUpscaleOutputSchema = z.object({
	imageUrl: z.string().url(),
	width: z.number(),
	height: z.number(),
	scale: z.number(),
});

export type ImageUpscaleInput = z.infer<typeof imageUpscaleInputSchema>;
export type ImageUpscaleResult = z.infer<typeof imageUpscaleOutputSchema>;

export async function runImageUpscaleWorkflow(
	input: ImageUpscaleInput,
): Promise<ImageUpscaleResult> {
	const { imageUrl, scale, maxDimension } = input;
	const buffer = await downloadImageBuffer(imageUrl);
	const image = sharp(buffer);
	const meta = await image.metadata();
	const targetWidth = Math.min((meta.width ?? 0) * scale, maxDimension);
	const targetHeight = Math.min((meta.height ?? 0) * scale, maxDimension);
	const upscaled = await image
		.resize(Math.round(targetWidth), Math.round(targetHeight), {
			kernel: sharp.kernel.lanczos3,
		})
		.png()
		.toBuffer();

	const uploadedImageUrl = await uploadImageBufferToBlob(upscaled, {
		contentType: "image/png",
		prefix: "vision/upscale",
	});

	return {
		imageUrl: uploadedImageUrl,
		width: Math.round(targetWidth),
		height: Math.round(targetHeight),
		scale,
	};
}

export const imageUpscaleWorkflow = {
	id: "image-upscale",
	inputSchema: imageUpscaleInputSchema,
	outputSchema: imageUpscaleOutputSchema,
	run: runImageUpscaleWorkflow,
};

export const paletteExtractionInputSchema = z.object({
	imageUrl: z.string().url(),
	colors: z.number().min(3).max(12).default(6),
});

export const paletteExtractionOutputSchema = z.object({
	palette: z.array(
		z.object({
			hex: z.string(),
			rgb: z.tuple([z.number(), z.number(), z.number()]),
			percentage: z.number(),
		}),
	),
});

export type PaletteExtractionInput = z.infer<
	typeof paletteExtractionInputSchema
>;
export type PaletteExtractionResult = z.infer<
	typeof paletteExtractionOutputSchema
>;

export async function runPaletteExtractionWorkflow(
	input: PaletteExtractionInput,
): Promise<PaletteExtractionResult> {
	const buffer = await downloadImageBuffer(input.imageUrl);
	const image = sharp(buffer).resize(256, 256, { fit: "inside" }).ensureAlpha();
	const { data, info } = await image
		.raw()
		.toBuffer({ resolveWithObject: true });
	const buckets = new Map<
		string,
		{ count: number; rgb: [number, number, number] }
	>();

	for (let i = 0; i < data.length; i += 4) {
		const r = data[i];
		const g = data[i + 1];
		const b = data[i + 2];
		const key = `${Math.round(r / 32)}-${Math.round(g / 32)}-${Math.round(b / 32)}`;
		const bucket = buckets.get(key) ?? { count: 0, rgb: [0, 0, 0] };
		bucket.count += 1;
		bucket.rgb = [r, g, b];
		buckets.set(key, bucket);
	}

	const sorted = Array.from(buckets.values()).sort((a, b) => b.count - a.count);
	const total = info.width * info.height;
	const palette = sorted.slice(0, input.colors).map(({ count, rgb }) => {
		const [r, g, b] = rgb;
		const hex = `#${[r, g, b]
			.map((value) => value.toString(16).padStart(2, "0"))
			.join("")}`;
		return {
			hex,
			rgb: [r, g, b] as [number, number, number],
			percentage: Number((count / total).toFixed(3)),
		};
	});

	return { palette };
}

export const paletteExtractionWorkflow = {
	id: "palette-extraction",
	inputSchema: paletteExtractionInputSchema,
	outputSchema: paletteExtractionOutputSchema,
	run: runPaletteExtractionWorkflow,
};

export const storyboardInputSchema = z.object({
	brief: z.string().min(10),
	frames: z.number().min(3).max(12).default(6),
	output: z.enum(["html", "markdown"]).default("html"),
});

export const storyboardOutputSchema = z.object({
	storyboard: z.string(),
	format: z.enum(["html", "markdown"]),
});

export type StoryboardInput = z.infer<typeof storyboardInputSchema>;
export type StoryboardResult = z.infer<typeof storyboardOutputSchema>;

export async function runStoryboardWorkflow(
	input: StoryboardInput,
): Promise<StoryboardResult> {
	const key = env.googleApiKey;
	if (!key) {
		throw new Error("Google API key required for storyboard generation");
	}
	const google = createGoogleGenerativeAI({ apiKey: key });
	const model = withDevTools(google(GEMINI_TEXT_MODEL));
	const formatDirective =
		input.output === "html"
			? "Return semantic HTML with <section> per frame and data attributes for timing."
			: "Return GitHub-flavored markdown with headings per frame.";
	const result = await generateText({
		model,
		prompt: `You are a storyboard artist. Using the following brief create a ${input.frames}-frame storyboard. ${formatDirective}\n\nBrief:\n${input.brief}`,
	});

	return {
		storyboard: result.text,
		format: input.output,
	};
}

export const storyboardWorkflow = {
	id: "storyboard-generator",
	inputSchema: storyboardInputSchema,
	outputSchema: storyboardOutputSchema,
	run: runStoryboardWorkflow,
};
