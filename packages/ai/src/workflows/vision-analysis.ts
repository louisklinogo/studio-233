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

const env = getEnv();

export type VisionAnalysisMode = "quick" | "full";

type VisionAnalysisTimeouts = {
	blobListMs: number;
	fetchMs: number;
	geminiMs: number;
	uploadMs: number;
};

const DEFAULT_TIMEOUTS: VisionAnalysisTimeouts = {
	blobListMs: 10_000,
	fetchMs: 25_000,
	geminiMs: 120_000,
	uploadMs: 25_000,
};

const QUICK_TIMEOUTS: VisionAnalysisTimeouts = {
	...DEFAULT_TIMEOUTS,
	geminiMs: 60_000,
};

import type { LanguageModel } from "ai";

export type VisionAnalysisWorkflowOptions = {
	mode?: VisionAnalysisMode;
	abortSignal?: AbortSignal;
	timeouts?: Partial<VisionAnalysisTimeouts>;
	logContext?: Record<string, unknown>;
	model?: LanguageModel;
};

async function getLatestBlobUrl(
	prefix: string,
	options: { timeoutMs: number; abortSignal?: AbortSignal },
): Promise<string | null> {
	try {
		const result = await withTimeout(
			"vision_analysis.blob_list",
			options.timeoutMs,
			async () => await list({ prefix, limit: 50 }),
			options.abortSignal,
		);
		const blobs = result.blobs;
		if (blobs.length === 0) return null;

		let latest = blobs[0]!;
		for (const blob of blobs) {
			if (blob.uploadedAt > latest.uploadedAt) {
				latest = blob;
			}
		}

		return latest.url;
	} catch (error) {
		if (options.abortSignal?.aborted) throw error;
		logger.warn("vision_analysis.blob_list_failed", {
			prefix,
			message: error instanceof Error ? error.message : String(error),
		});
		return null;
	}
}

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

function inferImageContentType(buffer: Buffer): string {
	// PNG signature
	if (
		buffer.length >= 8 &&
		buffer[0] === 0x89 &&
		buffer[1] === 0x50 &&
		buffer[2] === 0x4e &&
		buffer[3] === 0x47 &&
		buffer[4] === 0x0d &&
		buffer[5] === 0x0a &&
		buffer[6] === 0x1a &&
		buffer[7] === 0x0a
	) {
		return "image/png";
	}

	// JPEG signature
	if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8) {
		return "image/jpeg";
	}

	// GIF signature
	if (
		buffer.length >= 6 &&
		(buffer.toString("ascii", 0, 6) === "GIF87a" ||
			buffer.toString("ascii", 0, 6) === "GIF89a")
	) {
		return "image/gif";
	}

	// WebP signature (RIFF....WEBP)
	if (
		buffer.length >= 12 &&
		buffer.toString("ascii", 0, 4) === "RIFF" &&
		buffer.toString("ascii", 8, 12) === "WEBP"
	) {
		return "image/webp";
	}

	return "image/png";
}

