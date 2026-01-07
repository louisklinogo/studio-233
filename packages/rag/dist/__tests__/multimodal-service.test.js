import { describe, expect, it } from "bun:test";
import { multimodalIngestionService } from "../multimodal-service";

describe("multimodalIngestionService", () => {
	it("should exist and throw error when no paths succeed", async () => {
		// @ts-ignore - Partial mock input for now
		expect(multimodalIngestionService({})).rejects.toThrow(
			"Multimodal ingestion failed",
		);
	});
});
