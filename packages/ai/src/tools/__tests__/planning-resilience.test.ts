import { describe, expect, it } from "bun:test";
import { proposePlanTool } from "../planning";

describe("Planning Resilience (proposePlan)", () => {
	it("should lift nested 'plan' object to root level", async () => {
		const malformedInput = {
			plan: {
				task: "Test task",
				steps: [{ id: "step1", label: "Step 1", toolName: "webSearch" }],
				requiresApproval: true,
			},
		};

		const parsed = proposePlanTool.inputSchema.parse(malformedInput);

		expect(parsed.task).toBe("Test task");
		expect(parsed.steps[0].id).toBe("step1");
	});

	it("should fail validation for missing required fields", () => {
		const invalidInput = {
			steps: [],
		};

		expect(() => proposePlanTool.inputSchema.parse(invalidInput)).toThrow();
	});
});
