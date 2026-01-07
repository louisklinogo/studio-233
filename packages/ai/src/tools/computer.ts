import { Steel } from "steel-sdk";
import { z } from "zod";
import { getEnv } from "../config";
import { logger } from "../utils/logger";
import { createTool } from "./factory";

const env = getEnv();

const VIEWPORT_WIDTH = 1280;
const VIEWPORT_HEIGHT = 800;

/**
 * Normalizes 0-1000 coordinates to viewport pixels
 */
const denormalize = (val: number, max: number) =>
	Math.round((val / 1000) * max);

async function getSteelClient(runtimeContext?: any) {
	const apiKey = runtimeContext?.steelApiKey || env.steelApiKey;
	if (!apiKey) {
		throw new Error("Steel API key is required for computer tools");
	}
	return new Steel({ steelAPIKey: apiKey });
}

async function ensureSession(steel: Steel, runtimeContext?: any) {
	// If we already have an active session ID in this turn, reuse it to avoid creating 10 browsers
	if (runtimeContext?._activeSessionId) {
		return {
			sessionId: runtimeContext._activeSessionId,
			viewerUrl: runtimeContext._activeViewerUrl,
		};
	}

	// Create a new session
	const session = await steel.sessions.create({
		dimensions: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
		solveCaptcha: true,
		blockAds: true,
		profileId: runtimeContext?.sessionId || undefined,
	});

	// Store the session ID and viewer URL in the runtime context for subsequent tool calls in this turn
	if (runtimeContext) {
		runtimeContext._activeSessionId = session.id;
		runtimeContext._activeViewerUrl = session.sessionViewerUrl;
	}

	logger.info("computer.tool.session_created", {
		sessionId: session.id,
		contextId: runtimeContext?.sessionId,
		viewerUrl: session.sessionViewerUrl,
	});

	return { sessionId: session.id, viewerUrl: session.sessionViewerUrl };
}

export const computerNavigateTool = createTool({
	id: "computerNavigate",
	description: "Navigate the browser to a specific URL.",
	inputSchema: z.object({
		url: z.string().url().describe("The URL to visit"),
	}),
	execute: async ({ context, runtimeContext }) => {
		const steel = await getSteelClient(runtimeContext);
		const { sessionId, viewerUrl } = await ensureSession(steel, runtimeContext);

		// Simulate human navigation: Ctrl+L -> Type URL -> Enter
		await steel.sessions.computer(sessionId, {
			action: "press_key",
			keys: ["Control", "l"],
		});
		await steel.sessions.computer(sessionId, {
			action: "type_text",
			text: context.url,
		});
		await steel.sessions.computer(sessionId, {
			action: "press_key",
			keys: ["Enter"],
		});

		// Wait 2s for initial load/redirects to initiate
		await steel.sessions.computer(sessionId, {
			action: "wait",
			duration: 2,
		});

		return {
			success: true,
			url: context.url,
			sessionId,
			sessionViewerUrl: viewerUrl,
		};
	},
});

export const computerClickTool = createTool({
	id: "computerClick",
	description: "Click at specific normalized coordinates (0-1000).",
	inputSchema: z.object({
		x: z.number().min(0).max(1000).describe("X coordinate (0-1000)"),
		y: z.number().min(0).max(1000).describe("Y coordinate (0-1000)"),
	}),
	execute: async ({ context, runtimeContext }) => {
		const steel = await getSteelClient(runtimeContext);
		const { sessionId, viewerUrl } = await ensureSession(steel, runtimeContext);

		await steel.sessions.computer(sessionId, {
			action: "click_mouse",
			button: "left",
			coordinates: [
				denormalize(context.x, VIEWPORT_WIDTH),
				denormalize(context.y, VIEWPORT_HEIGHT),
			],
		});

		return { success: true, sessionId, sessionViewerUrl: viewerUrl };
	},
});

