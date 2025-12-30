import { describe, expect, it } from "bun:test";
import { computeSHA256 } from "../utils/hashing";

describe("computeSHA256", () => {
	it("should compute SHA-256 for a string", async () => {
		const input = "studio233";
		const hash = await computeSHA256(input);
		// Precomputed SHA-256 for "studio233"
		expect(hash).toBe(
			"9c7c8f17591e418000d3475258ce3033b7b1cde4e4b396abfa2102a2dc3800de",
		);
	});

	it("should compute SHA-256 for a Buffer", async () => {
		const input = Buffer.from("hello world");
		const hash = await computeSHA256(input);
		const expected = new Bun.CryptoHasher("sha256").update(input).digest("hex");
		expect(hash).toBe(expected);
	});

	it("should compute SHA-256 for a ReadableStream", async () => {
		const input = new ReadableStream({
			start(controller) {
				controller.enqueue(Buffer.from("part1"));
				controller.enqueue(Buffer.from("part2"));
				controller.close();
			},
		});
		const hash = await computeSHA256(input);
		const expected = new Bun.CryptoHasher("sha256")
			.update("part1")
			.update("part2")
			.digest("hex");
		expect(hash).toBe(expected);
	});
});
