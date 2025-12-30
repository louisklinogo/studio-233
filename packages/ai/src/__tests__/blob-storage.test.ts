import { describe, expect, it, mock } from "bun:test";
import { BlobStorageError } from "../errors";
import { uploadImageBufferToBlob } from "../utils/blob-storage";

// Mock @vercel/blob
mock.module("@vercel/blob", () => ({
	put: async (key: string, data: any, options: any) => {
		return { url: `https://blob.com/${key}` };
	},
}));

describe("uploadImageBufferToBlob", () => {
	it("should include random suffix by default when filename is provided", async () => {
		const buffer = Buffer.from("test");
		const url = await uploadImageBufferToBlob(buffer, {
			filename: "test.png",
			prefix: "test-prefix",
		});

		// Expect key to contain random parts: test-prefix/<timestamp>-<uuid>-test.png
		expect(url).toMatch(/https:\/\/blob\.com\/test-prefix\/.*-.*-test\.png/);
	});

	it("should NOT include random suffix when addRandomSuffix is false", async () => {
		const buffer = Buffer.from("test");
		const url = await uploadImageBufferToBlob(buffer, {
			filename: "test.png",
			prefix: "test-prefix",
			addRandomSuffix: false,
		});

		expect(url).toBe("https://blob.com/test-prefix/test.png");
	});

	it("should always have random suffix when NO filename is provided", async () => {
		const buffer = Buffer.from("test");
		const url = await uploadImageBufferToBlob(buffer, {
			prefix: "test-prefix",
		});

		expect(url).toMatch(/https:\/\/blob\.com\/test-prefix\/.*-.*\.png/);
	});

	it("should throw BlobStorageError if buffer is missing", async () => {
		// @ts-ignore
		await expect(uploadImageBufferToBlob(null)).rejects.toThrow(
			BlobStorageError,
		);
	});
});
