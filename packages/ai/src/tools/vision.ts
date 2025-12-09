import { z } from "zod";
import { canvasToolOutputSchema } from "../schemas/tool-output";
import { backgroundRemovalWorkflow } from "../workflows/background-removal";
import {
	htmlGeneratorWorkflow,
	layoutDesignerWorkflow,
} from "../workflows/layout";
import { objectIsolationWorkflow } from "../workflows/object-isolation";
import {
	imageReframeWorkflow,
	imageUpscaleWorkflow,
	paletteExtractionWorkflow,
	storyboardWorkflow,
} from "../workflows/vision-enhancements";
import { createTool } from "./factory";

export { htmlToCanvasTool } from "./html-to-canvas";

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

export const imageReframeTool = createTool({
	id: "image-reframe",
	description:
		"Resize/crop an image to new dimensions while preserving key regions",
	inputSchema: z.object({
		imageUrl: z.string().url(),
		targetWidth: z.number().int().positive(),
		targetHeight: z.number().int().positive(),
		strategy: z.enum(["cover", "contain", "attention"]).default("cover"),
		originalImageId: z.string().optional(), // For canvas updates
	}),
	outputSchema: canvasToolOutputSchema,
	execute: async ({ context }) => {
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
	outputSchema: paletteExtractionWorkflow.outputSchema!,
	execute: async ({ context }) => paletteExtractionWorkflow.run(context),
});

export const storyboardTool = createTool({
	id: "storyboard-generator",
	description: "Generate HTML or markdown storyboards for creative pitches",
	inputSchema: z.object({
		brief: z.string().min(10),
		frames: z.number().min(3).max(12).default(6),
		output: z.enum(["html", "markdown"]).default("html"),
	}),
	outputSchema: storyboardWorkflow.outputSchema!,
	execute: async ({ context }) => storyboardWorkflow.run(context),
});

export const htmlGeneratorTool = createTool({
	id: "html-generator",
	description:
		"Produce semantic HTML/CSS scaffolds for layouts (hero pages, emails, decks)",
	inputSchema: htmlGeneratorWorkflow.inputSchema!,
	outputSchema: htmlGeneratorWorkflow.outputSchema!,
	execute: async ({ context }) => htmlGeneratorWorkflow.run(context),
});

export const layoutDesignerTool = createTool({
	id: "layout-designer",
	description:
		"Create detailed layout plans with sections, KPIs, and testing checklist",
	inputSchema: layoutDesignerWorkflow.inputSchema!,
	outputSchema: layoutDesignerWorkflow.outputSchema!,
	execute: async ({ context }) => layoutDesignerWorkflow.run(context),
});
