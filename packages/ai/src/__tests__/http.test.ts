import { describe, expect, it, mock } from "bun:test";
import { AssetFetchError } from "../errors";
import { robustFetch } from "../utils/http";

describe("robustFetch", () => {
	it("should succeed on first try", async () => {
		const originalFetch = global.fetch;
		global.fetch = async () => new Response("ok", { status: 200 });

		try {
			const result = await robustFetch("https://example.com");
			expect(result.ok).toBe(true);
		} finally {
			global.fetch = originalFetch;
		}
	});

	it("should retry on failure and eventually succeed", async () => {
		let attempts = 0;
		const originalFetch = global.fetch;

		// Mock global fetch
		global.fetch = async () => {
			attempts++;
			if (attempts < 3) {
				throw new Error("Network error");
			}
			return new Response("ok", { status: 200 });
		};

		try {
			const result = await robustFetch("https://example.com", {
				retryDelay: 10, // Short delay for tests
			});
			expect(result.ok).toBe(true);
			expect(attempts).toBe(3);
		} finally {
			global.fetch = originalFetch;
		}
	});

	it("should fail after max retries", async () => {
		let attempts = 0;
		const originalFetch = global.fetch;

		global.fetch = async () => {
			attempts++;
			throw new Error("Persistent error");
		};

		try {
			await expect(
				robustFetch("https://example.com", {
					maxRetries: 2,
					retryDelay: 10,
				}),
			).rejects.toThrow(AssetFetchError);
			expect(attempts).toBe(3); // 1 initial + 2 retries
		} finally {
			global.fetch = originalFetch;
		}
	});
});
