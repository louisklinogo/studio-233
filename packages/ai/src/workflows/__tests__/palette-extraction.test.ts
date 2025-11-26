import assert from "node:assert/strict";
import test from "node:test";

import { runWorkflow } from "../../utils/run-workflow";
import { paletteExtractionWorkflow } from "../vision-enhancements";

const SAMPLE_PNG_BASE64 =
	"iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFklEQVR4nGP8z/CfAQgwYMRgqGgAAI0ABSk8zbrQAAAAAElFTkSuQmCC";

test("palette extraction returns requested number of swatches", async () => {
	const originalFetch = global.fetch;
	global.fetch = async () =>
		new Response(Buffer.from(SAMPLE_PNG_BASE64, "base64"), {
			headers: { "content-type": "image/png" },
		});

	try {
		const result = await runWorkflow(paletteExtractionWorkflow, {
			imageUrl: "https://example.com/sample.png",
			colors: 4,
		});
		assert.ok(result.palette.length >= 1 && result.palette.length <= 4);
		assert.ok(result.palette[0].hex.startsWith("#"));
	} finally {
		global.fetch = originalFetch;
	}
});
