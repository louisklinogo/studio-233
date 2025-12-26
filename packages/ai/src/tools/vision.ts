import { list } from "@vercel/blob";
import { z } from "zod";
import {
	htmlGeneratorInputSchema,
	layoutDesignerInputSchema,
} from "../schemas/layout";
import { canvasToolOutputSchema } from "../schemas/tool-output";
import type { backgroundRemovalWorkflow } from "../workflows/background-removal";
import type {
	htmlGeneratorWorkflow,
	layoutDesignerWorkflow,
} from "../workflows/layout";
import type { objectIsolationWorkflow } from "../workflows/object-isolation";
import type { visionAnalysisWorkflow } from "../workflows/vision-analysis";
import type {
	imageReframeWorkflow,
	imageUpscaleWorkflow,
	paletteExtractionWorkflow,
	storyboardWorkflow,
} from "../workflows/vision-enhancements";
import { createTool } from "./factory";

export { htmlToCanvasTool } from "./html-to-canvas";

async function getLatestBlobUrl(prefix: string): Promise<string | null> {
	try {
		const result = await list({ prefix, limit: 50 });
		const blobs = result.blobs;
		if (blobs.length === 0) return null;

		let latest = blobs[0]!;
		for (const blob of blobs) {
			if (blob.uploadedAt > latest.uploadedAt) {
				latest = blob;
			}
		}

		return latest.url;
	} catch {
		return null;
	}
}

/**
 * Edge-compatible hash function using Web Crypto API
 */
async function hashString(input: string): Promise<string> {
	const msgUint8 = new TextEncoder().encode(input);
	const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const visionAnalysisTool = createTool({
	id: "vision-analysis",
	description:
		"Analyze an image and return structured details (scene, palette, objects, OCR). If imageUrl is omitted, uses the most recent image attachment.",
	inputSchema: z.object({
		imageUrl: z.string().url().optional(),
		mode: z.enum(["quick", "full"]).optional(),
	}),
	execute: async ({ context, runtimeContext }) => {
		const imageUrl =
			context.imageUrl ??
			(typeof runtimeContext === "object" && runtimeContext
				? ((runtimeContext as any).latestImageUrl as string | undefined)
				: undefined);

		if (!imageUrl) {
			throw new Error(
				"visionAnalysis requires an imageUrl (or an image attachment in context)",
			);
		}

		const { visionAnalysisWorkflow } = await import(
			"../workflows/vision-analysis"
		);
		return visionAnalysisWorkflow.run(
			{ imageUrl },
			{
				mode: context.mode,
				abortSignal:
					typeof runtimeContext === "object" && runtimeContext
						? ((runtimeContext as any).abortSignal as AbortSignal | undefined)
						: undefined,
				logContext: {
					toolCallId:
						typeof runtimeContext === "object" && runtimeContext
							? ((runtimeContext as any).toolCallId as string | undefined)
							: undefined,
					threadId:
						typeof runtimeContext === "object" && runtimeContext
							? ((runtimeContext as any).threadId as string | undefined)
							: undefined,
				},
				onResult: (result, imageHash) => {
					const inngest = (runtimeContext as any)?.inngest;
					if (inngest) {
						return inngest.send({
							name: "vision.archive.requested",
							data: {
								imageUrl,
								imageHash,
								metadata: result as any,
							},
						});
					}
				},
			},
		);
	},
});

export const visionAnalysisRefTool = createTool({
	id: "vision-analysis-ref",
	description:
		"Look up persisted vision analysis and source snapshot URLs for a given image URL. If imageUrl is omitted, uses the most recent image attachment.",
	inputSchema: z.object({
		imageUrl: z.string().url().optional(),
	}),
	outputSchema: z.object({
		imageHash: z.string(),
		analysisJsonUrl: z.string().url().nullable(),
		sourceImageUrl: z.string().url().nullable(),
	}),
	execute: async ({ context, runtimeContext }) => {
		const imageUrl =
			context.imageUrl ??
			(typeof runtimeContext === "object" && runtimeContext
				? ((runtimeContext as any).latestImageUrl as string | undefined)
				: undefined);

		if (!imageUrl) {
			throw new Error(
				"visionAnalysisRef requires an imageUrl (or an image attachment in context)",
			);
		}

		const imageHash = await hashString(imageUrl);

		const [analysisJsonUrl, sourceImageUrl] = await Promise.all([
			getLatestBlobUrl(`vision/metadata/${imageHash}/`),
			getLatestBlobUrl(`vision/source/${imageHash}/`),
		]);

		return { imageHash, analysisJsonUrl, sourceImageUrl };
	},
});

export const backgroundRemovalTool = createTool({
	id: "background-removal",
	description:
		"Remove or replace the background of an image while preserving the subject",
	inputSchema: z.object({
		imageUrl: z.string().url(),
		originalImageId: z.string().optional(), // For canvas updates
		apiKey: z.string().optional(),
	}),
	outputSchema: canvasToolOutputSchema,
	execute: async ({ context }) => {
		const { backgroundRemovalWorkflow } = await import(
			"../workflows/background-removal"
		);
		const result = await backgroundRemovalWorkflow.run(context);

		// Return standardized command format
		return {
			command: {
				type: "update-image" as const,
				id: context.originalImageId || "unknown",
				url: result.imageUrl,
				meta: {
					operation: "background-removal",
					provider: result.provider,
					verified: result.verified,
					qualityScore: result.qualityScore,
				},
			},
			data: {
				provider: result.provider,
				verified: result.verified,
			},
			message: `Background removed successfully using ${result.provider}`,
		};
	},
});

export const objectIsolationTool = createTool({
	id: "object-isolation",
	description: "Segment and isolate a specific object described by a prompt",
	inputSchema: z.object({
		imageUrl: z.string().url(),
		prompt: z.string().min(3),
		originalImageId: z.string().optional(), // For canvas updates
		apiKey: z.string().optional(),
	}),
	outputSchema: canvasToolOutputSchema,
	execute: async ({ context }) => {
		const { objectIsolationWorkflow } = await import(
			"../workflows/object-isolation"
		);
		const result = await objectIsolationWorkflow.run(context);

		// Return standardized command format
		return {
			command: {
				type: "update-image" as const,
				id: context.originalImageId || "unknown",
				url: result.imageUrl,
				meta: {
					operation: "object-isolation",
					prompt: context.prompt,
					maskUrl: result.maskUrl,
				},
			},
			data: {
				maskUrl: result.maskUrl,
			},
			message: `Object isolated successfully: "${context.prompt}"`,
		};
	},
});

const imageReframeInputSchema = z
	.object({
		imageUrl: z.string().url().optional(),
		url: z.string().url().optional(),
		targetWidth: z.number().int().positive().optional(),
		width: z.number().int().positive().optional(),
		targetHeight: z.number().int().positive().optional(),
		height: z.number().int().positive().optional(),
		strategy: z.enum(["cover", "contain", "attention"]).optional(),
		prompt: z.string().min(3).optional(),
		originalImageId: z.string().optional(),
	})
	.superRefine((data, ctx) => {
		if (!data.imageUrl && !data.url) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "imageUrl or url is required",
			});
		}
		if (!data.targetWidth && !data.width) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "targetWidth or width is required",
			});
		}
		if (!data.targetHeight && !data.height) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "targetHeight or height is required",
			});
		}
	})
	.transform((data) => ({
		imageUrl: (data.imageUrl ?? data.url)!,
		targetWidth: (data.targetWidth ?? data.width)!,
		targetHeight: (data.targetHeight ?? data.height)!,
		strategy: data.strategy ?? "cover",
		prompt: data.prompt,
		originalImageId: data.originalImageId,
	}));

