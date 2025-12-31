import { createHash } from "node:crypto";
import {
	generateAgentResponse,
	streamAgentResponse,
} from "@studio233/ai/runtime";
import { generateThreadTitle } from "@studio233/ai/runtime/titling";
import { uploadImageBufferToBlob } from "@studio233/ai/utils/blob-storage";
import { getSessionWithRetry } from "@studio233/auth/lib/session";
import { resolveBrandContext } from "@studio233/brand";
import { prisma as db, Prisma } from "@studio233/db";
import { inngest } from "@studio233/inngest";
import { list } from "@vercel/blob";
import { waitUntil } from "@vercel/functions";
import { convertToModelMessages } from "ai";

export async function POST(req: Request) {
	try {
		const { messages, canvas, maxSteps, threadId } = await req.json();
		const headers = new Headers(req.headers);

		// 1. Parallel Read: Start Session and Thread fetch immediately
		const sessionPromise = getSessionWithRetry(headers);
		let threadPromise: Promise<any> | undefined;
		if (threadId) {
			threadPromise = db.agentThread.findUnique({
				where: { id: threadId },
				include: { project: { select: { workspaceId: true } } },
			});
		}

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
				// Optimization: If it's already a blob URL, just return it.
				if (
					base64.startsWith("https://") &&
					base64.includes(".blob.vercel-storage.com")
				) {
					return base64;
				}

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
		 */
		const ingestImagesInHistory = async (msgs: any[]): Promise<string[]> => {
			const ingestionPromises: Promise<void>[] = [];

			for (const msg of msgs) {
				if (!msg.content || !Array.isArray(msg.content)) continue;

				for (const part of msg.content) {
					if (
						part.type === "file" &&
						typeof part.mediaType === "string" &&
						part.mediaType.startsWith("image/")
					) {
						const data = part.data;
						if (
							typeof data === "string" &&
							(data.startsWith("data:") ||
								(/^[A-Za-z0-9+/=]+$/.test(data) && data.length > 100))
						) {
							ingestionPromises.push(
								ingestBase64(data, part.mediaType).then((url) => {
									if (url) part.data = url;
								}),
							);
						} else if (data instanceof Uint8Array || Buffer.isBuffer(data)) {
							const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
							const hash = createHash("sha256").update(buffer).digest("hex");
							const prefix = `vision/ingest/${hash}`;

							ingestionPromises.push(
								uploadImageBufferToBlob(buffer, {
									contentType: part.mediaType,
									prefix,
									filename: "source.bin",
								}).then((url) => {
									if (url) part.data = url;
								}),
							);
						}
					}

					if (part.type === "image") {
						const image = part.image;
						if (typeof image === "string" && image.startsWith("data:")) {
							ingestionPromises.push(
								ingestBase64(image, "image/png").then((url) => {
									if (url) part.image = url;
								}),
							);
						} else if (image instanceof Uint8Array || Buffer.isBuffer(image)) {
							const buffer = Buffer.isBuffer(image)
								? image
								: Buffer.from(image);
							const hash = createHash("sha256").update(buffer).digest("hex");
							const prefix = `vision/ingest/${hash}`;

							ingestionPromises.push(
								uploadImageBufferToBlob(buffer, {
									contentType: "image/png",
									prefix,
									filename: "source.bin",
								}).then((url) => {
									if (url) part.image = url;
								}),
							);
						}
					}
				}
			}

			if (ingestionPromises.length > 0) {
				await Promise.all(ingestionPromises);
			}

			const allUrls: string[] = [];
			for (const msg of msgs) {
				if (!msg.content || !Array.isArray(msg.content)) continue;
				for (const part of msg.content) {
					if (
						part.type === "file" &&
						typeof part.data === "string" &&
						part.data.startsWith("http")
					) {
						if (!allUrls.includes(part.data)) allUrls.push(part.data);
					}
					if (part.type === "image") {
						if (
							typeof part.image === "string" &&
							part.image.startsWith("http")
						) {
							if (!allUrls.includes(part.image)) allUrls.push(part.image);
						} else if (part.image instanceof URL) {
							const urlStr = part.image.toString();
							if (!allUrls.includes(urlStr)) allUrls.push(urlStr);
						}
					}
				}
			}

			return allUrls;
		};

		const latestImageUrls = await ingestImagesInHistory(coreMessages);
		const latestImageUrl = latestImageUrls[latestImageUrls.length - 1];

		// Await session and thread now
		const session = await sessionPromise;
		const thread = threadPromise ? await threadPromise : null;

		// Determine Workspace ID for context
		let workspaceId: string | undefined;
		if (thread?.project?.workspaceId) {
			workspaceId = thread.project.workspaceId;
		} else if (canvas?.projectId) {
			const project = await db.project.findUnique({
				where: { id: canvas.projectId },
				select: { workspaceId: true },
			});
			workspaceId = project?.workspaceId ?? undefined;
		}

		// Parallel Brand Context Resolution
		const lastMessage = coreMessages[coreMessages.length - 1];
		const userMessageContent =
			lastMessage?.role === "user" ? lastMessage.content : "";
		const queryStr =
			typeof userMessageContent === "string" ? userMessageContent : "";

		let brandContext;
		if (workspaceId) {
			brandContext = await resolveBrandContext(workspaceId, queryStr);
		}

		let currentThreadId = threadId;
		const userMessageToPersist =
			lastMessage?.role === "user" ? lastMessage.content : null;

		// 1. Handle Thread Creation/Validation
		if (!currentThreadId) {
			const initialTitle =
				messages[0]?.content?.slice(0, 50) || "New Conversation";

			const newThread = await db.$transaction(async (tx) => {
				const t = await tx.agentThread.create({
					data: {
						title: initialTitle,
						userId: session?.user?.id,
						projectId: canvas?.projectId,
					},
				});

				if (userMessageToPersist) {
					await tx.agentMessage.create({
						data: {
							threadId: t.id,
							role: "USER",
							content: userMessageToPersist as any,
						},
					});
				}
				return t;
			});

			currentThreadId = newThread.id;

			if (messages[0]?.content && typeof messages[0].content === "string") {
				waitUntil(
					generateThreadTitle(messages[0].content)
						.then(async (betterTitle) => {
							await db.agentThread.update({
								where: { id: (newThread as any).id },
								data: { title: betterTitle },
							});
						})
						.catch((err) => console.error("Titling Background Error:", err)),
				);
			}
		} else {
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

			if (userMessageToPersist) {
				await db.agentMessage.create({
					data: {
						threadId: currentThreadId,
						role: "USER",
						content: userMessageToPersist as any,
					},
				});
			}
		}

		// 3. Run Agent Stream
		const stream = await streamAgentResponse("orchestrator", {
			messages: coreMessages,
			maxSteps,
			brandContext,
			abortSignal: req.signal,
			onToolCall: async (toolCall) => {
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
						.catch(() => {});
				}
			},
			onFinish: async ({ response }) => {
				const newMessages = response.messages;

				for (const msg of newMessages) {
					let role: "ASSISTANT" | "TOOL" = "ASSISTANT";
					if (msg.role === "tool") role = "TOOL";

					await db.agentMessage.create({
						data: {
							threadId: currentThreadId,
							role: role,
							content: msg.content as any,
						},
					});

					if (msg.role === "tool") {
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
									.catch(() => {});
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
									.catch(() => {});
							}
						}
					}
				}
			},
			metadata: {
				context: {
					canvas,
					latestImageUrl,
					latestImageUrls,
					threadId: currentThreadId,
					workspaceId,
					runtimeContext: {
						runAgent: generateAgentResponse,
						inngest,
					},
				},
			},
		});

		return stream.toUIMessageStreamResponse({
			sendSources: true,
			headers: {
				"X-Thread-Id": currentThreadId,
			},
		});
	} catch (error) {
		console.error("Chat API Error:", error);

		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			["P1001", "P1002", "P2024"].includes(error.code)
		) {
			return new Response(
				JSON.stringify({ error: "Service Unavailable: Database overloaded" }),
				{
					status: 503,
					headers: {
						"Content-Type": "application/json",
						"Retry-After": "5",
					},
				},
			);
		}

		return new Response(JSON.stringify({ error: "Internal Server Error" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
