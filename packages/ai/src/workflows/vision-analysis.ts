import { createHash } from "node:crypto";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { list } from "@vercel/blob";
import { generateObject, type LanguageModel } from "ai";

import { getEnv } from "../config";
import { GEMINI_FLASH_MODEL, GEMINI_PRO_MODEL } from "../model-config";
import {
	VISION_ANALYSIS_PROMPT,
	VISION_ANALYSIS_QUICK_PROMPT,
} from "../prompts/vision-analysis";
import {
	type VisionAnalysisInput,
	type VisionAnalysisResult,
	visionAnalysisInputSchema,
	visionAnalysisOutputSchema,
} from "../schemas/vision-analysis";
import { uploadImageBufferToBlob } from "../utils/blob-storage";
import { logger } from "../utils/logger";
import { withDevTools } from "../utils/model";
import { withTimeout } from "../utils/timeout";
import {
	getLatestBlobUrl,
	resolveOrCreateSourceSnapshot,
} from "../utils/vision-ops";

const env = getEnv();

export type VisionAnalysisMode = "quick" | "full";

type VisionAnalysisTimeouts = {
	blobListMs: number;
	fetchMs: number;
	geminiMs: number;
	uploadMs: number;
};

const DEFAULT_TIMEOUTS: VisionAnalysisTimeouts = {
	blobListMs: 2_000,
	fetchMs: 3_000,
	geminiMs: 120_000,
	uploadMs: 25_000,
};

const QUICK_TIMEOUTS: VisionAnalysisTimeouts = {
	...DEFAULT_TIMEOUTS,
	geminiMs: 60_000,
};

export type VisionAnalysisWorkflowOptions = {
	mode?: VisionAnalysisMode;
	abortSignal?: AbortSignal;
	timeouts?: Partial<VisionAnalysisTimeouts>;
	logContext?: Record<string, unknown>;
	model?: LanguageModel;
};

async function loadCachedVisionAnalysis(
	imageHash: string,
	options: { timeoutMs: VisionAnalysisTimeouts; abortSignal?: AbortSignal },
): Promise<VisionAnalysisResult | null> {
	// Try deterministic URL first (performance optimization)
	const deterministicPrefix = `vision/metadata/${imageHash}`;
	const deterministicUrl = `https://${env.blobHostname || "2lkalc8atjuztgjx.public.blob.vercel-storage.com"}/${deterministicPrefix}/latest.json`;

	try {
		const response = await withTimeout(
			"vision_analysis.cache_fetch_deterministic",
			2000, // Short timeout for deterministic check
			async (signal) => await fetch(deterministicUrl, { signal }),
			options.abortSignal,
		);
		if (response.ok) {
			const json = await response.json();
			const parsed = visionAnalysisOutputSchema.safeParse(json);
			if (parsed.success) return parsed.data;
		}
	} catch (error) {
		// Fall through to list approach
	}

	try {
		const url = await getLatestBlobUrl(`vision/metadata/${imageHash}/`, {
			timeoutMs: options.timeoutMs.blobListMs,
			abortSignal: options.abortSignal,
		});
		if (!url) return null;

		const response = await withTimeout(
			"vision_analysis.cache_fetch",
			options.timeoutMs.fetchMs,
			async (signal) => await fetch(url, { signal }),
			options.abortSignal,
		);
		if (!response.ok) return null;
		const json = await response.json();
		const parsed = visionAnalysisOutputSchema.safeParse(json);
		if (!parsed.success) return null;
		return parsed.data;
	} catch (error) {
		if (options.abortSignal?.aborted) throw error;
		logger.warn("vision_analysis.cache_lookup_failed", {
			imageHash,
			message: error instanceof Error ? error.message : String(error),
		});
		return null;
	}
}

