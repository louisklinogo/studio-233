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
		const run = await backgroundRemovalWorkflow.createRunAsync();
		const result = await run.start({
			inputData: { imageUrl: context.imageUrl },
		});

		if (result.status !== "success") {
			throw new Error("Background removal workflow failed");
		}

		const verifyStep = result.steps["verify-quality"];
		if (verifyStep?.status === "success") {
			return verifyStep.output;
		}

		const removalStep = result.steps["remove-background"];
		if (removalStep?.status === "success") {
			return removalStep.output;
		}

		throw new Error("Background removal workflow produced no output");
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
		const run = await objectIsolationWorkflow.createRunAsync();
		const result = await run.start({
			inputData: {
				imageUrl: context.imageUrl,
				prompt: context.prompt,
			},
		});

		if (result.status !== "success") {
			throw new Error("Object isolation workflow failed");
		}

		const isolationStep = result.steps["isolate-object"];
		if (isolationStep?.status === "success") {
			return isolationStep.output;
		}

		throw new Error("Object isolation workflow produced no output");
	},
});
