import { z } from "zod";
import { createTool } from "./factory";

export const proposePlanTool = createTool({
	id: "proposePlan",
	description:
		"Propose a structured execution plan for a complex, multi-step creative task. Call this tool FIRST before executing any other tools for complex requests.",
	inputSchema: z.object({
		task: z.string().describe("High-level summary of the overall goal"),
		description: z
			.string()
			.optional()
			.describe("Brief context about the strategy"),
		requiresApproval: z
			.boolean()
			.default(false)
			.describe(
				"If true, the agent will pause and wait for user confirmation before executing the plan.",
			),
		steps: z
			.array(
				z.object({
					id: z
						.string()
						.describe("Unique ID for the step (e.g. 'search', 'generate')"),
					label: z.string().describe("Human-readable name of the step"),
					details: z
						.string()
						.optional()
						.describe("Technical details of the operation"),
					toolName: z
						.string()
						.optional()
						.describe(
							"The name of the tool this step corresponds to (helps UI linking)",
						),
				}),
			)
			.describe("The sequence of operations to be performed"),
	}),
	outputSchema: z.object({
		plan: z.any(),
	}),
	execute: async ({ context }) => {
		// This tool is primarily for UI state. We just return the context
		// so the frontend can render the plan part.
		return {
			plan: context,
			status: "success",
		};
	},
});
