import { describe, expect, it, mock } from "bun:test";
import { htmlToCanvasTool } from "../../tools/html-to-canvas";

// Mock the workflows
mock.module("../../workflows/layout", () => ({
	htmlGeneratorWorkflow: {
		inputSchema: {
			extend: mock(() => ({
				parse: mock((v: any) => v),
				safeParse: mock((v: any) => ({ success: true, data: v })),
			})),
		},
		run: mock(async () => ({
			html: "<html></html>",
			css: "",
			components: [],
			rationale: "mocked",
		})),
	},
}));

mock.module("../../workflows/html-render", () => ({
	htmlRenderWorkflow: {
		run: mock(async () => ({
			imageUrl: "https://example.com/img.png",
			width: 1200,
			height: 1600,
			bytes: 1024,
		})),
	},
}));

describe("htmlToCanvasTool", () => {
	it("should strictly require brief and explicitly reject raw html/css in execution", async () => {
		const input = {
			brief: "a test design",
			html: "SHOULD BE REJECTED",
			css: "SHOULD BE REJECTED",
		};

		// We need to bypass the stripping for this specific test of the execute check
		// or use .passthrough() in a temporary schema
		const resultPromise = (htmlToCanvasTool.execute as any)({ context: input });
		await expect(resultPromise).rejects.toThrow(
			/does not accept raw HTML\/CSS/,
		);
	});

	it("should fail if brief is missing", () => {
		const input = {
			renderWidth: 1000,
		};
		const parseResult = htmlToCanvasTool.inputSchema.safeParse(input);
		expect(parseResult.success).toBe(false);
	});
});
