import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { type CoreMessage, generateText, stepCountIs, streamText } from "ai";

import { getEnv } from "../config";
import { getModelConfig } from "../model-config";
import { logger } from "../utils/logger";
import {
	AGENT_DEFINITIONS,
	type AgentKey,
	getAgentName,
	resolveAgentKeyByName,
} from "./agent-config";
import { buildToolset } from "./tools";
import type { AgentRunOptions } from "./types";

export type { AgentKey } from "./agent-config";
export {
	AGENT_DEFINITIONS,
	getAgentName,
	resolveAgentKeyByName,
} from "./agent-config";
export { generateThreadTitle } from "./titling";
export type { AgentMessage, AgentRunOptions, ToolCallInfo } from "./types";

const env = getEnv();

if (!env.googleApiKey) {
	throw new Error(
		"GOOGLE_GENERATIVE_AI_API_KEY (or GEMINI_API_KEY) must be set to run agents",
	);
}

const google = createGoogleGenerativeAI({ apiKey: env.googleApiKey });

function buildMessages(options: AgentRunOptions): CoreMessage[] {
	if (options.messages?.length) {
		return options.messages as CoreMessage[];
	}
	if (options.prompt) {
		return [{ role: "user", content: options.prompt }];
	}
	throw new Error("Either prompt or messages are required");
}

function getModel(agentKey: AgentKey) {
	const agent = AGENT_DEFINITIONS[agentKey];
	const modelConfig = getModelConfig(agent.model);

	// Create runtime context with recursive agent capability
	const runtimeContext = {
		runAgent: generateAgentResponse,
	};

	return {
		model: google(modelConfig.model),
		temperature: modelConfig.temperature,
		prompt: agent.prompt,
		tools:
			agent.tools.length > 0
				? buildToolset(agent.tools, runtimeContext)
				: undefined,
	};
}

function shouldForceVisionAnalysis(messages: CoreMessage[]): boolean {
	const hasImage = messages.some((msg) => {
		if (msg.role !== "user") return false;
		const content: any = msg.content;
		if (!Array.isArray(content)) return false;
		return content.some((part: any) => {
			if (part?.type === "image") return true;
			return (
				part?.type === "file" &&
				typeof part.mediaType === "string" &&
				part.mediaType.startsWith("image/")
			);
		});
	});
	if (!hasImage) return false;

	const lastUser = [...messages].reverse().find((m) => m.role === "user");
	if (!lastUser) return false;

	const text = (() => {
		const content: any = lastUser.content;
		if (typeof content === "string") return content;
		if (!Array.isArray(content)) return "";
		return content
			.map((part: any) => (part?.type === "text" ? part.text : ""))
			.join(" ")
			.trim();
	})();

	return /\b(what\s+is\s+this|what'?s\s+this|describe|analy[sz]e|identify|what\s+am\s+i\s+looking\s+at)\b/i.test(
		text,
	);
}

/**
 * Resolve the maximum number of reasoning steps for an agent.
 * Uses sensible defaults per agent type but allows explicit overrides.
 */
export function resolveStepLimit(
	agentKey: AgentKey,
	maxStepsOverride?: number,
): number {
	const agent = AGENT_DEFINITIONS[agentKey];
	const limits: Record<string, number> = {
		orchestrator: 10, // Needs room for delegation and coordination
		research: 8, // Multiple search + extract + analyze steps
		vision: 5, // Typically 1-2 tool chains
		motion: 5, // Video workflows are usually linear
		batch: 3, // Simple planning steps
		general: 5, // Default fallback
	};
	const defaultLimit = limits[agent.model] ?? limits.general;
	return typeof maxStepsOverride === "number" ? maxStepsOverride : defaultLimit;
}

