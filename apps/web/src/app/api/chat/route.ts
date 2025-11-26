import { toAISdkFormat } from "@mastra/ai-sdk";
import { mastra } from "@studio233/ai";
import { createUIMessageStream, createUIMessageStreamResponse } from "ai";

export async function POST(req: Request) {
	try {
		const { messages } = await req.json();

		const agent = mastra.getAgent("orchestratorAgent");

		if (!agent) {
			return new Response(JSON.stringify({ error: "Agent not found" }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
		}

		const agentStream = await agent.stream(messages);

		const uiMessageStream = createUIMessageStream({
			async execute({ writer }) {
				for await (const part of toAISdkFormat(agentStream, {
					from: "agent",
				})!) {
					writer.write(part);
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
