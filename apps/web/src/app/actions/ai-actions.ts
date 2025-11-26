"use server";

import { mastra } from "@studio233/ai";

type AgentResponse = {
	text: string;
	agent: string;
};

async function callAgent(
	agentName: string,
	payload: { prompt: string; threadId?: string; resourceId?: string },
): Promise<AgentResponse> {
	const agent = mastra.getAgent(agentName);
	const result = await agent.generate(payload.prompt, {
		memory: {
			thread: payload.threadId ?? "server-action",
			resource: payload.resourceId ?? agentName,
		},
	});
	return { text: result.text, agent: agentName };
}

export const runOrchestrator = (input: {
	brief: string;
	threadId?: string;
	resourceId?: string;
}) =>
	callAgent("Studio Orchestrator", {
		prompt: input.brief,
		threadId: input.threadId,
		resourceId: input.resourceId,
	});

export const runVisionForge = (input: {
	brief: string;
	threadId?: string;
	resourceId?: string;
}) =>
	callAgent("Vision Forge", {
		prompt: input.brief,
		threadId: input.threadId,
		resourceId: input.resourceId,
	});

export const runMotionDirector = (input: {
	brief: string;
	threadId?: string;
	resourceId?: string;
}) =>
	callAgent("Motion Director", {
		prompt: input.brief,
		threadId: input.threadId,
		resourceId: input.resourceId,
	});

export const runInsightResearcher = (input: {
	brief: string;
	threadId?: string;
	resourceId?: string;
}) =>
	callAgent("Insight Researcher", {
		prompt: input.brief,
		threadId: input.threadId,
		resourceId: input.resourceId,
	});

export const runBatchOps = (input: {
	brief: string;
	threadId?: string;
	resourceId?: string;
}) =>
	callAgent("Batch Ops", {
		prompt: input.brief,
		threadId: input.threadId,
		resourceId: input.resourceId,
	});
