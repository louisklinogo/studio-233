import { generateAgentResponse, streamAgentResponse } from "@studio233/ai";
import { getSessionWithRetry } from "@studio233/auth/lib/session";
import { prisma as db } from "@studio233/db";
import { convertToCoreMessages } from "ai";

export async function POST(req: Request) {
	try {
		const { messages, canvas, maxSteps, threadId } = await req.json();
		const headers = new Headers(req.headers);
		const session = await getSessionWithRetry(headers);

		// Convert to CoreMessage[] for better compatibility
		const coreMessages = convertToCoreMessages(messages);

		let currentThreadId = threadId;

		// 1. Handle Thread Creation/Validation
		if (!currentThreadId) {
			// Create new thread if none provided
			const thread = await db.agentThread.create({
				data: {
					title: messages[0]?.content?.slice(0, 50) || "New Conversation",
					userId: session?.user?.id, // Optional: link to user if logged in
				},
			});
			currentThreadId = thread.id;
		} else {
			// If provided, ensure it exists and user has access (if session exists)
			const thread = await db.agentThread.findUnique({
				where: { id: currentThreadId },
			});

			if (!thread) {
				return new Response(JSON.stringify({ error: "Thread not found" }), {
					status: 404,
				});
			}

			if (
				session?.user?.id &&
				thread.userId &&
				thread.userId !== session.user.id
			) {
				return new Response(JSON.stringify({ error: "Unauthorized" }), {
					status: 401,
				});
			}
		}

		// 2. Persist the NEW User Message
		// We assume the last message in the array is the new one from the user
		const lastMessage = coreMessages[coreMessages.length - 1];
		if (lastMessage && lastMessage.role === "user") {
			await db.agentMessage.create({
				data: {
					threadId: currentThreadId,
					role: "USER",
					content: lastMessage.content as any, // Store strict content
				},
			});
		}

		// 3. Run Agent Stream
		const stream = streamAgentResponse("orchestrator", {
			messages: coreMessages,
			maxSteps,
			onToolCall: async (toolCall) => {
				// Persist tool call request
				// Note: Tool calls are also part of the final assistant message structure,
				// but saving them individually allows real-time tracking if needed.
				// For now, we rely on the final message persistence for the complete record,
				// OR we can keep this for granular status updates.
				// The schema has `AgentToolCall`, let's use it.
				await db.agentToolCall.create({
					data: {
						id: toolCall.toolCallId,
						threadId: currentThreadId,
						name: toolCall.name,
						arguments: toolCall.arguments as any,
						status: "REQUESTED",
					},
				});
			},
			onFinish: async ({ response }) => {
				// 4. Persist Generated Assistant Messages (including tool calls/results)
				// response.messages contains the *newly generated* messages
				const newMessages = response.messages;

				for (const msg of newMessages) {
					// Map role to enum
					let role: "ASSISTANT" | "TOOL" = "ASSISTANT";
					if (msg.role === "tool") role = "TOOL";

					// For tool messages, content is array of results
					// For assistant messages, content is text + tool calls

					await db.agentMessage.create({
						data: {
							threadId: currentThreadId,
							role: role,
							content: msg.content as any,
							// If it's an assistant message with tool calls, we might want to link them?
							// The schema puts `toolCallId` on the message.
							// But `AgentMessage` has one `toolCallId` field (optional).
							// A message can have multiple tool calls.
							// Our schema might be designed for 1:1 or 1:N differently.
							// Schema: `toolCall AgentToolCall? @relation(...)` -> 1:1.
							// This implies `AgentMessage` with role TOOL is linked to ONE tool call.
							// But `Assistant` message can *request* multiple tools.
							// The `content` JSON will store the full structure.
						},
					});

					// If it was a tool call, update the status in AgentToolCall table
					if (msg.role === "tool") {
						// msg.content is array of tool results.
						// We need to iterate and update.
						// content: [{ type: 'tool-result', toolCallId: '...', result: ... }]
						const contentArray = Array.isArray(msg.content)
							? msg.content
							: [msg.content];
						for (const part of contentArray) {
							if (part.type === "tool-result") {
								await db.agentToolCall
									.update({
										where: { id: part.toolCallId },
										data: {
											status: "SUCCEEDED",
											result: part.result as any,
											completedAt: new Date(),
										},
									})
									.catch(() => {
										// Ignore if tool call wasn't found (e.g. race condition or created differently)
									});
							}
						}
					}
				}
			},
			metadata: {
				context: {
					canvas,
					runtimeContext: {
						runAgent: generateAgentResponse,
					},
				},
			},
		});

		// Return stream with threadId header so client knows the ID
		return stream.toTextStreamResponse({
			headers: {
				"X-Thread-Id": currentThreadId,
			},
		});
	} catch (error) {
		console.error("Chat API Error:", error);

		return new Response(JSON.stringify({ error: "Internal Server Error" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
