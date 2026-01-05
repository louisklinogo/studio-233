import { describe, expect, it } from "bun:test";
import { multimodalIngestionService } from "../multimodal-service";

describe("multimodalIngestionService", () => {
	it("should exist and throw error for not implemented", async () => {
		// @ts-ignore - Partial mock input for now
		expect(multimodalIngestionService({} as any)).rejects.toThrow(
			"Not implemented",
		);
	});
});
