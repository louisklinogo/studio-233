import { z } from "zod";
import { createTool } from "./factory";

export const batchJobPlannerTool = createTool({
	id: "batch-job-planner",
	description: "Create executable batches for repetitive vision operations",
	inputSchema: z.object({
		jobs: z.array(
			z.object({
				assetId: z.string(),
				sourceUrl: z.string().url(),
				tasks: z.array(
					z.enum([
						"background-removal",
						"object-isolation",
						"image-reframe",
						"image-upscale",
					]),
				),
				metadata: z.record(z.string(), z.any()).optional(),
			}),
		),
		priority: z.enum(["low", "normal", "high"]).default("normal"),
	}),
	outputSchema: z.object({
		batchId: z.string(),
		queued: z.number(),
		recommendations: z.array(z.string()),
	}),
	execute: async ({ context }) => {
		const recommendations = context.jobs.map(
			(job) =>
				`Process ${job.assetId} with tasks: ${job.tasks.join(", ")} (source: ${job.sourceUrl})`,
		);
		return {
			batchId: `batch_${Date.now()}`,
			queued: context.jobs.length,
			recommendations,
		};
	},
});
