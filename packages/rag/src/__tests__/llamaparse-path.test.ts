import { beforeEach, describe, expect, it, mock } from "bun:test";
import { multimodalIngestionService } from "../multimodal-service";

// Mock the LlamaParseReader
mock.module("@llamaindex/cloud", () => {
	return {
		LlamaParseReader: class {
			loadJson = async (url: string) => {
				if (url === "fail") throw new Error("API Error");
				return [
					{
						coreIdentity: {
							colors: ["#FF0000"],
							fonts: [{ family: "Helvetica", usage: "Headings" }],
							logos: ["Red Dot"],
							slogans: ["Simple is better"],
						},
						visualStyle: {
							layoutPrinciples: ["Swiss Design"],
							imageryStyle: ["Product focused"],
							photographyGuidelines: ["Clean"],
							vibe: "Minimalist",
						},
						semanticDNA: {
							toneOfVoice: "Direct",
							copywritingGuidelines: ["No fluff"],
						},
					},
				];
			};
		},
	};
});

describe("multimodalIngestionService - Path A (LlamaParse)", () => {
	it("should succeed when LlamaParse returns valid data", async () => {
		const options = {
			url: "https://example.com/brand.pdf",
			workspaceId: "ws_123",
			assetId: "ast_456",
			filename: "brand.pdf",
			dbUrl: "postgres://...",
			llamaParseApiKey: "fake_key",
		};

		const result = await multimodalIngestionService(options);

		expect(result.path).toBe("llama-parse");
		expect(result.brandDNA.coreIdentity.colors).toContain("#FF0000");
		expect(result.score).toBeGreaterThan(0.8);
	});

	it("should fall back to Gemini Vision when LlamaParse fails", async () => {
		const options = {
			url: "fail",
			workspaceId: "ws_123",
			assetId: "ast_456",
			filename: "brand.pdf",
			dbUrl: "postgres://...",
			llamaParseApiKey: "fake_key",
		};

		// It should fail because Gemini Vision is not mocked here and URL is 'fail'
		expect(multimodalIngestionService(options)).rejects.toThrow(
			"Multimodal ingestion failed",
		);
	});
});
