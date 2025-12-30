import { beforeAll, describe, expect, it, mock } from "bun:test";
import { MockLanguageModelV3 } from "ai/test";
import { resetEnv } from "../config";

// Set env vars BEFORE any imports
process.env.KV_REST_API_URL = "http://localhost:8080";
process.env.KV_REST_API_TOKEN = "token";
resetEnv();

// Mock @vercel/kv FIRST
const kvMap = new Map();
const kvMock = {
	set: mock(async (key: string, val: any, opts: any) => {
		const exists = kvMap.has(key);
		if (opts?.nx && exists) return null;
		kvMap.set(key, val);
		return "OK";
	}),
	get: mock(async (key: string) => kvMap.get(key)),
	del: mock(async (key: string) => {
		kvMap.delete(key);
	}),
	exists: mock(async (key: string) => (kvMap.has(key) ? 1 : 0)),
};

mock.module("@vercel/kv", () => ({
	createClient: () => kvMock,
}));

import { runVisionAnalysisWorkflow } from "../workflows/vision-analysis";

// Mock @vercel/blob
mock.module("@vercel/blob", () => ({
	list: async () => ({ blobs: [] }),
	put: async () => ({ url: "https://example.com/blob" }),
}));

// Mock global fetch
beforeAll(() => {
	global.fetch = mock(async (url) => {
		if (url.toString().includes("example.com/image.jpg")) {
			return new Response(new ArrayBuffer(10), {
				status: 200,
				headers: { "content-type": "image/jpeg" },
			});
		}
		return new Response(null, { status: 404 });
	});
});

