import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";

type UploadOptions = {
	prefix?: string;
	contentType?: string;
	extension?: string;
	access?: "public" | "private";
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
		throw new Error("uploadImageBufferToBlob: buffer is required");
	}

	const contentType = options.contentType ?? "image/png";
	const extension = resolveExtension(contentType, options.extension);

	if (options.access && options.access !== "public") {
		throw new Error("Private blob uploads are not supported in this helper");
	}
	const key = `${options.prefix ?? "studio233/ai"}/${Date.now()}-${randomUUID()}.${extension}`;

	try {
		const { url } = await put(key, coerceBuffer(buffer), {
			access: "public",
			contentType,
		});

		return url;
	} catch (error) {
		const hint =
			"Failed to upload image to Vercel Blob. Ensure BLOB_READ_WRITE_TOKEN is configured.";
		if (error instanceof Error) {
			error.message = `${hint} Original error: ${error.message}`;
		}
		throw error;
	}
}
