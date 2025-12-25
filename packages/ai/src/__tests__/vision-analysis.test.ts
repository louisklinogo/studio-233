import { beforeAll, describe, expect, it, mock } from "bun:test";
import { MockLanguageModelV3 } from "ai/test";
import { runVisionAnalysisWorkflow } from "../workflows/vision-analysis";

// Mock @vercel/blob
mock.module("@vercel/blob", () => ({
	list: async () => ({ blobs: [] }),
	put: async () => ({ url: "https://example.com/blob" }),
}));

// Mock global fetch for image download
const originalFetch = global.fetch;
beforeAll(() => {
	global.fetch = mock(async (url) => {
		if (
			url.toString().includes("example.com/image.jpg") ||
			url.toString().includes("example.com/blob")
		) {
			return new Response(new ArrayBuffer(10), {
				status: 200,
				headers: { "content-type": "image/jpeg" },
			});
		}
		if (
			url.toString().endsWith("latest.json") ||
			url.toString().endsWith("source.bin")
		) {
			return new Response(null, { status: 404 });
		}
		return new Response(null, { status: 404 });
	});
});

describe("visionAnalysisWorkflow", () => {
	it("should analyze an image and return structured data", async () => {
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
								scene_description:
									"A studio shot of a model wearing a blue jacket.",
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
								dominant_hex_estimates: ["#0000FF", "#FFFFFF"],
								accent_colors: ["#000000"],
								contrast_level: "High",
							},
							composition: {
								camera_angle: "Eye level",
								framing: "Full shot",
								depth_of_field: "Deep",
								focal_point: "Model",
							},
							objects: [
								{
									id: "obj1",
									label: "Jacket",
									category: "Clothing",
									location: "Center",
									prominence: "Dominant",
									visual_attributes: {
										color: "Blue",
										texture: "Fabric",
										material: "Wool",
										state: "New",
										dimensions_relative: "Large",
									},
									wearing_configuration: null,
									micro_details: [],
									pose_or_orientation: null,
									text_content: null,
								},
							],
							text_ocr: {
								present: false,
								content: null,
							},
							semantic_relationships: [],
						}),
					},
				],
				rawCall: {
					rawPrompt: null,
					rawSettings: {},
				},
				warnings: [],
			}),
		});

		const result = await runVisionAnalysisWorkflow(
			{
				imageUrl: "https://example.com/image.jpg",
			},
			{
				model: mockModel,
				// Mock environment variables are handled by bun:test or setup
				// For now, we rely on runVisionAnalysisWorkflow not checking API key if model is injected
				// Actually it checks key at the start. We might need to mock env.
			},
		);

		expect(result).toBeDefined();
		expect(result.meta.image_quality).toBe("High");
		expect(result.global_context.scene_description).toBe(
			"A studio shot of a model wearing a blue jacket.",
		);
		expect(result.objects[0].label).toBe("Jacket");
	});
});
