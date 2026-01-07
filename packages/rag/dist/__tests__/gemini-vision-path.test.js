import { describe, expect, it, mock } from "bun:test";
import { multimodalIngestionService } from "../multimodal-service";

// Mock the pdf-to-img
mock.module("pdf-to-img", () => {
	return {
		pdf: async () => {
			return {
				[Symbol.asyncIterator]: async function* () {
					yield Buffer.from("fake-image-data");
				},
			};
		},
	};
});
// Mock the AI SDK
mock.module("ai", () => {
	return {
		generateText: async () => {
			return {
				text: JSON.stringify({
					coreIdentity: {
						colors: ["#0000FF"],
						fonts: [{ family: "Arial", usage: "Body" }],
						logos: ["Blue Square"],
						slogans: ["Think Different"],
					},
					visualStyle: {
						layoutPrinciples: ["Asymmetric"],
						imageryStyle: ["Casual"],
						photographyGuidelines: ["Natural light"],
						vibe: "Friendly",
					},
					semanticDNA: {
						toneOfVoice: "Warm",
						copywritingGuidelines: ["Use active voice"],
					},
				}),
			};
		},
	};
});
// Mock fetch for downloadFile
global.fetch = async () => ({
	ok: true,
	arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
});
describe("multimodalIngestionService - Path B (Gemini Vision)", () => {
	it("should succeed when Gemini Vision returns valid data", async () => {
		const options = {
			url: "https://example.com/brand.pdf",
			workspaceId: "ws_123",
			assetId: "ast_456",
			filename: "brand.pdf",
			dbUrl: "postgres://...",
			// No llamaParseApiKey to force Path B
			googleApiKey: "fake_google_key",
		};
		const result = await multimodalIngestionService(options);
		expect(result.path).toBe("gemini-vision");
		expect(result.brandDNA.coreIdentity.colors).toContain("#0000FF");
		expect(result.score).toBeGreaterThan(0.5);
	});
});
