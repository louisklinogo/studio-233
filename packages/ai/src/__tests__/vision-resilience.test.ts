import { beforeAll, describe, expect, it, mock } from "bun:test";
import { MockLanguageModelV3 } from "ai/test";

// Manual Mock for config to avoid syntax errors
mock.module("../config", () => ({
	getEnv: () => ({
		kvRestApiUrl: "http://localhost:8080",
		kvRestApiToken: "token",
		googleApiKey: "test-key",
	}),
	resetEnv: () => {},
}));

// Mock @vercel/kv
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

describe("visionAnalysisWorkflow Resilience", () => {
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

	it("should trigger onResult callback even when cache fails", async () => {
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
});
