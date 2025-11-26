import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { runWorkflow } from "../utils/run-workflow";
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

export const backgroundRemovalTool = createTool({
	id: "background-removal",
	description:
		"Remove or replace the background of an image while preserving the subject",
	inputSchema: z.object({
		imageUrl: z.string().url(),
		apiKey: z.string().optional(),
	}),
	outputSchema: z.object({
		imageUrl: z.string().url(),
		provider: z.enum(["fal", "gemini"]),
		verified: z.boolean(),
		qualityScore: z.number(),
	}),
	execute: async ({ context }) =>
		runWorkflow(backgroundRemovalWorkflow, context),
});

export const objectIsolationTool = createTool({
	id: "object-isolation",
	description: "Segment and isolate a specific object described by a prompt",
	inputSchema: z.object({
		imageUrl: z.string().url(),
		prompt: z.string().min(3),
		apiKey: z.string().optional(),
	}),
	outputSchema: z.object({
		imageUrl: z.string().url(),
		maskUrl: z.string().url(),
	}),
	execute: async ({ context }) => runWorkflow(objectIsolationWorkflow, context),
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
	}),
	outputSchema: imageReframeWorkflow.outputSchema!,
	execute: async ({ context }) => runWorkflow(imageReframeWorkflow, context),
});

export const imageUpscaleTool = createTool({
	id: "image-upscale",
	description: "Upscale images up to 4x using Lanczos filtering",
	inputSchema: z.object({
		imageUrl: z.string().url(),
		scale: z.number().min(1).max(4).default(2),
		maxDimension: z.number().min(512).max(4096).default(2048),
	}),
	outputSchema: imageUpscaleWorkflow.outputSchema!,
	execute: async ({ context }) => runWorkflow(imageUpscaleWorkflow, context),
});

export const paletteExtractorTool = createTool({
	id: "palette-extractor",
	description: "Extract a brand-ready color palette from an image",
	inputSchema: z.object({
		imageUrl: z.string().url(),
		colors: z.number().min(3).max(12).default(6),
	}),
	outputSchema: paletteExtractionWorkflow.outputSchema!,
	execute: async ({ context }) =>
		runWorkflow(paletteExtractionWorkflow, context),
});

export const storyboardTool = createTool({
	id: "storyboard-generator",
	description: "Generate HTML or markdown storyboards for creative pitches",
	inputSchema: z.object({
		brief: z.string().min(10),
		frames: z.number().min(3).max(12).default(6),
		format: z.enum(["html", "markdown"]).default("html"),
	}),
	outputSchema: storyboardWorkflow.outputSchema!,
	execute: async ({ context }) => runWorkflow(storyboardWorkflow, context),
});

export const htmlGeneratorTool = createTool({
	id: "html-generator",
	description:
		"Produce semantic HTML/CSS scaffolds for layouts (hero pages, emails, decks)",
	inputSchema: htmlGeneratorWorkflow.inputSchema!,
	outputSchema: htmlGeneratorWorkflow.outputSchema!,
	execute: async ({ context }) => runWorkflow(htmlGeneratorWorkflow, context),
});

export const layoutDesignerTool = createTool({
	id: "layout-designer",
	description:
		"Create detailed layout plans with sections, KPIs, and testing checklist",
	inputSchema: layoutDesignerWorkflow.inputSchema!,
	outputSchema: layoutDesignerWorkflow.outputSchema!,
	execute: async ({ context }) => runWorkflow(layoutDesignerWorkflow, context),
});
