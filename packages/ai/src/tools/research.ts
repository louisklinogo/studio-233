import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { runWorkflow } from "../utils/run-workflow";
import {
	imageAnalyzerWorkflow,
	moodboardWorkflow,
	siteExtractorWorkflow,
	webSearchWorkflow,
} from "../workflows/research";

export const webSearchTool = createTool({
	id: "web-search",
	description: "Perform multi-source creative research queries",
	inputSchema: z.object({
		query: z.string().min(3),
		maxResults: z.number().min(1).max(10).default(5),
	}),
	outputSchema: webSearchWorkflow.outputSchema!,
	execute: async ({ context }) => runWorkflow(webSearchWorkflow, context),
});

export const siteExtractorTool = createTool({
	id: "site-extractor",
	description: "Summarize the textual content of a given webpage",
	inputSchema: z.object({
		url: z.string().url(),
		maxLength: z.number().min(200).max(5000).default(1500),
	}),
	outputSchema: siteExtractorWorkflow.outputSchema!,
	execute: async ({ context }) => runWorkflow(siteExtractorWorkflow, context),
});

export const imageAnalyzerTool = createTool({
	id: "image-analyzer",
	description:
		"Extract luminance, contrast, and dominant colors from inspiration imagery",
	inputSchema: z.object({
		imageUrl: z.string().url(),
	}),
	outputSchema: imageAnalyzerWorkflow.outputSchema!,
	execute: async ({ context }) => runWorkflow(imageAnalyzerWorkflow, context),
});

export const moodboardTool = createTool({
	id: "moodboard-plan",
	description:
		"Summarize research references into a structured creative direction",
	inputSchema: z.object({
		references: z.array(z.string()).min(1),
		goal: z.string().min(5),
		format: z.enum(["markdown", "json"]).default("markdown"),
	}),
	outputSchema: moodboardWorkflow.outputSchema!,
	execute: async ({ context }) => runWorkflow(moodboardWorkflow, context),
});
