import {
	afterAll,
	beforeAll,
	describe,
	expect,
	it,
	mock,
	spyOn,
} from "bun:test";
import { MockLanguageModelV3 } from "ai/test";
import * as BlobUtils from "../utils/blob-storage";
import * as HashUtils from "../utils/hashing";
import * as HttpUtils from "../utils/http";

// Mock dependencies
const mockRobustFetch = spyOn(HttpUtils, "robustFetch");
const mockComputeSHA256 = spyOn(HashUtils, "computeSHA256");
spyOn(BlobUtils, "uploadImageBufferToBlob").mockResolvedValue(
	"https://blob/store",
);

// Mock KV
const mockKvSet = mock(() => Promise.resolve("OK"));
const mockKvDel = mock(() => Promise.resolve(1));
const mockKvGet = mock(() => Promise.resolve(null));

// Mock config BEFORE importing workflow
mock.module("../config", () => ({
	getEnv: () => ({
		kvRestApiUrl: "https://fake-kv.vercel-storage.com",
		kvRestApiToken: "fake-token",
		googleApiKey: "fake-key",
		blobHostname: "fake-blob.com",
	}),
}));

mock.module("@vercel/kv", () => ({
	createClient: () => ({
		set: mockKvSet,
		del: mockKvDel,
		get: mockKvGet,
		exists: async () => 0,
	}),
	kv: {
		set: mockKvSet,
		del: mockKvDel,
		get: mockKvGet,
	},
}));

mock.module("@vercel/blob", () => ({
	list: async () => ({ blobs: [] }),
	put: async () => ({ url: "https://example.com/blob" }),
}));

describe("visionAnalysisWorkflow Coalescing", () => {
	beforeAll(() => {
		mockRobustFetch.mockImplementation(async () => {
			return new Response(new Uint8Array([1, 2, 3, 4]).buffer);
		});
		mockComputeSHA256.mockResolvedValue("coalesce-hash");
	});

	afterAll(() => {
		mock.restore();
	});

	it("should acquire lock before generating", async () => {
		// Dynamic import to ensure mocks apply
		const { runVisionAnalysisWorkflow } = await import(
			"../workflows/vision-analysis"
		);

		// Reset mocks
		mockKvSet.mockClear();

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
								scene_description: "Test Scene",
								time_of_day: "Unknown",
								weather_atmosphere: "Unknown",
								lighting: {
									source: "Unknown",
									direction: "Unknown",
									quality: "Unknown",
									color_temp: "Unknown",
								},
							},
							color_palette: {
								dominant_hex_estimates: [],
								accent_colors: [],
								contrast_level: "Medium",
							},
							composition: {
								camera_angle: "Unknown",
								framing: "Unknown",
								depth_of_field: "Unknown",
								focal_point: "Unknown",
							},
							objects: [],
							text_ocr: { present: false, content: null },
							semantic_relationships: [],
						}),
					},
				],
				warnings: [],
			}),
		});

		await runVisionAnalysisWorkflow(
			{ imageUrl: "https://example.com/image.jpg" },
			{ model: mockModel },
		);

		// Expect KV set (nx: true) to be called
		expect(mockKvSet).toHaveBeenCalled();
		const calls = mockKvSet.mock.calls;
		const lastCall = calls[calls.length - 1];
		// key, value, options
		expect(lastCall[0]).toContain("vision:lock:");
		expect(lastCall[2]).toEqual({ nx: true, ex: 120 });
	});
});
