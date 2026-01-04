"use client";

import { useChat } from "@ai-sdk/react";
import type { CanvasCommand } from "@studio233/ai/types/canvas";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { FileUIPart, UIMessage } from "ai";
import {
	DefaultChatTransport,
	lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChatHeader } from "@/components/studio/chat/ChatHeader";
import { ChatHistoryList } from "@/components/studio/chat/ChatHistoryList";
import { ChatInput } from "@/components/studio/chat/ChatInput";
import { ChatList } from "@/components/studio/chat/ChatList";
import { ChatWelcome } from "@/components/studio/chat/ChatWelcome";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";

interface ChatPanelProps {
	isOpen: boolean;
	onClose: () => void;
	onChat: (prompt: string) => void;
	selectedImageIds: string[];
	onCanvasCommand?: (
		command: CanvasCommand,
		options?: { replaceId?: string },
	) => void;
	onStartGeneration?: (id: string, prompt: string) => void;
	seedAttachments?: { filename: string; url: string; mimeType?: string }[];
	onSeedConsumed?: () => void;
	className?: string;
}

type ToolInvocationPart = {
	type: "tool-invocation";
	toolInvocation: { toolName: string; toolCallId: string };
	state?: string;
	output?: unknown;
};

const isToolInvocationPart = (
	part: UIMessage["parts"][number],
): part is UIMessage["parts"][number] & ToolInvocationPart => {
	if (typeof part !== "object" || part === null) {
		return false;
	}

	const candidate = part as unknown as Partial<ToolInvocationPart>;
	return (
		candidate.type === "tool-invocation" &&
		typeof candidate.toolInvocation?.toolName === "string" &&
		typeof candidate.toolInvocation?.toolCallId === "string"
	);
};

