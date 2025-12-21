import { z } from "zod";
import { canvasToolOutputSchema } from "../schemas/tool-output";
import type { CanvasCommand } from "../types/canvas";
import { textToImageWorkflow } from "../workflows/text-to-image";
import { createTool } from "./factory";

const textToImageInputSchema = textToImageWorkflow.inputSchema;
type TextToImageInput = z.infer<typeof textToImageInputSchema>;

type TextToImageOutput = z.infer<typeof textToImageWorkflow.outputSchema>;

export const canvasTextToImageTool = createTool({
	id: "canvas-text-to-image",
	description:
		"Generate a new image from a text prompt and dispatch it to the canvas (output.command.type = 'add-image', includes url/width/height/meta). Inputs: prompt (required), optional aspectRatio/size/seed/modelId/loraUrl.",
	inputSchema: textToImageInputSchema,
	outputSchema: canvasToolOutputSchema,
	execute: async ({ context }) => {
		const input = context as TextToImageInput;

		const workflowResult = await textToImageWorkflow.run(input);

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

		if (command.type !== "add-image") {
			throw new Error(
				"Text-to-image workflow returned unexpected command type",
			);
		}

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
