import { generateAgentResponse, streamAgentResponse } from "@studio233/ai";
import { prisma as db } from "@studio233/db";
import { convertToModelMessages } from "ai";

export async function POST(req: Request) {
	try {
		const { messages, canvas, maxSteps } = await req.json();

		// Convert UIMessage[] (from useChat) to ModelMessage[] (for streamText)
		const modelMessages = convertToModelMessages(messages);

		// Create a thread if it doesn't exist (basic implementation for now)
		// Ideally, we'd pass threadId, but for this demo, we'll assume a single session context or rely on stateless runs
		// NOTE: Without a persistent thread ID from the client, we can't link tool calls to a thread easily.
		// For now, we'll create a new thread or skip thread linkage if strict ID isn't provided.
		// Let's create a thread for this interaction to store tool calls.
		const thread = await db.agentThread.create({
			data: {
				title: "Chat Session", // Placeholder
			},
		});

		const stream = streamAgentResponse("orchestrator", {
			messages: modelMessages,
			maxSteps,
			onToolCall: async (toolCall) => {
				await db.agentToolCall.create({
					data: {
						id: toolCall.toolCallId,
						threadId: thread.id,
						name: toolCall.name,
						arguments: toolCall.arguments as any,
						status: "REQUESTED",
					},
				});
			},
			metadata: {
				context: {
					canvas,
					// Inject the agent runner into the runtime context so tools can use it
					runtimeContext: {
						runAgent: generateAgentResponse,
					},
				},
			},
		});

		// Add header to associate response with thread if needed, or just return stream
		return stream.toUIMessageStreamResponse();
	} catch (error) {
		console.error("Chat API Error:", error);

		return new Response(JSON.stringify({ error: "Internal Server Error" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
