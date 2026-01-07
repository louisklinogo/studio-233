"use server";

import { type AgentKey, generateAgentResponse } from "@studio233/ai/runtime";

type AgentResponse = {
	text: string;
	agent: string;
};

const AGENT_LABELS: Record<AgentKey, string> = {
	orchestrator: "Studio Orchestrator",
	vision: "Vision Forge",
	motion: "Motion Director",
	insight: "Insight Researcher",
	"visual-scout": "Visual Scout",
};

async function callAgent(
	agentKey: AgentKey,
	payload: { prompt: string; threadId?: string; resourceId?: string },
): Promise<AgentResponse> {
	const result = await generateAgentResponse(agentKey, {
		prompt: payload.prompt,
		metadata: {
			context: {
				threadId: payload.threadId ?? "server-action",
				resourceId: payload.resourceId ?? agentKey,
			},
		},
	});
	return { text: result.text, agent: AGENT_LABELS[agentKey] };
}

export const runOrchestrator = (input: {
	brief: string;
	threadId?: string;
	resourceId?: string;
}) =>
	callAgent("orchestrator", {
		prompt: input.brief,
		threadId: input.threadId,
		resourceId: input.resourceId,
	});

export const runVisionForge = (input: {
	brief: string;
	threadId?: string;
	resourceId?: string;
}) =>
	callAgent("vision", {
		prompt: input.brief,
		threadId: input.threadId,
		resourceId: input.resourceId,
	});

export const runMotionDirector = (input: {
	brief: string;
	threadId?: string;
	resourceId?: string;
}) =>
	callAgent("motion", {
		prompt: input.brief,
		threadId: input.threadId,
		resourceId: input.resourceId,
	});

export const runInsightResearcher = (input: {
	brief: string;
	threadId?: string;
	resourceId?: string;
}) =>
	callAgent("insight", {
		prompt: input.brief,
		threadId: input.threadId,
		resourceId: input.resourceId,
	});

export const runVisualScout = (input: {
	brief: string;
	threadId?: string;
	resourceId?: string;
}) =>
	callAgent("visual-scout", {
		prompt: input.brief,
		threadId: input.threadId,
		resourceId: input.resourceId,
	});
