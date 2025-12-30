import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";

import { BlobStorageError } from "../errors";
import { withTimeout } from "./timeout";

type UploadOptions = {
	prefix?: string;
	filename?: string;
	contentType?: string;
	extension?: string;
	access?: "public" | "private";
	abortSignal?: AbortSignal;
	timeoutMs?: number;
	addRandomSuffix?: boolean;
	allowOverwrite?: boolean;
};

function coerceBuffer(source: Buffer | Uint8Array | ArrayBuffer): Buffer {
	if (source instanceof Buffer) return source;
	if (source instanceof ArrayBuffer) return Buffer.from(source);
	return Buffer.from(source.buffer, source.byteOffset, source.byteLength);
}

function resolveExtension(contentType?: string, override?: string) {
	if (override) return override.replace(/^\./, "");
	if (!contentType) return "png";
	const [, ext] = contentType.split("/");
	return (ext || "png").split(";")[0];
}

export async function uploadImageBufferToBlob(
	buffer: Buffer | Uint8Array | ArrayBuffer,
	options: UploadOptions = {},
): Promise<string> {
	if (!buffer) {
		throw new BlobStorageError(
			"uploadImageBufferToBlob: buffer is required",
			"validation",
		);
	}

	const contentType = options.contentType ?? "image/png";
	const extension = resolveExtension(contentType, options.extension);
	const addRandomSuffix = options.addRandomSuffix ?? true;

	if (options.access && options.access !== "public") {
		throw new BlobStorageError(
			"Private blob uploads are not supported in this helper",
			"validation",
		);
	}

	let key: string;
	if (options.filename) {
		key = addRandomSuffix
			? `${options.prefix ?? "studio233/ai"}/${Date.now()}-${randomUUID()}-${options.filename}`
			: `${options.prefix ?? "studio233/ai"}/${options.filename}`;
	} else {
		key = `${options.prefix ?? "studio233/ai"}/${Date.now()}-${randomUUID()}.${extension}`;
	}

	try {
		const timeoutMs = options.timeoutMs ?? 60_000;
		const { url } = await withTimeout(
			"blob.put",
			timeoutMs,
			async () =>
				await put(key, coerceBuffer(buffer), {
					access: "public",
					contentType,
					addRandomSuffix,
					addOverwrite: options.allowOverwrite ?? false, // Fixed option name
				} as any),
			options.abortSignal,
		);

		return url;
	} catch (error) {
		const hint =
			"Failed to upload image to Vercel Blob. Ensure BLOB_READ_WRITE_TOKEN is configured.";
		throw new BlobStorageError(
			`${hint} Original error: ${error instanceof Error ? error.message : String(error)}`,
			"put",
		);
	}
}
