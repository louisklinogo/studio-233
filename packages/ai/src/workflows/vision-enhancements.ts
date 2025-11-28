import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createStep, createWorkflow } from "@mastra/core/workflows";
import { generateText } from "ai";
import sharp from "sharp";
import { z } from "zod";

import { getEnv } from "../config";
import { GEMINI_TEXT_MODEL } from "../model-config";
import { uploadImageBufferToBlob } from "../utils/blob-storage";

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

const imageReframeStep = createStep({
	id: "image-reframe-step",
	inputSchema: z.object({
		imageUrl: z.string().url(),
		targetWidth: z.number().int().positive(),
		targetHeight: z.number().int().positive(),
		strategy: z.enum(["cover", "contain", "attention"]).default("cover"),
	}),
	outputSchema: z.object({
		imageUrl: z.string().url(),
		width: z.number(),
		height: z.number(),
		strategy: z.enum(["cover", "contain", "attention"]),
	}),
	execute: async ({ inputData }) => {
		const {
			imageUrl: sourceImageUrl,
			targetHeight,
			targetWidth,
			strategy,
		} = inputData;
		const buffer = await downloadImageBuffer(sourceImageUrl);
		const resized = await sharp(buffer)
			.resize(targetWidth, targetHeight, {
				fit: strategy === "contain" ? "contain" : "cover",
				position:
					strategy === "attention"
						? sharp.strategy.attention
						: sharp.position.center,
			})
			.png()
			.toBuffer();

		const uploadedImageUrl = await uploadImageBufferToBlob(resized, {
			contentType: "image/png",
			prefix: "vision/reframe",
		});

		return {
			imageUrl: uploadedImageUrl,
			width: targetWidth,
			height: targetHeight,
			strategy,
		};
	},
});

export const imageReframeWorkflow = createWorkflow({
	id: "image-reframe",
	inputSchema: imageReframeStep.inputSchema,
	outputSchema: imageReframeStep.outputSchema,
})
	.then(imageReframeStep)
	.commit();

const imageUpscaleStep = createStep({
	id: "image-upscale-step",
	inputSchema: z.object({
		imageUrl: z.string().url(),
		scale: z.number().min(1).max(4).default(2),
		maxDimension: z.number().min(512).max(4096).default(2048),
	}),
	outputSchema: z.object({
		imageUrl: z.string().url(),
		width: z.number(),
		height: z.number(),
		scale: z.number(),
	}),
	execute: async ({ inputData }) => {
		const { imageUrl: sourceImageUrl, scale, maxDimension } = inputData;
		const buffer = await downloadImageBuffer(sourceImageUrl);
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
	},
});

export const imageUpscaleWorkflow = createWorkflow({
	id: "image-upscale",
	inputSchema: imageUpscaleStep.inputSchema,
	outputSchema: imageUpscaleStep.outputSchema,
})
	.then(imageUpscaleStep)
	.commit();

const paletteExtractionStep = createStep({
	id: "palette-extraction-step",
	inputSchema: z.object({
		imageUrl: z.string().url(),
		colors: z.number().min(3).max(12).default(6),
	}),
	outputSchema: z.object({
		palette: z.array(
			z.object({
				hex: z.string(),
				rgb: z.tuple([z.number(), z.number(), z.number()]),
				percentage: z.number(),
			}),
		),
	}),
	execute: async ({ inputData }) => {
		const { imageUrl, colors } = inputData;
		const buffer = await downloadImageBuffer(imageUrl);
		const image = sharp(buffer)
			.resize(256, 256, { fit: "inside" })
			.ensureAlpha();
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

		const sorted = Array.from(buckets.values()).sort(
			(a, b) => b.count - a.count,
		);
		const total = info.width * info.height;
		const palette = sorted.slice(0, colors).map(({ count, rgb }) => {
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
	},
});

export const paletteExtractionWorkflow = createWorkflow({
	id: "palette-extraction",
	inputSchema: paletteExtractionStep.inputSchema,
	outputSchema: paletteExtractionStep.outputSchema,
})
	.then(paletteExtractionStep)
	.commit();

const storyboardStep = createStep({
	id: "storyboard-step",
	inputSchema: z.object({
		brief: z.string().min(10),
		frames: z.number().min(3).max(12).default(6),
		output: z.enum(["html", "markdown"]).default("html"),
	}),
	outputSchema: z.object({
		storyboard: z.string(),
		format: z.enum(["html", "markdown"]),
	}),
	execute: async ({ inputData }) => {
		const { brief, frames, output } = inputData;
		const key = env.googleApiKey;
		if (!key) {
			throw new Error("Google API key required for storyboard generation");
		}
		const google = createGoogleGenerativeAI({ apiKey: key });
		const model = google(GEMINI_TEXT_MODEL);
		const formatDirective =
			output === "html"
				? "Return semantic HTML with <section> per frame and data attributes for timing."
				: "Return GitHub-flavored markdown with headings per frame.";
		const result = await generateText({
			model,
			prompt: `You are a storyboard artist. Using the following brief create a ${frames}-frame storyboard. ${formatDirective}\n\nBrief:\n${brief}`,
		});

		return {
			storyboard: result.text,
			format: output,
		};
	},
});

export const storyboardWorkflow = createWorkflow({
	id: "storyboard-generator",
	inputSchema: storyboardStep.inputSchema,
	outputSchema: storyboardStep.outputSchema,
})
	.then(storyboardStep)
	.commit();
