import { mastra } from "@studio233/ai";
import { type NextRequest, NextResponse } from "next/server";

const AGENT_MAP: Record<string, string> = {
	orchestrate: "Studio Orchestrator",
	vision: "Vision Forge",
	motion: "Motion Director",
	insight: "Insight Researcher",
	batch: "Batch Ops",
};

type Payload = {
	prompt?: string;
	messages?: Array<{ role: "user" | "assistant" | "system"; content: string }>;
	metadata?: {
		threadId?: string;
		resourceId?: string;
		context?: Record<string, unknown>;
	};
};

export async function POST(
	req: NextRequest,
	{ params }: { params: { agent: string } },
) {
	const agentName = AGENT_MAP[params.agent];
	if (!agentName) {
		return NextResponse.json(
			{ error: `Unknown agent '${params.agent}'` },
			{ status: 404 },
		);
	}

	const agent = mastra.getAgent(agentName);
	const body = (await req.json()) as Payload;
	const threadId = body.metadata?.threadId ?? "web-session";
	const resourceId = body.metadata?.resourceId ?? params.agent;

	if (!body.prompt && !body.messages?.length) {
		return NextResponse.json(
			{ error: "Either prompt or messages must be provided" },
			{ status: 400 },
		);
	}

	if (body.messages?.length) {
		const stream = await agent.stream(body.messages, {
			memory: { thread: threadId, resource: resourceId },
			runtimeContext: body.metadata?.context,
		});
		const chunks: string[] = [];
		for await (const part of stream.textStream) {
			chunks.push(part);
		}
		return NextResponse.json({ text: chunks.join(""), agent: agentName });
	}

	const result = await agent.generate(body.prompt!, {
		memory: { thread: threadId, resource: resourceId },
		runtimeContext: body.metadata?.context,
	});
	return NextResponse.json({ text: result.text, agent: agentName });
}
