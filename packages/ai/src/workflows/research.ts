import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createStep, createWorkflow } from "@mastra/core/workflows";
import { generateText } from "ai";
import sharp from "sharp";
import { z } from "zod";

import { getEnv } from "../config";

const env = getEnv();

async function fetchJson(url: string) {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Request failed: ${response.status}`);
	}
	return response.json();
}

const webSearchStep = createStep({
	id: "web-search",
	inputSchema: z.object({
		query: z.string().min(3),
		maxResults: z.number().min(1).max(10).default(5),
	}),
	outputSchema: z.object({
		results: z.array(
			z.object({
				title: z.string(),
				snippet: z.string(),
				url: z.string().url(),
			}),
		),
		provider: z.string(),
	}),
	execute: async ({ inputData }) => {
		const { query, maxResults } = inputData;
		if (env.searchApiKey) {
			const response = await fetch(env.tavilyBaseUrl!, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${env.searchApiKey}`,
				},
				body: JSON.stringify({
					query,
					search_depth: "advanced",
					max_results: maxResults,
				}),
			});
			if (!response.ok) {
				throw new Error(`Search provider error: ${response.status}`);
			}
			const data = await response.json();
			const results = (data.results ?? [])
				.slice(0, maxResults)
				.map((item: any) => ({
					title: item.title ?? "Untitled",
					snippet: item.content ?? item.snippet ?? "",
					url: item.url ?? item.href ?? "https://example.com",
				}));
			return { results, provider: "tavily" };
		}

		const ddg = await fetchJson(
			`https://duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&pretty=1`,
		);
		const related = ddg.RelatedTopics ?? [];
		const results = related.slice(0, maxResults).map((topic: any) => ({
			title: topic.Text ?? "Untitled",
			snippet: topic.FirstURL ?? "",
			url: topic.FirstURL ?? "https://duckduckgo.com",
		}));
		return { results, provider: "duckduckgo" };
	},
});

export const webSearchWorkflow = createWorkflow({
	id: "web-search",
	inputSchema: webSearchStep.inputSchema,
	outputSchema: webSearchStep.outputSchema,
})
	.then(webSearchStep)
	.commit();

const siteExtractorStep = createStep({
	id: "site-extractor",
	inputSchema: z.object({
		url: z.string().url(),
		maxLength: z.number().min(200).max(5000).default(1500),
	}),
	outputSchema: z.object({
		content: z.string(),
		url: z.string().url(),
	}),
	execute: async ({ inputData }) => {
		const response = await fetch(inputData.url);
		if (!response.ok) {
			throw new Error(`Failed to fetch ${inputData.url}`);
		}
		const html = await response.text();
		const content = html
			.replace(/<script[\s\S]*?<\/script>/gi, "")
			.replace(/<style[\s\S]*?<\/style>/gi, "")
			.replace(/<[^>]+>/g, " ")
			.replace(/\s+/g, " ")
			.trim()
			.slice(0, inputData.maxLength);
		return { content, url: inputData.url };
	},
});

export const siteExtractorWorkflow = createWorkflow({
	id: "site-extractor",
	inputSchema: siteExtractorStep.inputSchema,
	outputSchema: siteExtractorStep.outputSchema,
})
	.then(siteExtractorStep)
	.commit();

const imageAnalyzerStep = createStep({
	id: "image-analyzer",
	inputSchema: z.object({
		imageUrl: z.string().url(),
	}),
	outputSchema: z.object({
		averageLuminance: z.number(),
		contrast: z.number(),
		dominant: z.array(z.string()),
	}),
	execute: async ({ inputData }) => {
		const response = await fetch(inputData.imageUrl);
		if (!response.ok) throw new Error("Unable to download image");
		const buffer = Buffer.from(await response.arrayBuffer());
		const image = sharp(buffer)
			.resize(128, 128, { fit: "inside" })
			.ensureAlpha();
		const { data } = await image.raw().toBuffer({ resolveWithObject: true });
		let luminanceSum = 0;
		let contrastSum = 0;
		const colors: string[] = [];
		for (let i = 0; i < data.length; i += 4) {
			const r = data[i];
			const g = data[i + 1];
			const b = data[i + 2];
			const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
			luminanceSum += luminance;
			contrastSum += Math.abs(r - g) + Math.abs(g - b);
			if (i % 64 === 0) {
				const hex = `#${[r, g, b]
					.map((value) => value.toString(16).padStart(2, "0"))
					.join("")}`;
				colors.push(hex);
			}
		}
		const pixels = data.length / 4;
		return {
			averageLuminance: Number((luminanceSum / pixels).toFixed(2)),
			contrast: Number((contrastSum / pixels).toFixed(2)),
			dominant: Array.from(new Set(colors)).slice(0, 6),
		};
	},
});

export const imageAnalyzerWorkflow = createWorkflow({
	id: "image-analyzer",
	inputSchema: imageAnalyzerStep.inputSchema,
	outputSchema: imageAnalyzerStep.outputSchema,
})
	.then(imageAnalyzerStep)
	.commit();

const moodboardStep = createStep({
	id: "moodboard-step",
	inputSchema: z.object({
		references: z.array(z.string()).min(1),
		goal: z.string().min(5),
		format: z.enum(["markdown", "json"]).default("markdown"),
	}),
	outputSchema: z.object({
		plan: z.string(),
		format: z.enum(["markdown", "json"]),
	}),
	execute: async ({ inputData }) => {
		const key = env.googleApiKey;
		if (!key) {
			throw new Error("Google API key required for moodboard synthesis");
		}
		const google = createGoogleGenerativeAI({ apiKey: key });
		const model = google("gemini-2.5-pro");
		const formatInstruction =
			inputData.format === "json"
				? "Return JSON with keys heroPalette, typography, layout, callouts"
				: "Return markdown sections for Palette, Layout, Motifs, Risks";
		const referencesList = inputData.references.join(", ");
		const prompt = `You are a creative director. Using these references ${referencesList} craft a moodboard plan for ${inputData.goal}. ${formatInstruction}.`;
		const response = await generateText({ model, prompt });
		return { plan: response.text, format: inputData.format };
	},
});

export const moodboardWorkflow = createWorkflow({
	id: "moodboard",
	inputSchema: moodboardStep.inputSchema,
	outputSchema: moodboardStep.outputSchema,
})
	.then(moodboardStep)
	.commit();