export async function generateAgentResponse(
	agentKey: AgentKey,
	options: AgentRunOptions,
) {
	const agent = AGENT_DEFINITIONS[agentKey];
	if (!agent) {
		throw new Error(`Unknown agent key: ${agentKey}`);
	}

	const model = getModel(agentKey);
	const messages = buildMessages(options);
	const latestImageUrl =
		options.metadata?.context && typeof options.metadata.context === "object"
			? ((options.metadata.context as any).latestImageUrl as string | undefined)
			: undefined;

	// Inject awareness of the latest image and decision logic into the system prompt
	const systemPrompt = latestImageUrl
		? `${model.prompt}\n\n[System Note]: A reference image is available: ${latestImageUrl}. 
        - For "what is this?" or "describe this", call \`visionAnalysis\`.
        - For variations (e.g., "make this a woman"), YOU must call \`canvasTextToImage\` directly.
        - When calling \`canvasTextToImage\` for a variation, YOU MUST provide BOTH a new \`prompt\` AND the \`referenceImageUrl\`: "${latestImageUrl}".
        - You MAY assume the output aspect ratio matches this reference image unless specified otherwise.`
		: model.prompt;

	const forceVisionAnalysis =
		!!model.tools &&
		"visionAnalysis" in model.tools &&
		!!latestImageUrl &&
		shouldForceVisionAnalysis(messages);
	const maxSteps = resolveStepLimit(agentKey, options.maxSteps);
	const prepareStep = forceVisionAnalysis
		? ({ stepNumber }: { stepNumber: number }) => {
				if (stepNumber === 0) {
					return {
						toolChoice: { type: "tool", toolName: "visionAnalysis" },
					} as any;
				}
				return { toolChoice: "auto" } as any;
			}
		: undefined;

	const result = await generateText({
		model: model.model,
		temperature: model.temperature,
		system: systemPrompt,
		messages,
		tools: model.tools,
		prepareStep,
		stopWhen: stepCountIs(maxSteps),
		experimental_context: options.metadata?.context,
		onStepFinish: (step) => {
			if (step.toolCalls && step.toolCalls.length > 0) {
				logger.info(`agent.${agentKey}.step_finish`, {
					toolCalls: step.toolCalls.map((tc) => ({
						name: tc.toolName,
						args: tc.args,
					})),
					finishReason: step.finishReason,
				});
			}
		},
	});

	return {
		text: result.text,
		finishReason: result.finishReason,
		toolCalls: result.toolCalls,
		toolResults: result.toolResults,
		agent: agent.name,
		messages: result.response?.messages,
	};
}

export function streamAgentResponse(
	agentKey: AgentKey,
	options: AgentRunOptions,
) {
	const agent = AGENT_DEFINITIONS[agentKey];
	if (!agent) {
		throw new Error(`Unknown agent key: ${agentKey}`);
	}

	const model = getModel(agentKey);
	const messages = buildMessages(options);
	const maxSteps = resolveStepLimit(agentKey, options.maxSteps);
	const latestImageUrl =
		options.metadata?.context && typeof options.metadata.context === "object"
			? ((options.metadata.context as any).latestImageUrl as string | undefined)
			: undefined;

	// Inject awareness of the latest image and decision logic into the system prompt
	const systemPrompt = latestImageUrl
		? `${model.prompt}\n\n[System Note]: A reference image is available: ${latestImageUrl}. 
        - For "what is this?" or "describe this", call \`visionAnalysis\`.
        - For variations (e.g., "make this a woman"), YOU must call \`canvasTextToImage\` directly.
        - When calling \`canvasTextToImage\` for a variation, YOU MUST provide BOTH a new \`prompt\` AND the \`referenceImageUrl\`: "${latestImageUrl}".
        - You MAY assume the output aspect ratio matches this reference image unless specified otherwise.`
		: model.prompt;

	const forceVisionAnalysis =
		!!model.tools &&
		"visionAnalysis" in model.tools &&
		!!latestImageUrl &&
		shouldForceVisionAnalysis(messages);
	const prepareStep = forceVisionAnalysis
		? ({ stepNumber }: { stepNumber: number }) => {
				if (stepNumber === 0) {
					return {
						toolChoice: { type: "tool", toolName: "visionAnalysis" },
					} as any;
				}
				return { toolChoice: "auto" } as any;
			}
		: undefined;

	return streamText({
		model: model.model,
		temperature: model.temperature,
		system: systemPrompt,
		messages,
		tools: model.tools,
		prepareStep,
		stopWhen: stepCountIs(maxSteps),
		onStepFinish: async ({ toolCalls, toolResults, finishReason }) => {
			if (toolCalls && toolCalls.length > 0) {
				logger.info(`agent.${agentKey}.stream_step_finish`, {
					toolCalls: toolCalls.map((tc) => ({
						name: tc.toolName,
						args: tc.args,
					})),
					finishReason,
				});
			}

			// Invoke callback for each tool call if provided
			if (options.onToolCall && toolCalls.length > 0) {
				for (const toolCall of toolCalls) {
					const matchingResult = toolResults.find(
						(r) => r.toolCallId === toolCall.toolCallId,
					);
					await options.onToolCall({
						toolCallId: toolCall.toolCallId,
						name: toolCall.toolName,
						// Use type assertion for args property (may be 'args' or 'input' depending on AI SDK version)
						arguments:
							(toolCall as { args?: unknown }).args ??
							(toolCall as { input?: unknown }).input,
						result: matchingResult
							? (matchingResult as { result?: unknown }).result
							: undefined,
					});
				}
			}
		},
		onFinish: options.onFinish,
		experimental_context: options.metadata?.context,
	});
}