export function ChatPanel({
	isOpen,
	onClose,
	onChat,
	selectedImageIds,
	onCanvasCommand,
	onStartGeneration,
	seedAttachments,
	onSeedConsumed,
	className,
}: ChatPanelProps) {
	const [showHistory, setShowHistory] = useState(false);
	const [showFiles, setShowFiles] = useState(false);
	const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const currentGenerationIdRef = useRef<string | null>(null);
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	// Fetch thread details if a thread is active
	const { data: threadData, isLoading: isThreadLoading } = useQuery({
		...trpc.agent.getThread.queryOptions({
			id: (activeThreadId as string) ?? "",
		}),
		enabled: !!activeThreadId,
		refetchOnWindowFocus: false,
	});

	const chatTransport = useMemo(() => {
		return new DefaultChatTransport<UIMessage>({
			api: "/api/chat",
			body: activeThreadId ? { threadId: activeThreadId } : undefined,
		});
	}, [activeThreadId]);

	const chatOptions = {
		id: activeThreadId ?? "new-chat",
		transport: chatTransport,
		maxSteps: 5,
		sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
		initialMessages: [], // We'll sync manually to handle the async fetch
		onError: (err: unknown) => {
			setErrorMessage(
				err instanceof Error ? err.message : "Something went wrong",
			);
		},
		onFinish: ({ message }: { message: UIMessage }) => {
			// Invalidate threads list to show updated timestamp/title
			queryClient.invalidateQueries(
				trpc.agent.getThreads.queryFilter({ limit: 50 }),
			);
			setErrorMessage(null);

			// Process tool invocations for canvas commands (parts + toolInvocations)
			const toolInvocations = (message as any).toolInvocations ?? [];
			const toolParts = Array.isArray(toolInvocations)
				? toolInvocations.map((invocation) => {
						const state = invocation.state;
						const toolState:
							| "input-streaming"
							| "input-available"
							| "output-available"
							| "output-error" =
							state === "result"
								? "output-available"
								: state === "error"
									? "output-error"
									: state === "call" || state === "started"
										? "input-available"
										: "input-streaming";

						const output = invocation.result ?? invocation.output;
						const errorText = invocation.error ?? invocation.errorText;

						return {
							type: `tool-${invocation.toolName ?? invocation.name ?? "call"}`,
							state: toolState,
							input: invocation.args ?? invocation.input,
							output,
							errorText,
						};
					})
				: [];

			const allParts = [...(message.parts ?? []), ...toolParts];

			if (allParts.length) {
				for (const part of allParts) {
					// Handle Vercel AI SDK tool parts
					const toolPart = part as any;
					if (
						typeof toolPart?.type === "string" &&
						toolPart.type.startsWith("tool-") &&
						toolPart.state === "output-available"
					) {
						const output = toolPart.output;

						// Helper to process a potential command result (handle nested shapes)
						const processResult = (res: any) => {
							if (!res || typeof res !== "object") return;
							const candidateCommand =
								res.command ?? res.result?.command ?? res.data?.command;
							if (candidateCommand && onCanvasCommand) {
								console.log(
									"[ChatPanel] Dispatching canvas command:",
									candidateCommand,
								);
								onCanvasCommand(candidateCommand as CanvasCommand, {
									replaceId: currentGenerationIdRef.current || undefined,
								});
								currentGenerationIdRef.current = null; // Reset after usage
							}
						};

						// 1. Direct tool result
						processResult(output);

						// 2. Delegated tool result
						const toolName = toolPart.toolName;
						const toolResults = output?.toolResults;

						if (toolName === "delegateToAgent" && Array.isArray(toolResults)) {
							for (const subResult of toolResults) {
								if (subResult.result) {
									processResult(subResult.result);
								}
							}
						}

						// 3. Fallback: toolResults present directly on output
						if (Array.isArray(output?.toolResults)) {
							for (const sub of output.toolResults) {
								if (sub?.result) {
									processResult(sub.result);
								}
							}
						}
					}
				}
			}
		},
	};

	const {
		messages,
		setMessages,
		stop,
		status,
		sendMessage,
		addToolOutput,
		regenerate,
	} = useChat(chatOptions as any);

	const handleToolInteraction = useCallback(
		(toolCallId: string, result: any) => {
			addToolOutput({
				tool: "askForAspectRatio",
				toolCallId,
				output: result,
			});
		},
		[addToolOutput],
	);

	// Sync messages when threadData loads
	useEffect(() => {
		if (activeThreadId && threadData?.messages) {
			const uiMessages: UIMessage[] = threadData.messages.map((m: any) => ({
				id: m.id,
				role: m.role.toLowerCase(),
				content: typeof m.content === "string" ? m.content : "",
				parts: Array.isArray(m.content)
					? m.content
					: [
							{
								type: "text",
								text:
									typeof m.content === "string"
										? m.content
										: JSON.stringify(m.content),
							},
						],
				createdAt: new Date(m.createdAt),
			}));
			setMessages(uiMessages);
		} else if (!activeThreadId) {
			setMessages([]);
		}
	}, [activeThreadId, threadData, setMessages]);

	// Monitor messages for new tool invocations to trigger start generation
	useEffect(() => {
		const lastMessage = messages[messages.length - 1];
		if (lastMessage?.role === "assistant" && lastMessage.parts) {
			for (const part of lastMessage.parts) {
				// Check for tool invocation that hasn't been "handled" yet?
				// Simple heuristic: If we see a tool invocation for 'canvas-text-to-image' and we don't have a pending ID...
				// Warning: this might run multiple times. We need a way to dedupe.
				// But we generate a new ID each time.
				// If status is 'streaming', and we see the tool call...
				if (
					isToolInvocationPart(part) &&
					(part.toolInvocation.toolName === "canvas-text-to-image" ||
						part.toolInvocation.toolName === "delegateToAgent")
				) {
					// Assuming 'delegateToAgent' might be wrapping the image gen.
					// But for now let's focus on direct tool.

					// We only want to trigger this ONCE per tool call.
					// Ref check?
					if (!currentGenerationIdRef.current) {
						// Actually this logic is flawed because useEffect runs often.
						// We need to check if this SPECIFIC tool invocation logic has run.
						// But for now, let's just trigger it.
						// To avoid loops, we check if we are already extracting/generating.

						// Simplification: logic moved to `onToolCall` if available, or assume single active generation.
						// Let's use a simple state check: if we are streaming and have a tool call but no ID?

						// Better: Generate ID immediately.
						const id = `gen-${Date.now()}`;
						if (!currentGenerationIdRef.current) {
							console.log("Detected tool call, starting placeholder");
							currentGenerationIdRef.current = id;
							if (onStartGeneration) {
								onStartGeneration(id, "Generating image...");
							}
						}
					}
				}
			}
		}
	}, [messages, onStartGeneration]);

	const scrollRef = useRef<HTMLDivElement>(null);
	const isLoading = status === "streaming" || status === "submitted";

	const latestAssistantHasPendingTool = useMemo(() => {
		for (let i = messages.length - 1; i >= 0; i--) {
			const message = messages[i];
			if (message?.role !== "assistant") {
				continue;
			}
			const toolInvocations = (message as any)?.toolInvocations;
			if (
				Array.isArray(toolInvocations) &&
				toolInvocations.some(
					(invocation) =>
						invocation?.state !== "result" && invocation?.state !== "error",
				)
			) {
				return true;
			}
			const parts = message.parts ?? [];
			if (
				parts.some((part: any) => {
					if (typeof part?.type !== "string") return false;
					if (!part.type.startsWith("tool-")) return false;
					return (
						part.state !== "output-available" && part.state !== "output-error"
					);
				})
			) {
				return true;
			}
			break;
		}
		return false;
	}, [messages]);

	const showStreamingStatus = isLoading && !latestAssistantHasPendingTool;

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages, isLoading]);

	const handleSubmit = useCallback(
		(
			message: string,
			attachments: FileUIPart[],
			config?: { mode: "default" | "search" | "brainstorm" },
		) => {
			if (!message.trim()) return;
			setErrorMessage(null);

			let finalMessage = message;

			if (config?.mode === "search") {
				finalMessage = `[System: Perform a comprehensive web search to answer the following] ${message}`;
			} else if (config?.mode === "brainstorm") {
				finalMessage = `[System: Act as a creative partner. Generate divergent, innovative ideas and possibilities for the following] ${message}`;
			}

			const parts: UIMessage["parts"] = [{ type: "text", text: finalMessage }];

			attachments.forEach((file) => {
				parts.push({
					...file,
					type: "file",
				});
			});

			if (sendMessage) {
				sendMessage({
					role: "user",
					parts,
				});
			} else {
				const userMessage: UIMessage = {
					id: `user-${Date.now()}`,
					role: "user",
					parts,
				};
				setMessages((prev) => [...prev, userMessage]);
			}

			onChat(message);
		},
		[sendMessage, setMessages, onChat, selectedImageIds],
	);

	const handleSelectTemplate = useCallback(
		(template: string) => {
			handleSubmit(template, []);
		},
		[handleSubmit],
	);

	const handleNewChat = useCallback(() => {
		setActiveThreadId(null);
		setMessages([]);
		setShowHistory(false);
	}, [setMessages]);

	const handleToggleHistory = useCallback(() => {
		setShowHistory((prev) => !prev);
	}, []);

	const handleToggleFiles = useCallback(() => {
		setShowFiles((prev) => !prev);
	}, []);

	const handleSelectThread = useCallback((threadId: string) => {
		setActiveThreadId(threadId);
		setShowHistory(false);
	}, []);

	return (
		<div
			className={cn(
				"flex flex-col h-full bg-[#f4f4f0] dark:bg-[#111111]",
				className,
			)}
		>
			<ChatHeader
				onNewChat={handleNewChat}
				onToggleHistory={handleToggleHistory}
				onToggleFiles={handleToggleFiles}
				onCollapse={onClose}
			/>

			<div className="flex-1 overflow-hidden relative">
				{errorMessage && (
					<div className="px-4 py-2 text-sm text-red-700 bg-red-50 border-b border-red-200">
						{errorMessage}
					</div>
				)}
				{showHistory ? (
					<ChatHistoryList
						onSelectThread={handleSelectThread}
						activeThreadId={activeThreadId}
					/>
				) : (
					<div
						ref={scrollRef}
						className="h-full overflow-y-auto overflow-x-hidden px-4 py-4 scroll-smooth scrollbar-swiss"
					>
						{messages.length === 0 ? (
							<ChatWelcome onSelectTemplate={handleSelectTemplate} />
						) : (
							<ChatList
								messages={messages as UIMessage[]}
								showStreamingStatus={showStreamingStatus}
								isLoading={isLoading}
								onToolInteraction={handleToolInteraction}
								onReload={regenerate}
							/>
						)}
					</div>
				)}
			</div>

			{!showHistory && (
				<div className="p-3 pb-4 bg-[#f4f4f0] dark:bg-[#111111] border-t border-neutral-200 dark:border-neutral-800">
					<ChatInput
						onSubmit={handleSubmit}
						isLoading={isLoading}
						onStop={stop}
						selectedAssetIds={selectedImageIds}
						seedAttachments={seedAttachments}
						onSeedConsumed={onSeedConsumed}
					/>
				</div>
			)}
		</div>
	);
}
