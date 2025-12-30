import { describe, expect, test } from "bun:test";
import {
	brandKnowledgeIngestedSchema,
	visionArchiveRequestedSchema,
	visionCleanupRequestedSchema,
	workflowRequestedSchema,
} from "../events";

describe("Inngest Event Schemas", () => {
	test("visionCleanupRequestedSchema validates correct data", () => {
		const validData = {
			path: "/tmp/vision-123",
		};
		const result = visionCleanupRequestedSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	test("brandKnowledgeIngestedSchema validates correct data", () => {
		const validData = {
			workspaceId: "ws_123",
			assetId: "ast_456",
			url: "https://example.com/image.png",
			filename: "image.png",
		};
		const result = brandKnowledgeIngestedSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	test("brandKnowledgeIngestedSchema fails on invalid URL", () => {
		const invalidData = {
			workspaceId: "ws_123",
			assetId: "ast_456",
			url: "invalid-url",
			filename: "image.png",
		};
		const result = brandKnowledgeIngestedSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
	});

	test("visionArchiveRequestedSchema validates correct data", () => {
		const validData = {
			imageUrl: "https://example.com/image.png",
			imageHash: "hash123",
			metadata: { key: "value" },
		};
		const result = visionArchiveRequestedSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	test("workflowRequestedSchema validates correct data", () => {
		const validData = {
			runId: "run_1",
			workflowId: "wf_1",
			projectId: "prj_1",
			userId: "usr_1",
			idempotencyKey: "key_1",
			nodes: [],
			edges: [],
		};
		const result = workflowRequestedSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});
});
