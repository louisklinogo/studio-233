import {
	type AgentKey,
	generateAgentResponse,
	getAgentName,
	streamAgentResponse,
} from "@studio233/ai/runtime";
import { resolveBrandContext } from "@studio233/brand";
import { prisma } from "@studio233/db";
import { type NextRequest, NextResponse } from "next/server";

const AGENT_MAP: Record<string, AgentKey> = {
	orchestrate: "orchestrator",
	vision: "vision",
	motion: "motion",
	insight: "insight",
};

type Payload = {
	prompt?: string;
	messages?: Array<{ role: "user" | "assistant" | "system"; content: string }>;
	maxSteps?: number;
	googleApiKey?: string;
	metadata?: {
		threadId?: string;
		resourceId?: string;
		workspaceId?: string;
		context?: Record<string, unknown>;
	};
};

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ agent: string }> },
) {
	const { agent } = await params;
	const agentKey = AGENT_MAP[agent];
	if (!agentKey) {
		return NextResponse.json(
			{ error: `Unknown agent '${agent}'` },
			{ status: 404 },
		);
	}
	const body = (await req.json()) as Payload;
	const threadId = body.metadata?.threadId ?? "web-session";
	const resourceId = body.metadata?.resourceId ?? agent;
	const googleApiKey = body.googleApiKey;

	// Resolve Workspace ID
	let workspaceId = body.metadata?.workspaceId;
	if (!workspaceId && threadId !== "web-session") {
		const thread = await prisma.agentThread.findUnique({
			where: { id: threadId },
			select: { projectId: true },
		});
		if (thread?.projectId) {
			const project = await prisma.project.findUnique({
				where: { id: thread.projectId },
				select: { workspaceId: true },
			});
			workspaceId = project?.workspaceId ?? undefined;
		}
	}

	// Fetch Brand Context
	let brandContext;
	let browserContextId: string | undefined;
	if (workspaceId) {
		const [bCtx, ws] = await Promise.all([
			resolveBrandContext(workspaceId, body.prompt || ""),
			prisma.workspace.findUnique({
				where: { id: workspaceId },
				select: { browserContextId: true },
			}),
		]);
		brandContext = bCtx;
		browserContextId = ws?.browserContextId ?? undefined;
	}

	if (!body.prompt && !body.messages?.length) {
		return NextResponse.json(
			{ error: "Either prompt or messages must be provided" },
			{ status: 400 },
		);
	}

	if (body.messages?.length) {
		const stream = await streamAgentResponse(agentKey, {
			messages: body.messages,
			maxSteps: body.maxSteps,
			brandContext,
			googleApiKey,
			abortSignal: req.signal,
			metadata: {
				context: {
					threadId,
					resourceId,
					workspaceId,
					sessionId: browserContextId,
					...(body.metadata?.context ?? {}),
					runtimeContext: {
						runAgent: generateAgentResponse,
						workspaceId,
						sessionId: browserContextId,
					},
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
		maxSteps: body.maxSteps,
		brandContext,
		googleApiKey,
		abortSignal: req.signal,
		metadata: {
			context: {
				threadId,
				resourceId,
				workspaceId,
				sessionId: browserContextId,
				...(body.metadata?.context ?? {}),
				runtimeContext: {
					runAgent: generateAgentResponse,
					workspaceId,
					sessionId: browserContextId,
				},
			},
		},
	});
	return NextResponse.json({
		text: result.text,
		agent: getAgentName(agentKey) ?? agentKey,
	});
}
