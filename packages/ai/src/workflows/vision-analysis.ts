import { createGoogleGenerativeAI } from "@ai-sdk/google";
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
import { computeSHA256 } from "../utils/hashing";
import { robustFetch } from "../utils/http";
import { logger } from "../utils/logger";
import { withDevTools } from "../utils/model";
import { withTimeout } from "../utils/timeout";
import { getLatestBlobUrl } from "../utils/vision-ops";

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
	fetchMs: 20_000, // Increased for robust fetch
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
	onResult?: (
		result: VisionAnalysisResult,
		imageHash: string,
	) => Promise<void> | void;
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

	// 1. Download & Hash Phase (Pre-computation)
	let imageBuffer: Uint8Array;
	let imageHash: string;

	try {
		const fetchResponse = await robustFetch(input.imageUrl, {
			timeout: timeouts.fetchMs,
			retryDelay: 1000,
			maxRetries: 3,
		});

		if (!fetchResponse.ok) {
			throw new Error(
				`Failed to fetch image: ${fetchResponse.status} ${fetchResponse.statusText}`,
			);
		}

		const arrayBuffer = await fetchResponse.arrayBuffer();
		imageBuffer = new Uint8Array(arrayBuffer);
		imageHash = await computeSHA256(imageBuffer);

		logger.info("vision_analysis.download_complete", {
			imageHash,
			size: imageBuffer.length,
			durationMs: Date.now() - startedAt,
			...logContext,
		});
	} catch (error) {
		logger.error("vision_analysis.download_failed", {
			imageUrl: input.imageUrl,
			error: error instanceof Error ? error.message : String(error),
			...logContext,
		});
		throw error;
	}

	// --- OPTIMIZATION: Parallel Cache Check and Model Generation ---

	// 2. Start Cache Lookup Promise
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

	// 3. Start Generation Promise
	const generationPromise = (async (): Promise<VisionAnalysisResult> => {
		const key = env.googleApiKey;
		if (!key) throw new Error("Google API key required for vision analysis");

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
								// Binary Injection: Pass buffer directly
								{ type: "image", image: imageBuffer },
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

		// TRIGGER ASYNC ARCHIVAL (Off-path)
		// Upload source image to Blob for resilience/cache future use
		uploadImageBufferToBlob(Buffer.from(imageBuffer), {
			filename: `vision/source/${imageHash}`,
			addRandomSuffix: false,
		}).catch((e) => {
			logger.warn("vision_analysis.source_upload_failed", {
				imageHash,
				error: e.message,
			});
		});

		if (options.onResult) {
			try {
				const trigger = options.onResult(parsedResult, imageHash);
				if (trigger instanceof Promise) {
					// Fire and forget
					trigger.catch((e) =>
						console.error("Failed to trigger vision archival", e),
					);
				}
			} catch (e) {
				console.error("Failed to call onResult callback", e);
			}
		}

		return parsedResult;
	})();

	// 4. The Race/Decision
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
