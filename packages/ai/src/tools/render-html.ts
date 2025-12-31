import { z } from "zod";
import { canvasToolOutputSchema } from "../schemas/tool-output";
import { htmlRenderWorkflow } from "../workflows/html-render";
import { createTool } from "./factory";

export const renderHtmlTool = createTool({
	id: "render-html",
	description:
		"Render raw HTML and CSS code to an image on the canvas. Use this when you have specific code to render. Do NOT use for generating designs from scratch.",
	inputSchema: z.object({
		html: z.string().describe("The full HTML string to render"),
		css: z.string().describe("The full CSS string to style the HTML"),
		renderWidth: z.number().int().min(320).max(1920).default(1200),
		renderHeight: z.number().int().min(320).max(2400).default(1600),
		renderScale: z.number().min(1).max(2).default(1),
		background: z.string().optional().describe("Optional CSS background value"),
	}),
	outputSchema: canvasToolOutputSchema,
	execute: async ({ context }) => {
		const { html, css, renderWidth, renderHeight, renderScale, background } =
			context;

		const renderResult = await htmlRenderWorkflow.run({
			html,
			css,
			width: renderWidth,
			height: renderHeight,
			scale: renderScale,
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
				source: "render-html",
			},
			message: "Rendered provided HTML to canvas",
		};
	},
});
