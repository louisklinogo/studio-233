import { toAISdkFormat } from "@mastra/ai-sdk";
import { mastra } from "@studio233/ai";
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";

export async function POST(req: Request) {
	try {
		const { messages, canvas } = await req.json();

		const agent = mastra.getAgent("orchestratorAgent");

		if (!agent) {
			return new Response(JSON.stringify({ error: "Agent not found" }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
		}

		const agentStream = await agent.stream(messages, {
			// canvas context can later be threaded into tools via runtimeContext
			// when running Mastra in server mode. For now we simply keep it
			// attached to this request scope.
			// runtimeContext: canvas,
		});

		const uiMessageStream = createUIMessageStream({
			async execute({ writer }) {
				const formatted = toAISdkFormat(agentStream, {
					from: "agent",
				}) as any;
				for await (const part of formatted as AsyncIterable<any>) {
					await writer.write(part as any);
				}
			},
		});

		return createUIMessageStreamResponse({ stream: uiMessageStream });
	} catch (error) {
		console.error("Chat API Error:", error);

		return new Response(JSON.stringify({ error: "Internal Server Error" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
