import { describe, expect, it, mock } from "bun:test";
import { renderHtmlTool } from "../render-html";

// Mock the workflow using bun's mock.module
mock.module("../../workflows/html-render", () => ({
	htmlRenderWorkflow: {
		run: mock(async () => ({
			imageUrl: "https://example.com/render.png",
			width: 1200,
			height: 1600,
			bytes: 1024,
		})),
	},
}));

// Import after mocking
import { htmlRenderWorkflow } from "../../workflows/html-render";

describe("renderHtmlTool", () => {
	it("should validate and execute strictly with provided HTML/CSS", async () => {
		const input = {
			html: "<div>Test</div>",
			css: "div { color: red; }",
			renderWidth: 1080,
			renderHeight: 1920,
		};

		const parsedInput = renderHtmlTool.inputSchema.parse(input);

		const result = await (renderHtmlTool.execute as any)({
			context: parsedInput,
		});

		// Verify workflow was called with correct mapped args
		expect(htmlRenderWorkflow.run).toHaveBeenCalledWith({
			html: input.html,
			css: input.css,
			width: 1080,
			height: 1920,
			scale: 1, // default
			background: undefined,
		});

		// Verify output structure
		expect(result.command).toEqual({
			type: "add-image",
			url: "https://example.com/render.png",
			width: 1200,
			height: 1600,
			meta: {
				provider: "html-render",
			},
		});
	});

	it("should fail validation if HTML is missing", async () => {
		const input = {
			css: "body { background: blue; }",
			renderWidth: 1000,
		};

		const parseResult = renderHtmlTool.inputSchema.safeParse(input);
		expect(parseResult.success).toBe(false);
	});
});
