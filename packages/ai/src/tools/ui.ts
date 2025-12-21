import { z } from "zod";
import { createClientTool } from "./factory";

export const askForAspectRatioTool = createClientTool({
	id: "askForAspectRatio",
	description:
		"Ask the user to select an aspect ratio for the image generation. Use this when the user implies a specific shape or when you need clarification on dimensions.",
	inputSchema: z.object({
		message: z
			.string()
			.optional()
			.describe("Optional message to display to the user"),
	}),
});
