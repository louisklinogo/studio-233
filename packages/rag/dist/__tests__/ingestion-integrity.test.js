import { describe, expect, it, mock } from "bun:test";
import { brandTextIngestionService } from "../ingestion";

// Mock llamaindex
mock.module("llamaindex", () => {
	return {
		Document: class {
			constructor(options) {
				this.text = options.text;
				this.metadata = options.metadata;
			}
		},
		storageContextFromDefaults: async () => ({}),
		VectorStoreIndex: {
			fromDocuments: async (docs) => {
				// Verify docs have updatedAt
				for (const doc of docs) {
					if (!doc.metadata.updatedAt) {
						throw new Error("Missing updatedAt in metadata");
					}
				}
				return {};
			},
		},
	};
});
// Mock @llamaindex/postgres
mock.module("@llamaindex/postgres", () => {
	return {
		PGVectorStore: class {
			constructor() {}
		},
	};
});
describe("Ingestion Integrity", () => {
	it("should ensure updatedAt is populated in document metadata", async () => {
		const options = {
			text: "test brand data",
			workspaceId: "ws_123",
			assetId: "ast_456",
			filename: "test.txt",
			dbUrl: "postgres://fake",
		};
		// If this doesn't throw, it means VectorStoreIndex.fromDocuments
		// received docs with updatedAt (see mock above)
		await brandTextIngestionService(options);
		expect(true).toBe(true);
	});
});
