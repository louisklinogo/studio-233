import { z } from "zod";
import { canvasToolOutputSchema } from "../schemas/tool-output";
import type { CanvasCommand } from "../types/canvas";
import type { textToImageWorkflow } from "../workflows/text-to-image";
import { createTool } from "./factory";

export const canvasTextToImageTool = createTool({
	id: "canvas-text-to-image",
	description:
		"Generate a new image from a text prompt and dispatch it to the canvas (output.command.type = 'add-image', includes url/width/height/meta). Inputs: prompt (required), optional aspectRatio/size/seed/modelId/loraUrl/referenceImageUrl.",
	inputSchema: z.object({
		prompt: z.string().min(1),
		aspectRatio: z.string().optional(),
		size: z.string().optional(),
		seed: z.number().optional(),
		modelId: z.string().optional(),
		loraUrl: z.string().url().optional(),
		referenceImageUrl: z.string().url().optional(),
		apiKey: z.string().optional(),
	}),
	outputSchema: canvasToolOutputSchema,
	execute: async ({ context }) => {
		const { textToImageWorkflow } = await import("../workflows/text-to-image");
		const workflowResult = await textToImageWorkflow.run(context as any);

		const baseCommand = workflowResult.command;

		if (!baseCommand) {
			throw new Error("Text-to-image workflow did not return a canvas command");
		}

		const command: CanvasCommand = {
			...baseCommand,
			meta: {
				...(baseCommand.meta ?? {}),
				prompt: context.prompt,
				modelId: context.modelId,
				loraUrl: context.loraUrl,
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
