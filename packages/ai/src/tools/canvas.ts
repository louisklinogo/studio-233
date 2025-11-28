import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { canvasToolOutputSchema } from "../schemas/tool-output";
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
	outputSchema: canvasToolOutputSchema,
	execute: async ({ context }, { writer }) => {
		const input = context as TextToImageInput;

		const workflowResult = await runWorkflow<
			TextToImageInput,
			TextToImageOutput
		>(textToImageWorkflow, input);

		const baseCommand = workflowResult.command;

		if (!baseCommand) {
			throw new Error("Text-to-image workflow did not return a canvas command");
		}

		const command: CanvasCommand = {
			...baseCommand,
			meta: {
				...(baseCommand.meta ?? {}),
				prompt: input.prompt,
				modelId: input.modelId,
				loraUrl: input.loraUrl,
			},
		};

		// Stream a UI data part that the frontend can consume to update the canvas.
		await writer?.custom({
			type: "data-canvas-command",
			data: command,
		});

		return {
			command,
			message: "Image dispatched to canvas",
			data: {
				provider: command.meta?.provider,
				width: command.width,
				height: command.height,
			},
		};
	},
});