async function resolveOrCreateSourceSnapshot(
	imageHash: string,
	originalImageUrl: string,
	options: { timeoutMs: VisionAnalysisTimeouts; abortSignal?: AbortSignal },
): Promise<string | null> {
	const prefix = `vision/source/${imageHash}`;
	// Try deterministic check first
	const deterministicUrl = `https://${env.blobHostname || "2lkalc8atjuztgjx.public.blob.vercel-storage.com"}/${prefix}/source.bin`;
	try {
		const headRes = await fetch(deterministicUrl, { method: "HEAD" });
		if (headRes.ok) return deterministicUrl;
	} catch (e) {
		// fallback to list
	}

	try {
		const existing = await getLatestBlobUrl(`${prefix}/`, {
			timeoutMs: options.timeoutMs.blobListMs,
			abortSignal: options.abortSignal,
		});
		if (existing) return existing;
	} catch (error) {
		if (options.abortSignal?.aborted) throw error;
		logger.warn("vision_analysis.source_snapshot_lookup_failed", {
			imageHash,
			message: error instanceof Error ? error.message : String(error),
		});
	}

	try {
		let buffer: Buffer;
		let contentType: string;

		if (originalImageUrl.startsWith("data:")) {
			const match = /^data:([^;]+);base64,(.+)$/.exec(originalImageUrl);
			if (!match) throw new Error("Invalid data URL");
			contentType = match[1] ?? "image/png";
			buffer = Buffer.from(match[2] ?? "", "base64");
		} else {
			const response = await withTimeout(
				"vision_analysis.source_fetch",
				options.timeoutMs.fetchMs,
				async (signal) => await fetch(originalImageUrl, { signal }),
				options.abortSignal,
			);
			if (!response.ok) {
				throw new Error(
					`Failed to download image: ${response.status} ${response.statusText}`,
				);
			}

			buffer = Buffer.from(await response.arrayBuffer());
			const headerContentType = response.headers.get("content-type");
			contentType =
				headerContentType && headerContentType.startsWith("image/")
					? headerContentType
					: inferImageContentType(buffer);
		}

		return await uploadImageBufferToBlob(buffer, {
			contentType,
			prefix,
			filename: "source.bin", // Ensure future deterministic lookups work
			abortSignal: options.abortSignal,
			timeoutMs: options.timeoutMs.uploadMs,
		});
	} catch (error) {
		if (options.abortSignal?.aborted) throw error;
		logger.warn("vision_analysis.source_snapshot_persist_failed", {
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

	const cached = await loadCachedVisionAnalysis(imageHash, {
		timeoutMs: timeouts,
		abortSignal: options.abortSignal,
	});
	if (cached) {
		logger.info("vision_analysis.cache_hit", {
			imageHash,
			durationMs: Date.now() - startedAt,
			...logContext,
		});
		return cached;
	}

	const key = env.googleApiKey;
	if (!key) throw new Error("Google API key required for vision analysis");

	const sourceImageUrl = await resolveOrCreateSourceSnapshot(
		imageHash,
		input.imageUrl,
		{ timeoutMs: timeouts, abortSignal: options.abortSignal },
	);
	const analysisImageUrl = sourceImageUrl ?? input.imageUrl;

	let model: LanguageModel;
	let modelId: string;

	if (options.model) {
		model = options.model;
		modelId = model.modelId;
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
				// AI SDK abort support varies by provider/version; cast to any.
				abortSignal: signal,
			} as any),
		options.abortSignal,
	);

	logger.info("vision_analysis.model_complete", {
		imageHash,
		model: modelId,
		durationMs: Date.now() - startedAt,
		...logContext,
	});

	const jsonBuffer = Buffer.from(JSON.stringify(result.object, null, 2));
	try {
		// Save timestamped version
		await uploadImageBufferToBlob(jsonBuffer, {
			contentType: "application/json",
			prefix: `vision/metadata/${imageHash}`,
			abortSignal: options.abortSignal,
			timeoutMs: timeouts.uploadMs,
		});
		// Save deterministic version for fast lookup
		await uploadImageBufferToBlob(jsonBuffer, {
			contentType: "application/json",
			prefix: `vision/metadata/${imageHash}`,
			filename: "latest.json",
			abortSignal: options.abortSignal,
			timeoutMs: timeouts.uploadMs,
		});
	} catch (error) {
		console.error("Failed to persist vision metadata:", error);
	}

	logger.info("vision_analysis.complete", {
		imageHash,
		durationMs: Date.now() - startedAt,
		...logContext,
	});

	return visionAnalysisOutputSchema.parse(result.object);
}

export const visionAnalysisWorkflow = {
	id: "vision-analysis",
	inputSchema: visionAnalysisInputSchema,
	outputSchema: visionAnalysisOutputSchema,
	run: runVisionAnalysisWorkflow,
};
