import { createScorer } from "@mastra/core/scores";
import {
	createCompletenessScorer,
	createToolCallAccuracyScorerCode,
} from "@mastra/evals/scorers/code";
import { z } from "zod";

export const toolComplianceScorer = createToolCallAccuracyScorerCode({
	expectedTool: "*",
	strictMode: false,
});

export const completenessScorer = createCompletenessScorer();

export const routingDecisionScorer = createScorer({
	name: "Routing Decision Quality",
	description:
		"Grades whether the orchestrator picked the best downstream agent/tool",
	type: "agent",
	judge: {
		model: "google/gemini-2.5-pro",
		instructions:
			"Evaluate agent routing choices. Return JSON with score, reasoning, and suggested agent if incorrect.",
	},
})
	.preprocess(({ run }) => ({
		prompt: (run.input?.inputMessages?.[0]?.content as string) ?? "",
		response: (run.output?.[0]?.content as string) ?? "",
	}))
	.analyze({
		description: "Assess routing quality",
		outputSchema: z.object({
			score: z.number().min(0).max(1).default(0.5),
			reason: z.string().default(""),
			suggestedAgent: z.string().optional(),
		}),
		createPrompt: ({
			results,
		}) => `Prompt: ${results.preprocessStepResult.prompt}
	Response: ${results.preprocessStepResult.response}
	Return JSON with score (0-1), reason, suggestedAgent.`,
	})
	.generateScore(
		({ results }) => (results as any)?.analyzeStepResult?.score ?? 0.5,
	)
	.generateReason(
		({ results }) => (results as any)?.analyzeStepResult?.reason ?? "",
	);

export const scorers = {
	toolComplianceScorer,
	completenessScorer,
	routingDecisionScorer,
};
