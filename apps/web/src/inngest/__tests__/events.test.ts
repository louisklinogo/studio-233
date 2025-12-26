import { describe, expect, it } from "bun:test";
import { visionArchiveRequestedSchema } from "../events";

describe("Inngest Events Schema", () => {
	it("should validate vision.archive.requested payload", () => {
		const payload = {
			imageUrl: "https://example.com/image.jpg",
			imageHash: "abc123hash",
			metadata: {
				scene: "A minimalist office",
				palette: ["#ffffff", "#000000"],
			},
		};

		const result = visionArchiveRequestedSchema.safeParse(payload);
		expect(result.success).toBe(true);
	});
});
