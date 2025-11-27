import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import type { CanvasCommand } from "../types/canvas";
import { runWorkflow } from "../utils/run-workflow";
import { textToImageWorkflow } from "../workflows/text-to-image";

const textToImageInputSchema = textToImageWorkflow.inputSchema;
type TextToImageInput = z.infer<typeof textToImageInputSchema>;

type TextToImageOutput = z.infer<typeof textToImageWorkflow.outputSchema>;

export const canvasTextToImageTool = createTool({
	id: "canvas-text-to-image",
	description:
		"Generate a new image from text for placement on the Studio+233 canvas.",
	inputSchema: textToImageInputSchema,
	outputSchema: z.object({
		command: z.object({
			type: z.literal("add-image"),
			url: z.string().url(),
			width: z.number(),
			height: z.number(),
			originalImageId: z.string().optional(),
			meta: z
				.object({
					prompt: z.string().optional(),
					modelId: z.string().optional(),
					loraUrl: z.string().optional(),
					provider: z.enum(["fal", "gemini"]).optional(),
				})
				.optional(),
		}),
	}),
	execute: async ({ context }, { writer }) => {
		const input = context as TextToImageInput;

		const result = await runWorkflow<TextToImageInput, TextToImageOutput>(
			textToImageWorkflow,
			input,
		);

		const command: CanvasCommand = {
			type: "add-image",
			url: result.url,
			width: result.width,
			height: result.height,
			meta: {
				prompt: input.prompt,
				modelId: input.modelId,
				loraUrl: input.loraUrl,
				provider: result.provider,
			},
		};

		// Stream a UI data part that the frontend can consume to update the canvas.
		await writer?.custom({
			type: "data-canvas-command",
			data: command,
		});

		return { command };
	},
});
