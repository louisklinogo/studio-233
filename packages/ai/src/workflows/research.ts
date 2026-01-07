import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { type Browser, chromium } from "playwright-core";
import sharp from "sharp";
import { Steel } from "steel-sdk";
import { z } from "zod";

import { getEnv } from "../config";
import { GEMINI_FLASH_MODEL } from "../model-config";
import { uploadImageBufferToBlob } from "../utils/blob-storage";
import { logger } from "../utils/logger";
import { withDevTools } from "../utils/model";

const env = getEnv();

// Initialize Steel client
const steel = env.steelApiKey
	? new Steel({ steelAPIKey: env.steelApiKey })
	: null;

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

export const pixelDataExtractorInputSchema = z.object({
	imageUrl: z.string().url(),
});

export const pixelDataExtractorOutputSchema = z.object({
	averageLuminance: z.number(),
	contrast: z.number(),
	dominant: z.array(z.string()),
});

export type PixelDataExtractorInput = z.infer<
	typeof pixelDataExtractorInputSchema
>;
export type PixelDataExtractorResult = z.infer<
	typeof pixelDataExtractorOutputSchema
>;

export async function runPixelDataExtractorWorkflow(
	input: PixelDataExtractorInput,
): Promise<PixelDataExtractorResult> {
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

export const pixelDataExtractorWorkflow = {
	id: "pixel-data-extractor",
	inputSchema: pixelDataExtractorInputSchema,
	outputSchema: pixelDataExtractorOutputSchema,
	run: runPixelDataExtractorWorkflow,
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

export const browserAuditInputSchema = z.object({
	url: z.string().url(),
	task: z.string().min(5),
	maxWaitMs: z.number().optional().default(10000),
});

export const browserAuditOutputSchema = z.object({
	analysis: z.string(),
	screenshotUrl: z.string().url().optional(),
	metadata: z.record(z.string(), z.any()),
});

export type BrowserAuditInput = z.infer<typeof browserAuditInputSchema> & {
	action?: "navigate" | "click" | "type" | "scroll" | "wait";
	x?: number;
	y?: number;
	text?: string;
	pressEnter?: boolean;
	direction?: "up" | "down" | "left" | "right";
	magnitude?: number;
	seconds?: number;
	sessionId?: string; // Stateful session ID
};

export type BrowserAuditResult = z.infer<typeof browserAuditOutputSchema>;

const VIEWPORT_WIDTH = 1280;
const VIEWPORT_HEIGHT = 800;

async function createSession() {
	if (steel && env.steelApiKey) {
		const session = await steel.sessions.create({
			dimensions: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
			solveCaptcha: true,
			blockAds: true,
		});
		logger.info("research.browser.session_created", {
			sessionId: session.id,
			viewerUrl: session.sessionViewerUrl,
		});
		return session.id;
	}
	return null;
}

async function connectToSession(sessionId: string | null) {
	if (sessionId && steel && env.steelApiKey) {
		return await chromium.connectOverCDP(
			`wss://connect.steel.dev?apiKey=${env.steelApiKey}&sessionId=${sessionId}`,
		);
	}

	// Local fallback for dev/production without Steel
	if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
		const { default: chromiumMin } = await import("@sparticuz/chromium-min");
		const executablePath = await chromiumMin.executablePath();
		return await chromium.launch({
			executablePath,
			args: chromiumMin.args,
			headless: true,
		});
	}

	return await chromium.launch({ headless: true });
}

export async function runBrowserAuditWorkflow(
	input: BrowserAuditInput,
): Promise<BrowserAuditResult> {
	const { url, task, maxWaitMs, action = "navigate" } = input;

	const denormalize = (val: number, max: number) =>
		Math.round((val / 1000) * max);

	let browser: Browser | null = null;
	// 1. Resolve Session ID (Stateful)
	let sessionId = input.sessionId || null;

	try {
		// If no session provided and we are in a mode that supports it, create one.
		// Note: Local/Puppeteer fallback doesn't really support persistent IDs easily
		// in this stateless lambda architecture without an external store,
		// but Steel does via the API.
		if (!sessionId && steel) {
			sessionId = await createSession();
		}

		// 2. Connect
		browser = await connectToSession(sessionId);

		// Use existing context if connecting over CDP, otherwise create new
		const context =
			browser.contexts().length > 0
				? browser.contexts()[0]
				: await browser.newContext({
						viewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
						userAgent:
							"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Studio233/Agent",
					});

		const page =
			context.pages().length > 0 ? context.pages()[0] : await context.newPage();

		// 3. Execute Action
		if (action === "navigate" && url) {
			await page.goto(url, {
				waitUntil: "networkidle",
				timeout: maxWaitMs || 15000,
			});
		} else if (
			action === "click" &&
			input.x !== undefined &&
			input.y !== undefined
		) {
			await page.mouse.click(
				denormalize(input.x, VIEWPORT_WIDTH),
				denormalize(input.y, VIEWPORT_HEIGHT),
			);
		} else if (
			action === "type" &&
			input.x !== undefined &&
			input.y !== undefined &&
			input.text
		) {
			const tx = denormalize(input.x, VIEWPORT_WIDTH);
			const ty = denormalize(input.y, VIEWPORT_HEIGHT);
			await page.mouse.click(tx, ty);
			await page.keyboard.type(input.text);
			if (input.pressEnter) await page.keyboard.press("Enter");
		} else if (action === "scroll") {
			const mag = input.magnitude || 500;
			if (input.direction === "down") await page.mouse.wheel(0, mag);
			else if (input.direction === "up") await page.mouse.wheel(0, -mag);
			else if (input.direction === "right") await page.mouse.wheel(mag, 0);
			else if (input.direction === "left") await page.mouse.wheel(-mag, 0);
		} else if (action === "wait") {
			await new Promise((r) => setTimeout(r, (input.seconds || 2) * 1000));
		}

		// 4. Capture State
		const currentUrl = page.url();
		const pageTitle = await page.title();
		const innerText = await page.evaluate(() =>
			document.body.innerText.slice(0, 10000),
		);
		const screenshot = await page.screenshot({ type: "png", fullPage: false });

		// 5. Analysis via LLM
		const google = createGoogleGenerativeAI({ apiKey: env.googleApiKey! });
		const model = withDevTools(google(GEMINI_FLASH_MODEL));

		const { text: analysis } = await generateText({
			model,
			prompt:
				`You are a design auditor. Current site: ${currentUrl} ("${pageTitle}").
			Action performed: ${action} ${task || ""}.
			
			PAGE CONTENT:
			${innerText}
			
			Identify key visual elements, motifs, or data found after this step.`.trim(),
		});

		const screenshotUrl = await uploadImageBufferToBlob(screenshot, {
			contentType: "image/png",
			prefix: "research/audit",
		});

		// 6. Return Result with Session ID for Persistence
		return {
			analysis,
			screenshotUrl,
			metadata: {
				title: pageTitle,
				url: currentUrl,
				action,
				sessionId, // IMPORTANT: Return this so the agent can save it
				auditedAt: new Date().toISOString(),
			},
		};
	} finally {
		// IMPORTANT: Do NOT close the browser/session if we are in Steel mode.
		// We want it to persist for the next step.
		// Only close if it's a local fallback or if explicitly requested (TODO: add close action)
		if (browser && !steel) {
			await browser.close();
		} else if (browser && steel) {
			// For Steel, we just disconnect the CDP client, but leave the session running.
			await browser.close();
		}
	}
}

export const browserAuditWorkflow = {
	id: "browser-audit",
	inputSchema: browserAuditInputSchema,
	outputSchema: browserAuditOutputSchema,
	run: runBrowserAuditWorkflow,
};
