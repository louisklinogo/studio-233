import { z } from "zod";
import type {
	imageAnalyzerWorkflow,
	moodboardWorkflow,
	siteExtractorWorkflow,
	webSearchWorkflow,
} from "../workflows/research";
import { createTool } from "./factory";

export const webSearchTool = createTool({
	id: "webSearch",
	description: "Perform multi-source creative research queries",
	inputSchema: z.preprocess(
		(val: any) => {
			if (val && typeof val === "object" && Array.isArray(val.queries)) {
				return {
					...val,
					query: val.queries.join("\n"),
				};
			}
			return val;
		},
		z.object({
			query: z.string().min(3),
			maxResults: z.number().min(1).max(10).default(5),
		}),
	),
	execute: async ({ context }) => {
		const { webSearchWorkflow } = await import("../workflows/research");
		return webSearchWorkflow.run(context);
	},
});

export const siteExtractorTool = createTool({
	id: "siteExtractor",
	description: "Summarize the textual content of a given webpage",
	inputSchema: z.preprocess(
		(val: any) => {
			if (typeof val === "string") return { url: val };
			if (val && typeof val === "object") {
				return {
					...val,
					url:
						val.url ||
						val.link ||
						val.href ||
						(typeof val.context === "string" ? val.context : undefined),
				};
			}
			return val;
		},
		z.object({
			url: z.string().url(),
			maxLength: z.number().min(200).max(5000).default(1500),
		}),
	),
	execute: async ({ context }) => {
		const { siteExtractorWorkflow } = await import("../workflows/research");
		return siteExtractorWorkflow.run(context);
	},
});

export const imageAnalyzerTool = createTool({
	id: "imageAnalyzer",
	description:
		"Extract luminance, contrast, and dominant colors from inspiration imagery",
	inputSchema: z.preprocess(
		(val: any) => {
			if (typeof val === "string") return { imageUrl: val };
			if (val && typeof val === "object") {
				return {
					...val,
					imageUrl: val.imageUrl || val.url || val.src || val.image,
				};
			}
			return val;
		},
		z.object({
			imageUrl: z.string().url(),
		}),
	),
	execute: async ({ context }) => {
		const { imageAnalyzerWorkflow } = await import("../workflows/research");
		return imageAnalyzerWorkflow.run(context);
	},
});

export const moodboardTool = createTool({
	id: "moodboard",
	description:
		"Summarize research references into a structured creative direction",
	inputSchema: z.preprocess(
		(val: any) => {
			if (!val || typeof val !== "object") return val;

			const result = { ...val };

			// Resiliency: Map 'title' or 'description' to 'goal' if missing
			if (!result.goal) {
				result.goal =
					result.title || result.description || "Synthesize creative direction";
			}

			// Resiliency: Handle objects in references array
			if (Array.isArray(result.references)) {
				result.references = result.references.map((ref: any) => {
					if (typeof ref === "object" && ref !== null) {
						// Flatten object to string: "Title: Description" or just "Description"
						return `${ref.title ? `${ref.title}: ` : ""}${ref.description || ref.text || ref.content || JSON.stringify(ref)}`;
					}
					return String(ref);
				});
			} else if (typeof result.references === "string") {
				result.references = [result.references];
			}

			return result;
		},
		z.object({
			references: z.array(z.string()).min(1),
			goal: z.string().min(5),
			format: z.enum(["markdown", "json"]).default("markdown"),
		}),
	),
	execute: async ({ context }) => {
		const { moodboardWorkflow } = await import("../workflows/research");
		return moodboardWorkflow.run(context);
	},
});
