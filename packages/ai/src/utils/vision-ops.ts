import { createHash } from "node:crypto";
import { list } from "@vercel/blob";
import { getEnv } from "../config";
import { uploadImageBufferToBlob } from "./blob-storage";
import { logger } from "./logger";
import { withTimeout } from "./timeout";

const env = getEnv();

export async function getLatestBlobUrl(
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

export function inferImageContentType(buffer: Buffer): string {
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

export async function resolveOrCreateSourceSnapshot(
	imageHash: string,
	originalImageUrl: string,
	options: {
		timeoutMs: { blobListMs: number; fetchMs: number; uploadMs: number };
		abortSignal?: AbortSignal;
	},
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
