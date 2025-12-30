import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, stepCountIs, streamText } from "ai";

import { getEnv } from "../config";
import { getModelConfig } from "../model-config";
import { logger } from "../utils/logger";
import { withDevTools } from "../utils/model";
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

function buildMessages(options: AgentRunOptions): any[] {
	if (options.messages?.length) {
		return options.messages as any[];
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

	const model = withDevTools(google(modelConfig.model));

	return {
		model,
		temperature: modelConfig.temperature,
		prompt: agent.prompt,
		tools:
			agent.tools.length > 0
				? buildToolset(agent.tools, runtimeContext)
				: undefined,
	};
}

import { robustFetch } from "../utils/http";

type Message = NonNullable<
	Parameters<typeof generateText>[0]["messages"]
>[number];

/**
 * Pre-fetches all image URLs in messages using robustFetch and replaces them with Uint8Array.
 * This prevents the AI SDK from using its internal non-resilient 10s downloader.
 */
export async function hardenImageMessages(
	messages: Message[],
): Promise<Message[]> {
	const hardened = await Promise.all(
		messages.map(async (msg) => {
			if (msg.role !== "user" || !Array.isArray(msg.content)) return msg;

			const hardenedContent = await Promise.all(
				msg.content.map(async (part: any) => {
					if (part?.type === "image") {
						const url =
							part.image instanceof URL ? part.image.toString() : part.image;

						if (typeof url === "string" && url.startsWith("http")) {
							try {
								const response = await robustFetch(url, {
									maxRetries: 3,
									retryDelay: 1000,
									timeoutMs: 20000,
								});
								if (!response.ok) throw new Error(`HTTP ${response.status}`);

								const contentType =
									response.headers.get("content-type") ?? "image/png";
								const buffer = new Uint8Array(await response.arrayBuffer());

								return {
									type: "image",
									image: buffer,
									mimeType: contentType,
								};
							} catch (error) {
								logger.warn("runtime.harden_image_failed", {
									url,
									error: error instanceof Error ? error.message : String(error),
								});
								// Fallback to original (SDK might still try to fetch it)
								return part;
							}
						}

						if (typeof url === "string" && url.startsWith("data:")) {
							try {
								const match = /^data:([^;]+);base64,(.+)$/.exec(url);
								if (match) {
									const contentType = match[1];
									const base64 = match[2];
									const buffer = new Uint8Array(
										Buffer.from(base64 ?? "", "base64"),
									);
									return {
										type: "image",
										image: buffer,
										mimeType: contentType,
									};
								}
							} catch (error) {
								logger.warn("runtime.harden_data_url_failed", {
									error: error instanceof Error ? error.message : String(error),
								});
							}
						}
					}
					return part;
				}),
			);

			return { ...msg, content: hardenedContent };
		}),
	);
	return hardened;
}

function shouldForceVisionAnalysis(messages: Message[]): boolean {
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

	return /\b(what\s+is\s+this|what'?s\s+this|describe|analy[sz]e|identify|what\s+am\s+i\s+looking\s+at|add\s+to\s+chat|use\s+this\s+image|this\s+one)\b/i.test(
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

export function buildSystemPrompt(
	agentKey: AgentKey,
	allUserImages: string[],
): string {
	const agent = AGENT_DEFINITIONS[agentKey];
	const modelConfig = getModelConfig(agent.model);
	let systemPrompt = agent.prompt;

	if (allUserImages.length > 0) {
		const refs = allUserImages.map((url, i) => `[${i + 1}]: ${url}`).join("\n");
		systemPrompt +=
			"\n\n[System Note]: The following reference images are available:\n" +
			refs +
			"\n";

		if (allUserImages.length === 1) {
			systemPrompt +=
				"- For 'what is this?' or 'describe this', call visionAnalysis. ";
			systemPrompt +=
				"- For variations/edits (e.g., 'make this a woman'), call visionAnalysis first, then call canvasTextToImage. ";
			systemPrompt +=
				"- When calling canvasTextToImage for a variation, YOU MUST provide BOTH a new prompt AND the referenceImageUrl: '" +
				allUserImages[0] +
				"'. ";
			systemPrompt +=
				"- You MAY assume the output aspect ratio matches this reference image unless specified otherwise.";
		} else {
			systemPrompt +=
				"- Multiple images detected. Refer to them by index or URL. ";
			systemPrompt +=
				"- To analyze a specific image, pass its URL to `visionAnalysis({ imageUrl: '...' })`. ";
			systemPrompt +=
				"- To edit a specific image, pass its URL as `referenceImageUrl` to `canvasTextToImage`. ";
		}
	}
	return systemPrompt;
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
	const rawMessages = buildMessages(options);
	const messages = await hardenImageMessages(rawMessages);
	const latestImageUrl =
		options.metadata?.context && typeof options.metadata.context === "object"
			? ((options.metadata.context as any).latestImageUrl as string | undefined)
			: undefined;
	const latestImageUrls =
		options.metadata?.context && typeof options.metadata.context === "object"
			? ((options.metadata.context as any).latestImageUrls as
					| string[]
					| undefined)
			: undefined;

	// Collect all user images from messages for multi-image context
	const allUserImages: string[] = [];
	for (const msg of messages) {
		if (msg.role === "user" && Array.isArray(msg.content)) {
			for (const part of msg.content) {
				if (part.type === "image" && part.image instanceof Uint8Array) {
					// We can't put buffer in the system prompt easily, but we already have the URL from latestImageUrls
				} else if (
					part.type === "image" &&
					part.image instanceof URL &&
					part.image.toString().startsWith("http")
				) {
					allUserImages.push(part.image.toString());
				} else if (
					part.type === "image" &&
					typeof part.image === "string" &&
					part.image.startsWith("http")
				) {
					allUserImages.push(part.image);
				}
			}
		}
	}
	// Add URLs from context
	if (latestImageUrls) {
		for (const url of latestImageUrls) {
			if (!allUserImages.includes(url)) allUserImages.push(url);
		}
	} else if (latestImageUrl && !allUserImages.includes(latestImageUrl)) {
		allUserImages.push(latestImageUrl);
	}

	if (allUserImages.length > 0) {
		logger.info("agent.context.latest_image_detected", {
			imageUrl: allUserImages[allUserImages.length - 1],
			count: allUserImages.length,
			agent: agentKey,
		});
	}

	const systemPrompt = buildSystemPrompt(agentKey, allUserImages);

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
		experimental_telemetry: { isEnabled: true },
		...(options.abortSignal ? { abortSignal: options.abortSignal } : {}),
		onStepFinish: (step) => {
			if (step.toolCalls && step.toolCalls.length > 0) {
				logger.info(`agent.${agentKey}.step_finish`, {
					toolCalls: step.toolCalls.map((tc) => ({
						name: tc.toolName,
						args:
							(tc as { args?: unknown; input?: unknown }).args ??
							(tc as { args?: unknown; input?: unknown }).input,
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

export async function streamAgentResponse(
	agentKey: AgentKey,
	options: AgentRunOptions,
) {
	const agent = AGENT_DEFINITIONS[agentKey];
	if (!agent) {
		throw new Error(`Unknown agent key: ${agentKey}`);
	}

	const model = getModel(agentKey);
	const rawMessages = buildMessages(options);
	const messages = await hardenImageMessages(rawMessages);
	const maxSteps = resolveStepLimit(agentKey, options.maxSteps);
	const latestImageUrl =
		options.metadata?.context && typeof options.metadata.context === "object"
			? ((options.metadata.context as any).latestImageUrl as string | undefined)
			: undefined;
	const latestImageUrls =
		options.metadata?.context && typeof options.metadata.context === "object"
			? ((options.metadata.context as any).latestImageUrls as
					| string[]
					| undefined)
			: undefined;

	// Collect all user images from messages for multi-image context
	const allUserImages: string[] = [];
	for (const msg of messages) {
		if (msg.role === "user" && Array.isArray(msg.content)) {
			for (const part of msg.content) {
				if (part.type === "image" && part.image instanceof Uint8Array) {
					// Buffers already processed, we use URLs from context for system prompt
				} else if (
					part.type === "image" &&
					part.image instanceof URL &&
					part.image.toString().startsWith("http")
				) {
					allUserImages.push(part.image.toString());
				} else if (
					part.type === "image" &&
					typeof part.image === "string" &&
					part.image.startsWith("http")
				) {
					allUserImages.push(part.image);
				}
			}
		}
	}
	// Add URLs from context
	if (latestImageUrls) {
		for (const url of latestImageUrls) {
			if (!allUserImages.includes(url)) allUserImages.push(url);
		}
	} else if (latestImageUrl && !allUserImages.includes(latestImageUrl)) {
		allUserImages.push(latestImageUrl);
	}

	if (allUserImages.length > 0) {
		logger.info("agent.context.latest_image_detected", {
			imageUrl: allUserImages[allUserImages.length - 1],
			count: allUserImages.length,
			agent: agentKey,
		});
	}

	const systemPrompt = buildSystemPrompt(agentKey, allUserImages);

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
		...(options.abortSignal ? { abortSignal: options.abortSignal } : {}),
		onStepFinish: async ({ toolCalls, toolResults, finishReason }) => {
			if (toolCalls && toolCalls.length > 0) {
				logger.info(`agent.${agentKey}.stream_step_finish`, {
					toolCalls: toolCalls.map((tc) => ({
						name: tc.toolName,
						args:
							(tc as { args?: unknown; input?: unknown }).args ??
							(tc as { args?: unknown; input?: unknown }).input,
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
		experimental_telemetry: { isEnabled: true },
	});
}