export const computerTypeTool = createTool({
	id: "computerType",
	description: "Type text at current focus or specific coordinates.",
	inputSchema: z.object({
		text: z.string().describe("The text to type"),
		x: z
			.number()
			.min(0)
			.max(1000)
			.optional()
			.describe("Optional X coordinate to click before typing"),
		y: z
			.number()
			.min(0)
			.max(1000)
			.optional()
			.describe("Optional Y coordinate to click before typing"),
		submit: z
			.boolean()
			.default(true)
			.describe("Whether to press Enter after typing"),
	}),
	execute: async ({ context, runtimeContext }) => {
		const steel = await getSteelClient(runtimeContext);
		const { sessionId, viewerUrl } = await ensureSession(steel, runtimeContext);

		if (context.x !== undefined && context.y !== undefined) {
			await steel.sessions.computer(sessionId, {
				action: "click_mouse",
				button: "left",
				coordinates: [
					denormalize(context.x, VIEWPORT_WIDTH),
					denormalize(context.y, VIEWPORT_HEIGHT),
				],
			});
		}

		// Clear field (standard computer use practice)
		await steel.sessions.computer(sessionId, {
			action: "press_key",
			keys: ["Control", "a"],
		});
		await steel.sessions.computer(sessionId, {
			action: "press_key",
			keys: ["Backspace"],
		});

		await steel.sessions.computer(sessionId, {
			action: "type_text",
			text: context.text,
		});

		if (context.submit) {
			await steel.sessions.computer(sessionId, {
				action: "press_key",
				keys: ["Enter"],
			});
		}

		return { success: true, sessionId, sessionViewerUrl: viewerUrl };
	},
});

export const computerScrollTool = createTool({
	id: "computerScroll",
	description: "Scroll the page in a direction.",
	inputSchema: z.object({
		direction: z.enum(["up", "down", "left", "right"]),
		amount: z.number().optional().default(500),
	}),
	execute: async ({ context, runtimeContext }) => {
		const steel = await getSteelClient(runtimeContext);
		const { sessionId, viewerUrl } = await ensureSession(steel, runtimeContext);

		const deltaX =
			context.direction === "left"
				? -context.amount
				: context.direction === "right"
					? context.amount
					: 0;
		const deltaY =
			context.direction === "up"
				? -context.amount
				: context.direction === "down"
					? context.amount
					: 0;

		await steel.sessions.computer(sessionId, {
			action: "scroll",
			coordinates: [VIEWPORT_WIDTH / 2, VIEWPORT_HEIGHT / 2],
			delta_x: deltaX,
			delta_y: deltaY,
		});

		return { success: true, sessionId, sessionViewerUrl: viewerUrl };
	},
});

export const computerScreenshotTool = createTool({
	id: "computerScreenshot",
	description: "Capture the current screen state as an image.",
	inputSchema: z.object({}),
	execute: async ({ runtimeContext }) => {
		const steel = await getSteelClient(runtimeContext);
		const { sessionId, viewerUrl } = await ensureSession(steel, runtimeContext);

		const resp = await steel.sessions.computer(sessionId, {
			action: "take_screenshot",
		});

		return {
			success: true,
			sessionId,
			sessionViewerUrl: viewerUrl,
			screenshotUrl: `data:image/png;base64,${resp.base64_image}`,
			info: "Screenshot captured successfully",
		};
	},
});

export const computerWaitTool = createTool({
	id: "computerWait",
	description: "Wait for a duration of time.",
	inputSchema: z.object({
		seconds: z.number().min(1).max(10).default(2),
	}),
	execute: async ({ context, runtimeContext }) => {
		const steel = await getSteelClient(runtimeContext);
		const { sessionId, viewerUrl } = await ensureSession(steel, runtimeContext);

		await steel.sessions.computer(sessionId, {
			action: "wait",
			duration: context.seconds,
		});

		return { success: true, sessionId, sessionViewerUrl: viewerUrl };
	},
});
