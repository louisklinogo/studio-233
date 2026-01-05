import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	mock,
	spyOn,
} from "bun:test";
import * as BlobUtils from "../utils/blob-storage";
import * as HashUtils from "../utils/hashing";
import * as HttpUtils from "../utils/http";

// Mock dependencies
const mockRobustFetch = spyOn(HttpUtils, "robustFetch");
const mockComputeSHA256 = spyOn(HashUtils, "computeSHA256");
const mockUpload = spyOn(BlobUtils, "uploadImageBufferToBlob");

let capturedImagePart: any = null;

mock.module("ai", () => ({
	generateObject: async (args: any) => {
		// Capture the image part from the prompt
		const userMsg = args.messages.filter((p: any) => p.role === "user")[0];
		if (userMsg && Array.isArray(userMsg.content)) {
			capturedImagePart = userMsg.content.find(
				(c: any) => c.type === "image" || c.type === "file",
			);
		}

		return {
			object: {
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
			},
		};
	},
	streamText: async () => ({}),
	generateText: async () => ({}),
}));

import { runVisionAnalysisWorkflow } from "../workflows/vision-analysis";

describe("visionAnalysisWorkflow [Refactor]", () => {
	beforeAll(() => {
		// Setup mocks
		mockRobustFetch.mockImplementation(async () => {
			return new Response(new Uint8Array([1, 2, 3, 4]).buffer);
		});
		mockComputeSHA256.mockResolvedValue("test-sha256-hash");
		mockUpload.mockResolvedValue("https://blob/store" as any);
	});

	beforeEach(() => {
		mockRobustFetch.mockClear();
		mockComputeSHA256.mockClear();
		mockUpload.mockClear();
	});

	afterAll(() => {
		mockRobustFetch.mockRestore();
		mockComputeSHA256.mockRestore();
		mockUpload.mockRestore();
	});

	it("should download image, hash it, and inject binary into model", async () => {
		await runVisionAnalysisWorkflow(
			{
				imageUrl: "https://example.com/image.jpg",
			},
			{
				model: {} as any, // Model is mocked via ai module
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
