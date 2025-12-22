import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { list } from "@vercel/blob";
import { generateObject } from "ai";
import crypto from "crypto";

import { getEnv } from "../config";
import { GEMINI_PRO_MODEL } from "../model-config";
import { VISION_ANALYSIS_PROMPT } from "../prompts/vision-analysis";
import {
	type VisionAnalysisInput,
	type VisionAnalysisResult,
	visionAnalysisInputSchema,
	visionAnalysisOutputSchema,
} from "../schemas/vision-analysis";
import { uploadImageBufferToBlob } from "../utils/blob-storage";

const env = getEnv();

async function getLatestBlobUrl(prefix: string): Promise<string | null> {
	const result = await list({ prefix, limit: 50 });
	const blobs = result.blobs;
	if (blobs.length === 0) return null;

	let latest = blobs[0]!;
	for (const blob of blobs) {
		if (blob.uploadedAt > latest.uploadedAt) {
			latest = blob;
		}
	}

	return latest.url;
}

async function loadCachedVisionAnalysis(
	imageHash: string,
): Promise<VisionAnalysisResult | null> {
	try {
		const url = await getLatestBlobUrl(`vision/metadata/${imageHash}/`);
		if (!url) return null;

		const response = await fetch(url);
		if (!response.ok) return null;
		const json = await response.json();
		const parsed = visionAnalysisOutputSchema.safeParse(json);
		if (!parsed.success) return null;
		return parsed.data;
	} catch (error) {
		console.warn("Vision analysis cache lookup failed:", error);
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
): Promise<string | null> {
	try {
		const existing = await getLatestBlobUrl(`vision/source/${imageHash}/`);
		if (existing) return existing;
	} catch (error) {
		console.warn("Vision source snapshot lookup failed:", error);
	}

	try {
		const response = await fetch(originalImageUrl);
		if (!response.ok) {
			throw new Error(
				`Failed to download image: ${response.status} ${response.statusText}`,
			);
		}

		const buffer = Buffer.from(await response.arrayBuffer());
		const headerContentType = response.headers.get("content-type");
		const contentType =
			headerContentType && headerContentType.startsWith("image/")
				? headerContentType
				: inferImageContentType(buffer);

		return await uploadImageBufferToBlob(buffer, {
			contentType,
			prefix: `vision/source/${imageHash}`,
		});
	} catch (error) {
		console.error("Failed to persist source image snapshot:", error);
		return null;
	}
}

export async function runVisionAnalysisWorkflow(
	input: VisionAnalysisInput,
): Promise<VisionAnalysisResult> {
	const imageHash = crypto
		.createHash("md5")
		.update(input.imageUrl)
		.digest("hex");

	const cached = await loadCachedVisionAnalysis(imageHash);
	if (cached) return cached;

	const key = env.googleApiKey;
	if (!key) throw new Error("Google API key required for vision analysis");

	const sourceImageUrl = await resolveOrCreateSourceSnapshot(
		imageHash,
		input.imageUrl,
	);
	const analysisImageUrl = sourceImageUrl ?? input.imageUrl;

	const google = createGoogleGenerativeAI({ apiKey: key });
	// Using the system-configured GEMINI_MODEL
	const model = google(GEMINI_PRO_MODEL);

	const result = await generateObject({
		model,
		schema: visionAnalysisOutputSchema,
		messages: [
			{
				role: "system",
				content: VISION_ANALYSIS_PROMPT,
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
	});

	const jsonBuffer = Buffer.from(JSON.stringify(result.object, null, 2));
	try {
		await uploadImageBufferToBlob(jsonBuffer, {
			contentType: "application/json",
			prefix: `vision/metadata/${imageHash}`,
		});
	} catch (error) {
		console.error("Failed to persist vision metadata:", error);
	}

	return result.object;
}

export const visionAnalysisWorkflow = {
	id: "vision-analysis",
	inputSchema: visionAnalysisInputSchema,
	outputSchema: visionAnalysisOutputSchema,
	run: runVisionAnalysisWorkflow,
};
