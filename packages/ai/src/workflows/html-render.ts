import chromiumMin from "@sparticuz/chromium-min";
import { type Browser, chromium, type Page } from "playwright-core";
import sharp from "sharp";
import { Steel } from "steel-sdk";
import { z } from "zod";

import { getEnv } from "../config";
import { uploadImageBufferToBlob } from "../utils/blob-storage";
import { logger } from "../utils/logger";

const env = getEnv();
const steel = env.steelApiKey
	? new Steel({ steelAPIKey: env.steelApiKey })
	: null;

const MAX_HTML_LENGTH = 50_000;
const MAX_CSS_LENGTH = 50_000;
const RENDER_TIMEOUT_MS = 30_000;
const RENDER_LOG_PREFIX = "html-render";

const htmlRenderInputSchema = z.object({
	html: z.string().min(1),
	css: z.string().optional(),
	width: z.number().int().min(320).max(1920).default(1200),
	height: z.number().int().min(320).max(2400).default(1600),
	scale: z.number().min(1).max(2).default(1),
	background: z.string().optional(),
});

const htmlRenderOutputSchema = z.object({
	imageUrl: z.string().url(),
	width: z.number(),
	height: z.number(),
	bytes: z.number().optional(),
});

export type HtmlRenderInput = z.infer<typeof htmlRenderInputSchema>;
export type HtmlRenderResult = z.infer<typeof htmlRenderOutputSchema>;

let browser: Browser | null = null;
let currentSessionId: string | null = null;

async function getBrowser() {
	if (browser) return browser;

	// Senior Architecture: Hybrid Browser Discovery
	if (steel && env.steelApiKey) {
		logger.info(`${RENDER_LOG_PREFIX}.connecting_cloud`, {
			provider: "steel.dev",
		});

		const session = await steel.sessions.create({
			dimensions: { width: 1280, height: 800 },
			blockAds: true,
		});

		currentSessionId = session.id;
		browser = await chromium.connectOverCDP(
			`wss://connect.steel.dev?apiKey=${env.steelApiKey}&sessionId=${currentSessionId}`,
		);
		return browser;
	}

	const isProduction =
		process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

	if (isProduction) {
		// Fallback to sparticuz (requires local binaries or hosted .br files)
		const executablePath = await chromiumMin.executablePath();

		browser = await chromium.launch({
			args: chromiumMin.args,
			executablePath,
			headless: true,
		});
	} else {
		// Dev mode: requires 'npx playwright install chromium'
		browser = await chromium.launch({ headless: true });
	}

	return browser;
}

function buildHtmlDocument({ html, css, background }: HtmlRenderInput) {
	const style = css
		? `<style>html,body{margin:0;padding:0;}${css}</style>`
		: "";
	const bg = background ? `style="background:${background};"` : "";
	return `<!DOCTYPE html><html><head><meta charset="utf-8">${style}</head><body ${bg}>${html}</body></html>`;
}

function sanitizeMarkup(value: string, maxLength: number) {
	const trimmed = value.slice(0, maxLength);
	// Strip script tags; this is a minimal guard. CSP + blocked network requests also help.
	return trimmed.replace(/<script[\s\S]*?<\/script>/gi, "");
}

export async function runHtmlRenderWorkflow(
	input: HtmlRenderInput,
): Promise<HtmlRenderResult> {
	const { html, css, width, height, scale, background } =
		htmlRenderInputSchema.parse(input);

	const safeHtml = sanitizeMarkup(html, MAX_HTML_LENGTH);
	const safeCss = css ? sanitizeMarkup(css, MAX_CSS_LENGTH) : undefined;

	const doc = buildHtmlDocument({
		html: safeHtml,
		css: safeCss,
		width,
		height,
		scale,
		background,
	});
	const pageHtml = `data:text/html;base64,${Buffer.from(doc, "utf8").toString("base64")}`;

	const browserInstance = await getBrowser();

	// Ensure we use the correct context
	const context =
		browserInstance.contexts().length > 0
			? browserInstance.contexts()[0]
			: await browserInstance.newContext({
					viewport: { width, height },
					deviceScaleFactor: scale,
				});

	const page: Page =
		context.pages().length > 0 ? context.pages()[0] : await context.newPage();

	try {
		const startedAt = Date.now();

		// Only set up routing if not connected over CDP (CDP sessions are fresh)
		if (!currentSessionId) {
			// Block non-document requests to avoid external fetches.
			await page.route("**/*", (route) => {
				const type = route.request().resourceType();
				if (type === "document") return route.continue();
				return route.abort();
			});
		}

		await page.goto(pageHtml, {
			waitUntil: "load",
			timeout: RENDER_TIMEOUT_MS,
		});
		const screenshot = await page.screenshot({ fullPage: true, type: "png" });
		const meta = await sharp(screenshot).metadata();
		const imageUrl = await uploadImageBufferToBlob(screenshot, {
			contentType: "image/png",
			prefix: "html-render",
		});

		const durationMs = Date.now() - startedAt;
		logger.info(`${RENDER_LOG_PREFIX}.success`, {
			durationMs,
			width: meta.width ?? width,
			height: meta.height ?? height,
			bytes: screenshot.byteLength,
			viewport: { width, height, scale },
			background: !!background,
		});

		return {
			imageUrl,
			width: meta.width ?? width,
			height: meta.height ?? height,
			bytes: screenshot.byteLength,
		};
	} finally {
		// Close page but keep browser/session for next render if it's a singleton?
		// Actually, serverless usually wants fresh runs.
		await page.close();

		if (currentSessionId && steel) {
			await browserInstance.close();
			await steel.sessions.release(currentSessionId);
			browser = null;
			currentSessionId = null;
		}
	}
}

export const htmlRenderWorkflow = {
	id: "html-render",
	inputSchema: htmlRenderInputSchema,
	outputSchema: htmlRenderOutputSchema,
	run: runHtmlRenderWorkflow,
};
