import { beforeEach, describe, expect, it, mock } from "bun:test";

// Mock config
mock.module("../config", () => ({
	getEnv: () => ({}),
}));

// Mock utils/http
const mockRobustFetch = mock();
mock.module("../utils/http", () => ({
	robustFetch: mockRobustFetch,
}));

import {
	buildSystemPrompt,
	generateAgentResponse,
	hardenImageMessages,
} from "../runtime";

describe("Runtime Unit Tests", () => {
	beforeEach(() => {
		mockRobustFetch.mockClear();
	});

	it("buildSystemPrompt should include all provided image URLs", () => {
		const images = ["https://ex.com/1.png", "https://ex.com/2.png"];
		const prompt = buildSystemPrompt("orchestrator", images);

		expect(prompt).toContain("[1]: https://ex.com/1.png");
		expect(prompt).toContain("[2]: https://ex.com/2.png");
		expect(prompt).toContain("Multiple images detected");
	});

	it("hardenImageMessages should fetch URLs and convert to bytes with mimeType", async () => {
		const mockBuffer = new TextEncoder().encode("test-data");
		mockRobustFetch.mockResolvedValue({
			ok: true,
			headers: new Map([["content-type", "image/png"]]),
			arrayBuffer: async () => mockBuffer.buffer,
		});

		const messages: any[] = [
			{
				role: "user",
				content: [
					{ type: "text", text: "hi" },
					{ type: "image", image: "https://example.com/test.png" },
				],
			},
		];

		const hardened = await hardenImageMessages(messages);

		expect(mockRobustFetch).toHaveBeenCalledWith(
			"https://example.com/test.png",
			expect.any(Object),
		);
		const imagePart = hardened[0].content[1];
		expect(imagePart.type).toBe("image");
		expect(imagePart.image).toBeInstanceOf(Uint8Array);
		expect(imagePart.mimeType).toBe("image/png");
	});

	it("hardenImageMessages should handle URL objects", async () => {
		mockRobustFetch.mockResolvedValue({
			ok: true,
			headers: new Map([["content-type", "image/jpeg"]]),
			arrayBuffer: async () => new ArrayBuffer(0),
		});

		const messages: any[] = [
			{
				role: "user",
				content: [
					{ type: "image", image: new URL("https://example.com/url-obj.jpg") },
				],
			},
		];

		const hardened = await hardenImageMessages(messages);
		expect(mockRobustFetch).toHaveBeenCalledWith(
			"https://example.com/url-obj.jpg",
			expect.any(Object),
		);
		expect(hardened[0].content[0].mimeType).toBe("image/jpeg");
	});

	it("hardenImageMessages should fallback to original on fetch error", async () => {
		mockRobustFetch.mockRejectedValue(new Error("Fail"));

		const messages: any[] = [
			{
				role: "user",
				content: [{ type: "image", image: "https://example.com/fail.png" }],
			},
		];

		const hardened = await hardenImageMessages(messages);
		expect(hardened[0].content[0].image).toBe("https://example.com/fail.png");
	});
});
