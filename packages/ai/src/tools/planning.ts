import { z } from "zod";
import { createTool } from "./factory";

export const proposePlanTool = createTool({
	id: "proposePlan",
	description:
		"Propose a structured execution plan for a complex, multi-step creative task. Call this tool FIRST before executing any other tools for complex requests. IMPORTANT: All parameters (task, steps, requiresApproval) must be at the root level—do NOT nest them inside a 'plan' object.",
	requireApproval: true,
	inputSchema: z
		.preprocess(
			(val: any) => {
				// Resiliency: If the model nests EVERYTHING inside a 'plan' key (common failure mode),
				// lift it to the root level.
				if (val && typeof val === "object" && "plan" in val && !val.steps) {
					return { ...val.plan, ...val };
				}
				return val;
			},
			z.object({
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
						z
							.preprocess(
								(step: any) => {
									if (step && typeof step === "object") {
										// Resiliency: Normalize toolName if present (e.g. web_search -> webSearch)
										if (step.toolName) {
											step.toolName = step.toolName.replace(
												/[-_]([a-z])/g,
												(g: string) => g[1].toUpperCase(),
											);
										}
										// Resiliency: If 'label' is missing but 'description' exists, map it.
										if (!step.label && step.description) {
											return { ...step, label: step.description };
										}
										// Resiliency: If 'label' is missing but 'details' exists, map it.
										if (!step.label && step.details) {
											return { ...step, label: step.details };
										}
									}
									return step;
								},
								z.object({
									id: z
										.string()
										.describe(
											"Unique ID for the step (e.g. 'search', 'generate')",
										),
									label: z.string().describe("Human-readable name of the step"),
									description: z
										.string()
										.optional()
										.describe(
											"Brief context about the step (aligns with UI PlanDescription)",
										),
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
							.describe("A single step in the execution plan"),
					)
					.describe(
						"The sequence of operations to be performed (REQUIRED array at root level)",
					),
			}),
		)
		.describe(
			"All fields must be at the top level of the input object. Do NOT wrap in a nested 'plan' object.",
		),
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
