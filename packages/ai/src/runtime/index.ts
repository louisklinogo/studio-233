import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { type CoreMessage, generateText, stepCountIs, streamText } from "ai";

import { getEnv } from "../config";
import { getModelConfig } from "../model-config";
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
	return {
		model: google(modelConfig.model),
		temperature: modelConfig.temperature,
		prompt: agent.prompt,
		tools: agent.tools.length > 0 ? buildToolset(agent.tools) : undefined,
	};
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

	const result = await generateText({
		model: model.model,
		temperature: model.temperature,
		system: model.prompt,
		messages,
		tools: model.tools,
		experimental_context: options.metadata?.context,
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

	return streamText({
		model: model.model,
		temperature: model.temperature,
		system: model.prompt,
		messages,
		tools: model.tools,
		stopWhen: stepCountIs(maxSteps),
		onStepFinish: async ({ toolCalls, toolResults }) => {
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
		experimental_context: options.metadata?.context,
	});
}
