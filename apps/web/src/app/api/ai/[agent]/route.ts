import {
	type AgentKey,
	generateAgentResponse,
	getAgentName,
	streamAgentResponse,
} from "@studio233/ai";
import { type NextRequest, NextResponse } from "next/server";

const AGENT_MAP: Record<string, AgentKey> = {
	orchestrate: "orchestrator",
	vision: "vision",
	motion: "motion",
	insight: "insight",
	batch: "batch",
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
	const agentKey = AGENT_MAP[params.agent];
	if (!agentKey) {
		return NextResponse.json(
			{ error: `Unknown agent '${params.agent}'` },
			{ status: 404 },
		);
	}
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
		const stream = streamAgentResponse(agentKey, {
			messages: body.messages,
			metadata: {
				context: {
					threadId,
					resourceId,
					...(body.metadata?.context ?? {}),
				},
			},
		});
		const chunks: string[] = [];
		for await (const part of stream.textStream) {
			chunks.push(part);
		}
		return NextResponse.json({
			text: chunks.join(""),
			agent: getAgentName(agentKey) ?? agentKey,
		});
	}

	const result = await generateAgentResponse(agentKey, {
		prompt: body.prompt!,
		metadata: {
			context: {
				threadId,
				resourceId,
				...(body.metadata?.context ?? {}),
			},
		},
	});
	return NextResponse.json({
		text: result.text,
		agent: getAgentName(agentKey) ?? agentKey,
	});
}
