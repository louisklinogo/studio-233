import { z } from "zod";
import { createTool } from "./factory";

const AGENT_IDS = ["vision", "motion", "insight", "batch"] as const;
type AgentId = (typeof AGENT_IDS)[number];

const agentAliasMap: Record<string, AgentId> = {
	vision: "vision",
	"vision forge": "vision",
	"vision-forge": "vision",
	motion: "motion",
	"motion director": "motion",
	"motion-director": "motion",
	insight: "insight",
	"insight researcher": "insight",
	"insight-researcher": "insight",
	research: "insight",
	researcher: "insight",
	batch: "batch",
	"batch ops": "batch",
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
			.min(1, "Task description is required")
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

		if (!task || task.trim().length === 0) {
			return {
				result: "Error: No task provided for delegation.",
			};
		}

		if (!runtimeContext?.runAgent) {
			return {
				result: "Error: Agent runtime not available for delegation.",
			};
		}

		try {
			console.log(
				`[Delegation] Routing to ${agent} with task: "${task.substring(0, 50)}..."`,
			);
			const delegatedContext: Record<string, unknown> = {};
			if (runtimeContext && typeof runtimeContext === "object") {
				const rt = runtimeContext as any;
				if (rt.latestImageUrl) {
					delegatedContext.latestImageUrl = rt.latestImageUrl;
				}
				if (rt.threadId) delegatedContext.threadId = rt.threadId;
				if (rt.resourceId) delegatedContext.resourceId = rt.resourceId;
				if (rt.canvas) delegatedContext.canvas = rt.canvas;
			}

			// If we have a latestImageUrl but the task doesn't mention it,
			// we can append it to the task or rely on the agent's system prompt.
			// The Vision agent prompt says: "USE IT FIRST when users ask 'describe this'..."
			// and "If the user attached an image, you can call visionAnalysis without an imageUrl"

			// Call the sub-agent using the injected runtime
			const response = await runtimeContext.runAgent(agent, {
				prompt: task,
				metadata:
					Object.keys(delegatedContext).length > 0
						? { context: delegatedContext }
						: undefined,
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
