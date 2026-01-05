import { describe, expect, it } from "bun:test";
import { proposePlanTool } from "../tools/planning";
import { webSearchTool } from "../tools/research";

describe("Schema Resilience", () => {
	describe("proposePlan", () => {
		it("should map 'description' to 'label' in steps if 'label' is missing", () => {
			const input = {
				task: "Test Task",
				steps: [
					{
						id: "step1",
						description: "Do the thing", // Hallucinated field
						toolName: "webSearch",
					},
				],
			};
			const parsed = proposePlanTool.inputSchema.safeParse(input);
			expect(parsed.success).toBe(true);
			if (parsed.success) {
				expect(parsed.data.steps[0].label).toBe("Do the thing");
			}
		});

		it("should preserve 'details' and 'description' if both are provided", () => {
			const input = {
				task: "Test Task",
				steps: [
					{
						id: "step1",
						label: "The Label",
						description: "The Description",
						details: "The Details",
					},
				],
			};
			const parsed = proposePlanTool.inputSchema.safeParse(input);
			expect(parsed.success).toBe(true);
			if (parsed.success) {
				expect(parsed.data.steps[0].label).toBe("The Label");
				expect(parsed.data.steps[0].description).toBe("The Description");
				expect(parsed.data.steps[0].details).toBe("The Details");
			}
		});
	});

	describe("webSearch", () => {
		it("should allow 'query' as a string", () => {
			const input = { query: "search terms" };
			const parsed = webSearchTool.inputSchema.safeParse(input);
			expect(parsed.success).toBe(true);
			if (parsed.success) {
				expect(parsed.data.query).toBe("search terms");
			}
		});

		it("should normalize 'queries' array to a single 'query' string", () => {
			const input = {
				queries: ["query one", "query two"],
			};
			const parsed = webSearchTool.inputSchema.safeParse(input);
			expect(parsed.success).toBe(true);
			if (parsed.success) {
				expect(parsed.data.query).toContain("query one");
				expect(parsed.data.query).toContain("query two");
			}
		});
	});
});
