import { z } from "zod";
import { createTool } from "./factory";

const AGENT_IDS = ["vision", "motion", "insight", "batch"] as const;
type AgentId = (typeof AGENT_IDS)[number];

const agentAliasMap: Record<string, AgentId> = {
	vision: "vision",
	motion: "motion",
	insight: "insight",
	"insight researcher": "insight",
	research: "insight",
	researcher: "insight",
	batch: "batch",
};

const agentSchema = z
	.string()
	.min(1, "Agent is required")
	.transform((value) => value.trim().toLowerCase())
	.refine((value) => value in agentAliasMap, {
		message: `Invalid agent. Expected one of: ${AGENT_IDS.join(", ")}`,
	})
	.transform((value) => agentAliasMap[value]);

export const delegateToAgentTool = createTool({
	id: "delegateToAgent",
	description:
		"Delegate a complex subtask to a specialized agent (Vision, Motion, Insight/Research, Batch). Use this when the request requires specific expertise not available in your own toolkit.",
	inputSchema: z.object({
		agent: agentSchema,
		task: z
			.string()
			.describe(
				"The specific natural language instructions for the specialized agent.",
			),
	}),
	outputSchema: z.object({
		result: z.string(),
		toolCalls: z.array(z.any()).optional(),
		toolResults: z.array(z.any()).optional(),
	}),
	execute: async ({ context, runtimeContext }) => {
		const { agent, task } = context;

		if (!runtimeContext?.runAgent) {
			return {
				result: "Error: Agent runtime not available for delegation.",
			};
		}

		try {
			// Call the sub-agent using the injected runtime
			const response = await runtimeContext.runAgent(agent, {
				prompt: task,
			});

			return {
				result: response.text,
				toolCalls: response.toolCalls,
				toolResults: response.toolResults,
			};
		} catch (error) {
			return {
				result: `Delegation failed: ${error instanceof Error ? error.message : String(error)}`,
			};
		}
	},
});
