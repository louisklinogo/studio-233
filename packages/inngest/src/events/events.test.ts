import { describe, expect, it } from "bun:test";
import {
	brandIntelligenceSyncEvent,
	brandIntelligenceSyncSchema,
	brandKnowledgeIngestedSchema,
	brandVisionSyncSchema,
} from "./events";

describe("Inngest Events & Schemas", () => {
	it("should validate brandKnowledgeIngestedSchema with classification", () => {
		const validData = {
			workspaceId: "ws_123",
			assetId: "ast_123",
			url: "https://example.com/image.png",
			filename: "image.png",
			classification: "CORE_BRAND_MARK",
		};
		const result = brandKnowledgeIngestedSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it("should fail brandKnowledgeIngestedSchema without classification", () => {
		const invalidData = {
			workspaceId: "ws_123",
			assetId: "ast_123",
			url: "https://example.com/image.png",
			filename: "image.png",
		};
		const result = brandKnowledgeIngestedSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
	});

	it("should validate brandIntelligenceSyncSchema", () => {
		const validData = {
			workspaceId: "ws_123",
		};
		const result = brandIntelligenceSyncSchema.safeParse(validData);
		expect(result.success).toBe(true);
		expect(brandIntelligenceSyncEvent).toBe(
			"brand.intelligence.sync_requested",
		);
	});

	it("should validate brandVisionSyncSchema with classification", () => {
		const validData = {
			workspaceId: "ws_123",
			assetId: "ast_123",
			url: "https://example.com/image.png",
			filename: "image.png",
			classification: "INDEX_AS_INSPIRATION",
		};
		const result = brandVisionSyncSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});
});
