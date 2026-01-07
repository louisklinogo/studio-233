import { z } from "zod";
import { canvasToolOutputSchema } from "../schemas/tool-output";
import { htmlRenderWorkflow } from "../workflows/html-render";
import { createTool } from "./factory";

export const renderHtmlTool = createTool({
	id: "renderHtml",
	description:
		"Render raw HTML and CSS code to an image on the canvas. Use this when you have specific code to render. YOU MUST PROVIDE CSS (either in the 'css' field or inline) to ensure professional results. Separate CSS is preferred for complexity.",
	inputSchema: z.object({
		html: z.string().describe("The full HTML string to render"),
		css: z
			.string()
			.optional()
			.describe("The full CSS string to style the HTML"),
		renderWidth: z.number().int().min(320).max(1920).default(1200),
		renderHeight: z.number().int().min(320).max(2400).default(1600),
		renderScale: z.number().min(1).max(2).default(1),
		background: z.string().optional().describe("Optional CSS background value"),
	}),
	outputSchema: canvasToolOutputSchema,
	execute: async ({ context }) => {
		const { html, css, renderWidth, renderHeight, renderScale, background } =
			context;

		// Design Integrity Gate: Ensure the agent is actually designing something
		const hasExternalStyle = css && css.trim().length > 0;
		const hasInlineStyle = html.includes("style=") || html.includes("<style");

		if (!hasExternalStyle && !hasInlineStyle) {
			return {
				result:
					"Design rejected: No styling detected. Visual output requires CSS or inline styles to meet studio standards. Please revise with proper styling.",
				status: "error",
			} as any;
		}

		const renderResult = await htmlRenderWorkflow.run({
			html,
			css: css || "",
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
