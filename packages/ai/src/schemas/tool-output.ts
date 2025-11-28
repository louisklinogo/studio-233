import { z } from "zod";

/**
 * Standard protocol for Canvas Commands.
 * This matches the TypeScript type in packages/ai/src/types/canvas.ts
 */
export const canvasCommandSchema = z.discriminatedUnion("type", [
	z.object({
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
				provider: z.string().optional(),
			})
			.optional(),
	}),
	z.object({
		type: z.literal("update-image"),
		id: z.string(),
		url: z.string(),
		meta: z.record(z.string(), z.any()).optional(),
	}),
	z.object({
		type: z.literal("add-video"),
		url: z.string(),
		width: z.number(),
		height: z.number(),
		duration: z.number(),
		meta: z.record(z.string(), z.any()).optional(),
	}),
]);

/**
 * Standard output schema for any tool that drives the Canvas UI.
 * Tools should return an object matching this schema.
 */
export const canvasToolOutputSchema = z
	.object({
		command: canvasCommandSchema.optional(),
		// Allow arbitrary additional data for the agent
		data: z.record(z.string(), z.any()).optional(),
		message: z.string().optional(),
	})
	.passthrough(); // Allow other properties for backward compatibility if needed
