import { z } from "zod";

export const workflowRequestedEvent = "studio.workflow.requested" as const;
export const brandKnowledgeIngestedEvent = "brand.knowledge.ingested" as const;
export const processFashionItemEvent = "studio/process-fashion-item" as const;
export const visionArchiveRequestedEvent = "vision.archive.requested" as const;

export const brandKnowledgeIngestedSchema = z.object({
	workspaceId: z.string(),
	assetId: z.string(),
	url: z.string().url(),
	filename: z.string(),
});

export type BrandKnowledgeIngested = z.infer<
	typeof brandKnowledgeIngestedSchema
>;

export const visionArchiveRequestedSchema = z.object({
	imageUrl: z.string().url(),
	imageHash: z.string(),
	metadata: z.record(z.string(), z.unknown()),
});

export type VisionArchiveRequested = z.infer<
	typeof visionArchiveRequestedSchema
>;

export const workflowRequestedSchema = z.object({
	runId: z.string(),
	workflowId: z.string(),
	projectId: z.string(),
	userId: z.string(),
	idempotencyKey: z.string(),
	nodes: z
		.array(
			z.object({
				id: z.string(),
				position: z.object({ x: z.number(), y: z.number() }),
				type: z.string().optional(),
				data: z
					.object({
						label: z.string().optional(),
						description: z.string().optional(),
						status: z.string().optional(),
						pluginId: z.string().optional(),
						pluginVersion: z.string().optional(),
						executor: z.enum(["native", "inngest", "python-e2b"]).optional(),
						config: z.record(z.string(), z.unknown()).optional(),
						icon: z.string().optional(),
					})
					.passthrough()
					.optional(),
			}),
		)
		.default([]),
	edges: z
		.array(
			z
				.object({
					id: z.string().optional(),
					source: z.string(),
					target: z.string(),
					animated: z.boolean().optional(),
					markerEnd: z.record(z.string(), z.unknown()).optional(),
				})
				.passthrough(),
		)
		.default([]),
	input: z.record(z.string(), z.unknown()).optional(),
});

export type WorkflowRequested = z.infer<typeof workflowRequestedSchema>;

export const processFashionItemSchema = z.object({
	jobId: z.string(),
	imageUrl: z.string().url(),
	referenceImage: z.string(),
	timestamp: z.number(),
	maxAttempts: z.number().optional(),
});

export type ProcessFashionItem = z.infer<typeof processFashionItemSchema>;