export const imageReframeTool = createTool({
	id: "image-reframe",
	description:
		"Resize/crop an image to new dimensions while preserving key regions",
	inputSchema: imageReframeInputSchema,
	outputSchema: canvasToolOutputSchema,
	execute: async ({ context }) => {
		const { imageReframeWorkflow } = await import(
			"../workflows/vision-enhancements"
		);
		const result = await imageReframeWorkflow.run(context);

		return {
			command: {
				type: "update-image" as const,
				id: context.originalImageId || "unknown",
				url: result.imageUrl,
				meta: {
					operation: "image-reframe",
					strategy: context.strategy,
					dimensions: `${context.targetWidth}x${context.targetHeight}`,
				},
			},
			message: `Image reframed to ${context.targetWidth}x${context.targetHeight}`,
		};
	},
});

export const imageUpscaleTool = createTool({
	id: "image-upscale",
	description: "Upscale images up to 4x using Lanczos filtering",
	inputSchema: z.object({
		imageUrl: z.string().url(),
		scale: z.number().min(1).max(4).default(2),
		maxDimension: z.number().min(512).max(4096).default(2048),
		originalImageId: z.string().optional(), // For canvas updates
	}),
	outputSchema: canvasToolOutputSchema,
	execute: async ({ context }) => {
		const { imageUpscaleWorkflow } = await import(
			"../workflows/vision-enhancements"
		);
		const result = await imageUpscaleWorkflow.run(context);

		return {
			command: {
				type: "update-image" as const,
				id: context.originalImageId || "unknown",
				url: result.imageUrl,
				meta: {
					operation: "image-upscale",
					scale: context.scale,
					dimensions: `${result.width}x${result.height}`,
				},
			},
			message: `Image upscaled ${context.scale}x`,
		};
	},
});

export const paletteExtractorTool = createTool({
	id: "palette-extractor",
	description: "Extract a brand-ready color palette from an image",
	inputSchema: z.object({
		imageUrl: z.string().url(),
		colors: z.number().min(3).max(12).default(6),
	}),
	execute: async ({ context }) => {
		const { paletteExtractionWorkflow } = await import(
			"../workflows/vision-enhancements"
		);
		return paletteExtractionWorkflow.run(context);
	},
});

export const storyboardTool = createTool({
	id: "storyboard-generator",
	description: "Generate HTML or markdown storyboards for creative pitches",
	inputSchema: z.object({
		brief: z.string().min(10),
		frames: z.number().min(3).max(12).default(6),
		output: z.enum(["html", "markdown"]).default("html"),
	}),
	execute: async ({ context }) => {
		const { storyboardWorkflow } = await import(
			"../workflows/vision-enhancements"
		);
		return storyboardWorkflow.run(context);
	},
});

export const htmlGeneratorTool = createTool({
	id: "html-generator",
	description:
		"Produce semantic HTML/CSS scaffolds for layouts (hero pages, emails, decks)",
	inputSchema: htmlGeneratorInputSchema,
	execute: async ({ context }) => {
		const { htmlGeneratorWorkflow } = await import("../workflows/layout");
		return htmlGeneratorWorkflow.run(context as any);
	},
});

export const layoutDesignerTool = createTool({
	id: "layout-designer",
	description:
		"Create detailed layout plans with sections, KPIs, and testing checklist",
	inputSchema: layoutDesignerInputSchema,
	execute: async ({ context }) => {
		const { layoutDesignerWorkflow } = await import("../workflows/layout");
		return layoutDesignerWorkflow.run(context as any);
	},
});
