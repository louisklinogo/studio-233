import { createHash } from "node:crypto";
import {
	generateAgentResponse,
	streamAgentResponse,
} from "@studio233/ai/runtime";
import { generateThreadTitle } from "@studio233/ai/runtime/titling";
import { uploadImageBufferToBlob } from "@studio233/ai/utils/blob-storage";
import { getSessionWithRetry } from "@studio233/auth/lib/session";
import { prisma as db } from "@studio233/db";
import { list } from "@vercel/blob";
import { convertToModelMessages } from "ai";

export async function POST(req: Request) {
	try {
		const { messages, canvas, maxSteps, threadId } = await req.json();
		const headers = new Headers(req.headers);
		const session = await getSessionWithRetry(headers);

		// Convert to CoreMessage[] directly - convertToModelMessages handles tool messages
		const coreMessages = await convertToModelMessages(messages as any);

		const parseBase64DataUrl = (
			dataUrl: string,
		): { mediaType: string; buffer: Buffer } | null => {
			const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
			if (!match) return null;

			const mediaType = match[1] ?? "application/octet-stream";
			const buffer = Buffer.from(match[2] ?? "", "base64");
			return { mediaType, buffer };
		};

		const getLatestBlobUrl = async (prefix: string): Promise<string | null> => {
			try {
				const { blobs } = await list({ prefix, limit: 10 });
				if (!blobs.length) return null;

				const [latest] = [...blobs].sort((a, b) => {
					const aTime = new Date((a as any).uploadedAt ?? 0).getTime();
					const bTime = new Date((b as any).uploadedAt ?? 0).getTime();
					return bTime - aTime;
				});

				return latest?.url ?? null;
			} catch (err) {
				return null;
			}
		};

		const ingestBase64 = async (
			base64: string,
			mediaType: string,
		): Promise<string | null> => {
			try {
				const parsed = parseBase64DataUrl(
					base64.startsWith("data:")
						? base64
						: `data:${mediaType};base64,${base64}`,
				);
				if (!parsed) return null;

				const hash = createHash("sha256").update(parsed.buffer).digest("hex");
				const prefix = `vision/ingest/${hash}`;

				// FAST PATH: Try deterministic check
				const deterministicUrl = `https://2lkalc8atjuztgjx.public.blob.vercel-storage.com/${prefix}/source.bin`;
				try {
					const headRes = await fetch(deterministicUrl, { method: "HEAD" });
					if (headRes.ok) return deterministicUrl;
				} catch (e) {
					// fallback to list
				}

				const existing = await getLatestBlobUrl(`${prefix}/`);
				if (existing) return existing;

				return await uploadImageBufferToBlob(parsed.buffer, {
					contentType: parsed.mediaType,
					prefix,
					filename: "source.bin", // Ensure future deterministic lookups work
				});
			} catch (error) {
				console.warn("Failed to ingest base64 image:", error);
				return null;
			}
		};

		/**
		 * Ingests all base64 images in the message history and replaces them with Blob URLs.
		 * This prevents sending massive payloads to the agent and resolves downstream fetch errors.
		 */
		const ingestImagesInHistory = async (
			msgs: any[],
		): Promise<string | null> => {
			let latestUrl: string | null = null;

			for (const msg of msgs) {
				if (!msg.content || !Array.isArray(msg.content)) continue;

				for (const part of msg.content) {
					// Handle 'file' parts (often sent by clients for attachments)
					if (
						part.type === "file" &&
						typeof part.mediaType === "string" &&
						part.mediaType.startsWith("image/")
					) {
						const data = part.data;
						if (typeof data !== "string") continue;

						if (data.startsWith("http")) {
							latestUrl = data;
						} else if (
							data.startsWith("data:") ||
							(/^[A-Za-z0-9+/=]+$/.test(data) && data.length > 100)
						) {
							const url = await ingestBase64(data, part.mediaType);
							if (url) {
								part.data = url; // Swap in the message history
								latestUrl = url;
							}
						}
					}

					// Handle 'image' parts (standard AI SDK format)
					if (part.type === "image") {
						const image = part.image;
						if (typeof image === "string" && image.startsWith("data:")) {
							const url = await ingestBase64(image, "image/png");
							if (url) {
								part.image = url; // Swap in the message history
								latestUrl = url;
							}
						} else if (typeof image === "string" && image.startsWith("http")) {
							latestUrl = image;
						} else if (image instanceof URL) {
							latestUrl = image.toString();
						}
					}
				}
			}
			return latestUrl;
		};

		const latestImageUrl = await ingestImagesInHistory(coreMessages);

		let currentThreadId = threadId;

		// 1. Handle Thread Creation/Validation
		if (!currentThreadId) {
			// Create new thread with immediate fallback
			const initialTitle =
				messages[0]?.content?.slice(0, 50) || "New Conversation";
			const thread = await db.agentThread.create({
				data: {
					title: initialTitle,
					userId: session?.user?.id,
				},
			});
			currentThreadId = thread.id;

			// Trigger AI Title Generation in background
			if (messages[0]?.content && typeof messages[0].content === "string") {
				generateThreadTitle(messages[0].content)
					.then(async (betterTitle) => {
						await db.agentThread.update({
							where: { id: thread.id },
							data: { title: betterTitle },
						});
					})
					.catch((err) => console.error("Titling Background Error:", err));
			}
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
			abortSignal: req.signal,
			onToolCall: async (toolCall) => {
				// Persist tool call request
				// Note: Tool calls are also part of the final assistant message structure,
				// but saving them individually allows real-time tracking if needed.
				// For now, we rely on the final message persistence for the complete record,
				// OR we can keep this for granular status updates.
				// The schema has `AgentToolCall`, let's use it.
				const now = new Date();
				const args = (toolCall.arguments ?? {}) as any;

				await db.agentToolCall.upsert({
					where: { id: toolCall.toolCallId },
					create: {
						id: toolCall.toolCallId,
						threadId: currentThreadId,
						name: toolCall.name,
						arguments: args,
						status: "RUNNING",
					},
					update: {
						name: toolCall.name,
						arguments: args,
						status: "RUNNING",
					},
				});

				// If the runtime provides a result at this stage, persist it immediately.
				if (toolCall.result !== undefined) {
					await db.agentToolCall
						.update({
							where: { id: toolCall.toolCallId },
							data: {
								status: "SUCCEEDED",
								result: toolCall.result as any,
								completedAt: now,
							},
						})
						.catch(() => {
							// Ignore if tool call wasn't found (e.g. race condition)
						});
				}
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
								const output =
									("output" in part ? part.output : undefined) ??
									("result" in part ? part.result : undefined);
								await db.agentToolCall
									.update({
										where: { id: part.toolCallId },
										data: {
											status: "SUCCEEDED",
											result: output as any,
											completedAt: new Date(),
										},
									})
									.catch(() => {
										// Ignore if tool call wasn't found (e.g. race condition or created differently)
									});
								continue;
							}

							if (part.type === "tool-error") {
								const raw =
									("error" in part ? (part as any).error : undefined) ?? part;
								const message =
									raw && typeof raw === "object" && "message" in raw
										? String((raw as any).message)
										: typeof raw === "string"
											? raw
											: "Tool execution failed";

								const status = message.toLowerCase().includes("timed out")
									? "TIMED_OUT"
									: "FAILED";

								await db.agentToolCall
									.update({
										where: { id: part.toolCallId },
										data: {
											status,
											result: { error: raw } as any,
											completedAt: new Date(),
										},
									})
									.catch(() => {
										// Ignore if tool call wasn't found
									});
							}
						}
					}
				}
			},
			metadata: {
				context: {
					canvas,
					latestImageUrl,
					threadId: currentThreadId,
					runtimeContext: {
						runAgent: generateAgentResponse,
					},
				},
			},
		});

		// Return UI message (data) stream so tool parts are preserved
		return stream.toUIMessageStreamResponse({
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