export async function runVisionAnalysisWorkflow(
	input: VisionAnalysisInput,
	options: VisionAnalysisWorkflowOptions = {},
): Promise<VisionAnalysisResult> {
	const startedAt = Date.now();
	const mode: VisionAnalysisMode = options.mode ?? "full";
	const timeoutDefaults = mode === "quick" ? QUICK_TIMEOUTS : DEFAULT_TIMEOUTS;
	const timeouts: VisionAnalysisTimeouts = {
		...timeoutDefaults,
		...(options.timeouts ?? {}),
	};
	const logContext = {
		mode,
		...(options.logContext ?? {}),
	};

	const imageHash = createHash("md5").update(input.imageUrl).digest("hex");

	logger.info("vision_analysis.start", {
		imageHash,
		imageUrl: input.imageUrl,
		...logContext,
	});

	// --- OPTIMIZATION: Parallel Cache Check and Model Generation ---

	// 1. Start Cache Lookup Promise
	const cachePromise = loadCachedVisionAnalysis(imageHash, {
		timeoutMs: timeouts,
		abortSignal: options.abortSignal,
	}).catch((err) => {
		logger.warn("vision_analysis.cache_error", {
			imageHash,
			message: err.message,
		});
		return null;
	});

	// 2. Start Generation Promise (Don't await snapshot yet)
	const generationPromise = (async (): Promise<VisionAnalysisResult> => {
		const key = env.googleApiKey;
		if (!key) throw new Error("Google API key required for vision analysis");

		// Trigger snapshot in background, don't wait for it to call Gemini
		// Note: Gemini can consume the original URL directly if public
		const analysisImageUrl = input.imageUrl;

		let model: LanguageModel;
		let modelId: string;

		if (options.model) {
			model = options.model;
			modelId = (model as { modelId?: string }).modelId ?? "provided-model";
		} else {
			const google = createGoogleGenerativeAI({ apiKey: key });
			modelId = mode === "quick" ? GEMINI_FLASH_MODEL : GEMINI_PRO_MODEL;
			model = withDevTools(google(modelId));
		}

		const systemPrompt =
			mode === "quick" ? VISION_ANALYSIS_QUICK_PROMPT : VISION_ANALYSIS_PROMPT;

		const result = await withTimeout(
			"vision_analysis.generate_object",
			timeouts.geminiMs,
			async (signal) =>
				await generateObject({
					model,
					schema: visionAnalysisOutputSchema,
					messages: [
						{
							role: "system",
							content: systemPrompt,
						},
						{
							role: "user",
							content: [
								{
									type: "text",
									text: "Analyze this image according to the protocol.",
								},
								{ type: "image", image: new URL(analysisImageUrl) },
							],
						},
					],
					abortSignal: signal,
				} as any),
			options.abortSignal,
		);

		const parsedResult = visionAnalysisOutputSchema.parse(result.object);

		logger.info("vision_analysis.model_complete", {
			imageHash,
			model: modelId,
			durationMs: Date.now() - startedAt,
			...logContext,
		});

		// BACKGROUND: Persistence & Snapshotting (Non-blocking)
		const backgroundTasks = (async () => {
			const jsonBuffer = Buffer.from(JSON.stringify(result.object, null, 2));
			await Promise.allSettled([
				// Persist metadata
				uploadImageBufferToBlob(jsonBuffer, {
					contentType: "application/json",
					prefix: `vision/metadata/${imageHash}`,
					abortSignal: options.abortSignal,
					timeoutMs: timeouts.uploadMs,
				}),
				uploadImageBufferToBlob(jsonBuffer, {
					contentType: "application/json",
					prefix: `vision/metadata/${imageHash}`,
					filename: "latest.json",
					abortSignal: options.abortSignal,
					timeoutMs: timeouts.uploadMs,
				}),
				// Create source snapshot if missing
				resolveOrCreateSourceSnapshot(imageHash, input.imageUrl, {
					timeoutMs: timeouts,
					abortSignal: options.abortSignal,
				}),
			]);
		})();

		// Attach to context if we had one, otherwise just let it run
		if ((globalThis as any).waitUntil) {
			(globalThis as any).waitUntil(backgroundTasks);
		}

		return parsedResult;
	})();

	// 3. The Race/Decision
	try {
		const cached = await cachePromise;
		if (cached) {
			logger.info("vision_analysis.cache_hit", {
				imageHash,
				durationMs: Date.now() - startedAt,
				...logContext,
			});
			return cached;
		}
	} catch (e) {
		// Cache failed, fall through to generation
	}

	return await generationPromise;
}

export const visionAnalysisWorkflow = {
	id: "vision-analysis",
	inputSchema: visionAnalysisInputSchema,
	outputSchema: visionAnalysisOutputSchema,
	run: runVisionAnalysisWorkflow,
};