describe("visionAnalysisWorkflow Resilience", () => {
	it("should trigger onResult callback even when cache fails", async () => {
		// ... existing test ...
		const mockModel = new MockLanguageModelV3({
			doGenerate: async () => ({
				finishReason: "stop",
				usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
				content: [
					{
						type: "text",
						text: JSON.stringify({
							meta: {
								image_quality: "High",
								image_type: "Photography",
								resolution_estimation: "4K",
							},
							global_context: {
								scene_description: "Test scene",
								time_of_day: "Indoor",
								weather_atmosphere: "Neutral",
								lighting: {
									source: "Softbox",
									direction: "Front",
									quality: "Soft",
									color_temp: "Neutral",
								},
							},
							color_palette: {
								dominant_hex_estimates: ["#0000FF"],
								accent_colors: [],
								contrast_level: "High",
							},
							composition: {
								camera_angle: "Eye level",
								framing: "Full shot",
								depth_of_field: "Deep",
								focal_point: "Model",
							},
							objects: [],
							text_ocr: { present: false, content: null },
							semantic_relationships: [],
						}),
					},
				],
				rawCall: { rawPrompt: null, rawSettings: {} },
				warnings: [],
			}),
		});

		let callbackTriggered = false;
		let receivedHash = "";

		const result = await runVisionAnalysisWorkflow(
			{ imageUrl: "https://example.com/image.jpg" },
			{
				model: mockModel,
				onResult: (res, hash) => {
					callbackTriggered = true;
					receivedHash = hash;
				},
			},
		);

		expect(result).toBeDefined();
		expect(callbackTriggered).toBe(true);
		expect(receivedHash).toBeDefined();
		expect(receivedHash.length).toBeGreaterThan(0);
	});

	it("should recover from 2 transient fetch failures (packet loss simulation)", async () => {
		let attempts = 0;
		global.fetch = mock(async () => {
			attempts++;
			if (attempts <= 2) {
				return new Response(null, { status: 500 });
			}
			return new Response(new ArrayBuffer(10), {
				status: 200,
				headers: { "content-type": "image/jpeg" },
			});
		});

		const mockModel = new MockLanguageModelV3({
			doGenerate: async () => ({
				finishReason: "stop",
				usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
				content: [
					{
						type: "text",
						text: JSON.stringify({
							meta: {
								image_quality: "High",
								image_type: "Photography",
								resolution_estimation: "4K",
							},
							global_context: {
								scene_description: "Test",
								time_of_day: "Day",
								weather_atmosphere: "Clear",
								lighting: {
									source: "Sun",
									direction: "Top",
									quality: "Hard",
									color_temp: "Warm",
								},
							},
							color_palette: {
								dominant_hex_estimates: ["#ffffff"],
								accent_colors: [],
								contrast_level: "High",
							},
							composition: {
								camera_angle: "Eye",
								framing: "Wide",
								depth_of_field: "Deep",
								focal_point: "Subject",
							},
							objects: [],
							text_ocr: { present: false, content: null },
							semantic_relationships: [],
						}),
					},
				],
				rawCall: { rawPrompt: null, rawSettings: {} },
				warnings: [],
			}),
		});

		const result = await runVisionAnalysisWorkflow(
			{ imageUrl: "https://example.com/image.jpg" },
			{ model: mockModel },
		);

		expect(result).toBeDefined();
		expect(attempts).toBeGreaterThanOrEqual(3);
	});

	it("should handle thundering herd via KV request coalescing", async () => {
		// Mock env to enable KV
		process.env.KV_REST_API_URL = "http://localhost:8080";
		process.env.KV_REST_API_TOKEN = "token";

		let modelCalls = 0;
		const cachedResult = {
			meta: {
				image_quality: "High",
				image_type: "Photography",
				resolution_estimation: "4K",
			},
			global_context: {
				scene_description: "Test",
				time_of_day: "Day",
				weather_atmosphere: "Clear",
				lighting: {
					source: "Sun",
					direction: "Top",
					quality: "Hard",
					color_temp: "Warm",
				},
			},
			color_palette: {
				dominant_hex_estimates: ["#ffffff"],
				accent_colors: [],
				contrast_level: "High",
			},
			composition: {
				camera_angle: "Eye",
				framing: "Wide",
				depth_of_field: "Deep",
				focal_point: "Subject",
			},
			objects: [],
			text_ocr: { present: false, content: null },
			semantic_relationships: [],
		};

		const mockModel = new MockLanguageModelV3({
			doGenerate: async () => {
				modelCalls++;
				await new Promise((resolve) => setTimeout(resolve, 1000)); // Much slower generation
				isGenerated = true; // Mark as generated for fetch mock
				return {
					finishReason: "stop",
					usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
					content: [{ type: "text", text: JSON.stringify(cachedResult) }],
					rawCall: { rawPrompt: null, rawSettings: {} },
					warnings: [],
				};
			},
		});

		let isGenerated = false;

		// Mock fetch for both image download AND deterministic cache lookup
		global.fetch = mock(async (url) => {
			const urlStr = url.toString();
			if (urlStr.includes("image.jpg")) {
				// Simulate some download time to overlap
				await new Promise((r) => setTimeout(r, 100));
				return new Response(new ArrayBuffer(10), {
					status: 200,
					headers: { "content-type": "image/jpeg" },
				});
			}
			if (
				urlStr.includes("vision/metadata/") &&
				urlStr.includes("latest.json")
			) {
				if (isGenerated) {
					return new Response(JSON.stringify(cachedResult), { status: 200 });
				}
				return new Response(null, { status: 404 });
			}
			return new Response(null, { status: 404 });
		});

		// Trigger 3 concurrent requests as closely as possible
		const results = await Promise.all([
			runVisionAnalysisWorkflow(
				{ imageUrl: "https://example.com/image.jpg" },
				{ model: mockModel },
			),
			runVisionAnalysisWorkflow(
				{ imageUrl: "https://example.com/image.jpg" },
				{ model: mockModel },
			),
			runVisionAnalysisWorkflow(
				{ imageUrl: "https://example.com/image.jpg" },
				{ model: mockModel },
			),
		]);

		expect(results.length).toBe(3);
		expect(modelCalls).toBe(1); // ONLY ONE MODEL CALL!
	});
});
