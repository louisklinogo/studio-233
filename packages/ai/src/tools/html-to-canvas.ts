import { z } from "zod";

import { canvasToolOutputSchema } from "../schemas/tool-output";
import { htmlRenderWorkflow } from "../workflows/html-render";
import { htmlGeneratorWorkflow } from "../workflows/layout";
import { createTool } from "./factory";

const htmlToCanvasInputSchema = htmlGeneratorWorkflow.inputSchema.extend({
	renderWidth: z.number().int().min(320).max(1920).optional(),
	renderHeight: z.number().int().min(320).max(2400).optional(),
	renderScale: z.number().min(1).max(2).optional(),
	background: z.string().optional(),
});

export const htmlToCanvasTool = createTool({
	id: "html-to-canvas",
	description: "Generate HTML/CSS and render to an image added to the canvas.",
	inputSchema: htmlToCanvasInputSchema,
	outputSchema: canvasToolOutputSchema,
	execute: async ({ context }) => {
		const { renderWidth, renderHeight, renderScale, background, ...htmlInput } =
			context;

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
				type: "add-image",
				url: renderResult.imageUrl,
				width: renderResult.width,
				height: renderResult.height,
				meta: {
					source: "html-to-canvas",
					provider: "html-render",
					components: htmlResult.components,
				},
			},
			data: {
				bytes: renderResult.bytes,
				rationale: htmlResult.rationale,
			},
			message: "Rendered HTML added to canvas",
		};
	},
});
