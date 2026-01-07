import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import sharp from "sharp";
import { z } from "zod";

import { getEnv } from "../config";
import { GEMINI_FLASH_MODEL } from "../model-config";
import { withDevTools } from "../utils/model";

const env = getEnv();

async function fetchJson(url: string) {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			return {
				error: `Request failed: ${response.status}`,
				status: response.status,
			};
		}

		const contentType = response.headers.get("content-type");
		if (!contentType || !contentType.includes("application/json")) {
			return { error: "Response was not JSON", contentType };
		}

		return await response.json();
	} catch (err) {
		return { error: err instanceof Error ? err.message : String(err) };
	}
}

export const webSearchInputSchema = z.object({
	query: z.string().min(3),
	maxResults: z.number().min(1).max(10).default(5),
});

export const webSearchOutputSchema = z.object({
	results: z.array(
		z.object({
			title: z.string(),
			snippet: z.string(),
			url: z.string().url(),
		}),
	),
	provider: z.string(),
	error: z.string().optional(),
});

export type WebSearchInput = z.infer<typeof webSearchInputSchema>;
export type WebSearchResult = z.infer<typeof webSearchOutputSchema>;

export async function runWebSearchWorkflow(
	input: WebSearchInput,
): Promise<WebSearchResult> {
	const { query, maxResults } = input;

	try {
		if (env.exaApiKey) {
			const response = await fetch(env.exaBaseUrl!, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-api-key": env.exaApiKey,
				},
				body: JSON.stringify({
					query,
					numResults: maxResults,
					excludeDomains: ["exa.ai"],
				}),
			});

			if (response.ok) {
				const data = await response.json();
				const hits = data.results ?? data.data ?? [];
				const results = hits.slice(0, maxResults).map((item: any) => ({
					title:
						item.title ??
						item.document?.title ??
						item.metadata?.title ??
						"Untitled",
					snippet:
						item.text ??
						item.snippet ??
						item.summary ??
						item.document?.text ??
						"",
					url:
						item.url ?? item.link ?? item.source?.url ?? "https://example.com",
				}));
				return { results, provider: "exa" };
			}
		}

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

			if (response.ok) {
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
		}

		const ddgResult = await fetchJson(
			`https://duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&pretty=1`,
		);

		if (!ddgResult.error) {
			const related = ddgResult.RelatedTopics ?? [];
			const results = related.slice(0, maxResults).map((topic: any) => ({
				title: topic.Text ?? "Untitled",
				snippet: topic.FirstURL ?? "",
				url: topic.FirstURL ?? "https://duckduckgo.com",
			}));
			return { results, provider: "duckduckgo" };
		}

		return {
			results: [],
			provider: "none",
			error: "All search providers failed or returned empty results",
		};
	} catch (err) {
		console.error("runWebSearchWorkflow failed:", err);
		return {
			results: [],
			provider: "error",
			error: err instanceof Error ? err.message : String(err),
		};
	}
}

export const webSearchWorkflow = {
	id: "web-search",
	inputSchema: webSearchInputSchema,
	outputSchema: webSearchOutputSchema,
	run: runWebSearchWorkflow,
};

export const siteExtractorInputSchema = z.object({
	url: z.string().url(),
	maxLength: z.number().min(200).max(5000).default(1500),
});

export const siteExtractorOutputSchema = z.object({
	content: z.string(),
	url: z.string().url(),
});

export type SiteExtractorInput = z.infer<typeof siteExtractorInputSchema>;
export type SiteExtractorResult = z.infer<typeof siteExtractorOutputSchema>;

export async function runSiteExtractorWorkflow(
	input: SiteExtractorInput,
): Promise<SiteExtractorResult> {
	const response = await fetch(input.url);
	if (!response.ok) {
		throw new Error(`Failed to fetch ${input.url}`);
	}
	const html = await response.text();
	const content = html
		.replace(/<script[\s\S]*?<\/script>/gi, "")
		.replace(/<style[\s\S]*?<\/style>/gi, "")
		.replace(/<[^>]+>/g, " ")
		.replace(/\s+/g, " ")
		.trim()
		.slice(0, input.maxLength);
	return { content, url: input.url };
}

export const siteExtractorWorkflow = {
	id: "site-extractor",
	inputSchema: siteExtractorInputSchema,
	outputSchema: siteExtractorOutputSchema,
	run: runSiteExtractorWorkflow,
};

export const imageAnalyzerInputSchema = z.object({
	imageUrl: z.string().url(),
});

export const imageAnalyzerOutputSchema = z.object({
	averageLuminance: z.number(),
	contrast: z.number(),
	dominant: z.array(z.string()),
});

export type ImageAnalyzerInput = z.infer<typeof imageAnalyzerInputSchema>;
export type ImageAnalyzerResult = z.infer<typeof imageAnalyzerOutputSchema>;

export async function runImageAnalyzerWorkflow(
	input: ImageAnalyzerInput,
): Promise<ImageAnalyzerResult> {
	const response = await fetch(input.imageUrl);
	if (!response.ok) throw new Error("Unable to download image");
	const buffer = Buffer.from(await response.arrayBuffer());
	const image = sharp(buffer).resize(128, 128, { fit: "inside" }).ensureAlpha();
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
}

export const imageAnalyzerWorkflow = {
	id: "image-analyzer",
	inputSchema: imageAnalyzerInputSchema,
	outputSchema: imageAnalyzerOutputSchema,
	run: runImageAnalyzerWorkflow,
};

export const moodboardInputSchema = z.object({
	references: z.array(z.string()).min(1),
	goal: z.string().min(5),
	format: z.enum(["markdown", "json"]).default("markdown"),
});

export const moodboardOutputSchema = z.object({
	plan: z.string(),
	format: z.enum(["markdown", "json"]),
});

export type MoodboardInput = z.infer<typeof moodboardInputSchema>;
export type MoodboardResult = z.infer<typeof moodboardOutputSchema>;

export async function runMoodboardWorkflow(
	input: MoodboardInput,
): Promise<MoodboardResult> {
	const key = env.googleApiKey;
	if (!key) {
		throw new Error("Google API key required for moodboard synthesis");
	}

	if (!input.references.length) {
		throw new Error(
			"Moodboard requires at least one visual or textual reference.",
		);
	}

	const google = createGoogleGenerativeAI({ apiKey: key });
	const model = withDevTools(google(GEMINI_FLASH_MODEL));
	const formatInstruction =
		input.format === "json"
			? "Return EXCLUSIVELY a JSON object with keys: heroPalette (array of hex), typography (font-family recommendations), layout (structural advice), and creativeCore (thematic summary)."
			: "Return a structured markdown brief with the following headers: ### Palette, ### Layout & Structure, ### Visual Motifs, and ### Executive Summary.";

	const referencesList = input.references
		.map((r, i) => `Ref ${i + 1}: ${r}`)
		.join("\n");
	const prompt =
		`You are a world-class creative director at a high-end design studio. 
	Your goal is to synthesize the following research references into a cohesive and professional creative direction that aligns perfectly with the user's specific objectives.
	
	GOAL: ${input.goal}
	
	REFERENCES:
	${referencesList}
	
	${formatInstruction}
	
	Avoid generic advice. Provide specific, actionable design insights derived strictly from the provided goal and references.`.trim();

	const response = await generateText({ model, prompt });
	return { plan: response.text, format: input.format };
}

export const moodboardWorkflow = {
	id: "moodboard",
	inputSchema: moodboardInputSchema,
	outputSchema: moodboardOutputSchema,
	run: runMoodboardWorkflow,
};
