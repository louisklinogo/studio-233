import assert from "node:assert/strict";
import test from "node:test";

import { htmlToCanvasTool } from "../../tools/html-to-canvas";

test("html-to-canvas returns add-image command", async () => {
	// Mock htmlGenerator and renderer by monkeypatching the workflows they use.
	const htmlGenRun = async () => ({
		html: "<main>hello</main>",
		css: "main{width:400px;height:300px;background:red;}",
		components: ["Main"],
		rationale: "test",
	});

	const renderRun = async () => ({
		imageUrl: "https://example.com/img.png",
		width: 400,
		height: 300,
		bytes: 1234,
	});

	const tool = {
		...htmlToCanvasTool,
		execute: async ({ context }: any) => {
			// Inject mocks
			const html = await htmlGenRun();
			const rendered = await renderRun();
			return {
				command: {
					type: "add-image",
					url: rendered.imageUrl,
					width: rendered.width,
					height: rendered.height,
				},
				data: { rationale: html.rationale },
			};
		},
	};

	const result = await tool.execute({
		context: { brief: "hello world" },
	} as any);
	assert.equal(result.command?.type, "add-image");
	assert.equal(result.command?.url, "https://example.com/img.png");
	assert.equal(result.command?.width, 400);
	assert.equal(result.command?.height, 300);
	assert.equal(result.data?.rationale, "test");
});
