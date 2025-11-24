import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { backgroundRemovalWorkflow } from "../workflows/background-removal";
import { objectIsolationWorkflow } from "../workflows/object-isolation";

export const backgroundRemovalTool = createTool({
	id: "background-removal",
	description: "Remove background from an image using AI",
	inputSchema: z.object({
		imageUrl: z.string().url().describe("The URL of the image to process"),
	}),
	outputSchema: z.object({
		imageUrl: z.string().url(),
		provider: z.enum(["fal", "gemini"]),
	}),
	execute: async ({ context }) => {
		const result = await backgroundRemovalWorkflow.execute({
			triggerData: { imageUrl: context.imageUrl },
		});
		return (
			result.results["verify-quality"]?.payload ||
			result.results["remove-background"]?.payload
		);
	},
});

export const objectIsolationTool = createTool({
	id: "object-isolation",
	description: "Isolate a specific object from an image using a text prompt",
	inputSchema: z.object({
		imageUrl: z.string().url().describe("The URL of the image to process"),
		prompt: z
			.string()
			.describe(
				"Description of the object to isolate (e.g., 'the red car', 'person in foreground')",
			),
	}),
	outputSchema: z.object({
		imageUrl: z.string().url(),
		maskUrl: z.string().url(),
	}),
	execute: async ({ context }) => {
		const result = await objectIsolationWorkflow.execute({
			triggerData: {
				imageUrl: context.imageUrl,
				prompt: context.prompt,
			},
		});
		return result.results["isolate-object"]?.payload;
	},
});
