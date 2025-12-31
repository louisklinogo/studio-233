import { z } from "zod";

import { canvasToolOutputSchema } from "../schemas/tool-output";
import { htmlRenderWorkflow } from "../workflows/html-render";
import { htmlGeneratorWorkflow } from "../workflows/layout";
import { createTool } from "./factory";

const baseSchema = htmlGeneratorWorkflow.inputSchema.extend({
	renderWidth: z.number().int().min(320).max(1920).optional(),
	renderHeight: z.number().int().min(320).max(2400).optional(),
	renderScale: z.number().min(1).max(2).optional(),
	background: z.string().optional(),
});

const htmlToCanvasInputSchema = z.preprocess((val: any) => {
	// Alias 'prompt' to 'brief' which is what the workflow expects
	if (val && typeof val === "object" && val.prompt && !val.brief) {
		return { ...val, brief: val.prompt };
	}
	return val;
}, baseSchema);

export const htmlToCanvasTool = createTool({
	id: "html-to-canvas",
	description:
		"DESIGN tool. Generate HTML/CSS from a high-level text brief and render it to an image. Use this for 'Make a poster' or 'Design a landing page'. Do NOT pass raw HTML/CSS code here; use 'render-html' for that.",
	inputSchema: htmlToCanvasInputSchema,
	outputSchema: canvasToolOutputSchema,
	execute: async ({ context }) => {
		const { renderWidth, renderHeight, renderScale, background, ...htmlInput } =
			context;

		// Explicit check to help confused agents
		if ((htmlInput as any).html || (htmlInput as any).css) {
			throw new Error(
				"html-to-canvas does not accept raw HTML/CSS. Use 'render-html' tool for direct code rendering, or provide only a 'brief' for design generation.",
			);
		}

		const htmlResult = await htmlGeneratorWorkflow.run(htmlInput);

		const renderResult = await htmlRenderWorkflow.run({
			html: htmlResult.html,
			css: htmlResult.css,
			width: renderWidth ?? 1200,
			height: renderHeight ?? 1600,
			scale: renderScale ?? 1,
			background,
		});

		return {
			command: {
				type: "add-image" as const,
				url: renderResult.imageUrl,
				width: renderResult.width,
				height: renderResult.height,
				meta: {
					provider: "html-render",
				},
			},
			data: {
				bytes: renderResult.bytes,
				rationale: htmlResult.rationale,
				source: "html-to-canvas",
				components: htmlResult.components,
			},
			message: "Rendered HTML added to canvas",
		};
	},
});
