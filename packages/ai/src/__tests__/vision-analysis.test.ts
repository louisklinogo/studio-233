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
import { runVisionAnalysisWorkflow } from "../workflows/vision-analysis";

// Mock dependencies
const mockRobustFetch = spyOn(HttpUtils, "robustFetch");
const mockComputeSHA256 = spyOn(HashUtils, "computeSHA256");
const mockUpload = spyOn(BlobUtils, "uploadImageBufferToBlob");

// Mock @vercel/blob (legacy/direct calls if any)
mock.module("@vercel/blob", () => ({
	list: async () => ({ blobs: [] }),
	put: async () => ({ url: "https://example.com/blob" }),
}));

// Mock FS for /tmp writes (optional, but good if we can spy on Bun.write)
// Bun.write is hard to mock directly in some envs, but we can verify the side effect (reading it back).
// For this test, we might just assume robustFetch returns a buffer/stream that gets processed.

describe("visionAnalysisWorkflow [Refactor]", () => {
	beforeAll(() => {
		// Setup mocks
		mockRobustFetch.mockImplementation(async () => {
			return new Response(new Uint8Array([1, 2, 3, 4]).buffer);
		});
		mockComputeSHA256.mockResolvedValue("test-sha256-hash");
		mockUpload.mockResolvedValue("https://blob/store");
	});

	afterAll(() => {
		mock.restore();
	});

	it("should download image, hash it, and inject binary into model", async () => {
		let capturedImagePart: any = null;

		const mockModel = new MockLanguageModelV3({
			doGenerate: async (args) => {
				// Capture the image part from the prompt
				const userMsg = args.prompt.filter((p) => p.role === "user")[0];
				if (userMsg && Array.isArray(userMsg.content)) {
					capturedImagePart = userMsg.content.find(
						(c) => c.type === "image" || c.type === "file",
					);
				}

				return {
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
				};
			},
		});

		await runVisionAnalysisWorkflow(
			{
				imageUrl: "https://example.com/image.jpg",
			},
			{
				model: mockModel,
			},
		);

		// 1. Verify Download
		expect(mockRobustFetch).toHaveBeenCalledWith(
			"https://example.com/image.jpg",
			expect.anything(),
		);

		// 2. Verify Hashing
		expect(mockComputeSHA256).toHaveBeenCalled();

		// 3. Verify Binary Injection
		expect(capturedImagePart).toBeDefined();
		// It might be 'image' or 'file' depending on SDK version/internals
		if (capturedImagePart.type === "image") {
			expect(capturedImagePart.image).toBeInstanceOf(Uint8Array);
		} else {
			// type: "file", data is the buffer
			expect(capturedImagePart.type).toBe("file");
			expect(capturedImagePart.data).toBeDefined();
		}
	});
});
