import { useChat } from "@ai-sdk/react";
import type { CanvasCommand } from "@studio233/ai";
import { DefaultChatTransport, type UIMessage } from "ai";
import React, { useEffect, useRef } from "react";
import { TRANSPARENT_PIXEL_DATA_URL } from "@/constants/canvas";
import { cn } from "@/lib/utils";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { ChatList } from "./ChatList";
import { ChatWelcome } from "./ChatWelcome";

const FINAL_TOOL_STATES = new Set(["output-available", "result"]);
const ERROR_TOOL_STATES = new Set(["errored", "error", "failed", "cancelled"]);

type CanvasCommandPart = {
	type?: string;
	data?: CanvasCommand;
};

type ToolInvocationPart = {
	type?: string;
	toolCallId?: string;
	toolName?: string;
	state?: string;
	output?: unknown;
	toolInvocation?: {
		toolCallId?: string;
		toolName?: string;
		state?: string;
		result?: unknown;
	};
};

function extractCommandFromPayload(payload: unknown): CanvasCommand | null {
	if (!payload || typeof payload !== "object") return null;
	const withCommand = payload as {
		command?: CanvasCommand;
	} & Partial<CanvasCommand>;
	if (withCommand.command) return withCommand.command;
	if ("type" in withCommand && "url" in withCommand) {
		return withCommand as CanvasCommand;
	}
	return null;
}

interface ChatPanelProps {
	isOpen: boolean;
	onClose: () => void;
	onChat: (prompt: string) => void;
	selectedImageIds: string[];
	onCanvasCommand?: (command: CanvasCommand) => void;
	className?: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
	isOpen,
	onClose,
	onChat,
	selectedImageIds,
	onCanvasCommand,
	className,
}) => {
	const { messages, sendMessage, status, setMessages } = useChat({
		transport: new DefaultChatTransport({
			api: "/api/chat",
			prepareSendMessagesRequest({ messages }) {
				return {
					body: {
						messages,
						canvas: {
							selectedImageIds,
						},
					},
				};
			},
		}),
		onError: (err) => {
			console.error("Chat error:", err);
		},
	});

	const isLoading = status === "submitted" || status === "streaming";

	const processedPartsRef = useRef<Set<string>>(new Set());
	const pendingToolCallsRef = useRef<Set<string>>(new Set());

	useEffect(() => {
		if (!onCanvasCommand) return;

		for (const message of messages) {
			const parts = (message as UIMessage).parts ?? [];
			parts.forEach((part, index) => {
				const commandPart = part as CanvasCommandPart;
				if (commandPart.type === "data-canvas-command" && commandPart.data) {
					const key = `${message.id}-${index}`;
					if (processedPartsRef.current.has(key)) return;
					processedPartsRef.current.add(key);
					try {
						console.log(
							"🎨 ChatPanel received data-canvas-command:",
							commandPart.data,
						);
						onCanvasCommand(commandPart.data);
					} catch (error) {
						console.error("Failed to handle canvas command part", error);
					}
				}

				// Standardized Tool Result Handler
				// Supports both standard AI SDK 'tool-invocation' and Mastra's custom types
				const isToolResult =
					part.type === "tool-invocation" ||
					commandPart.type?.startsWith("tool-");

				if (isToolResult) {
					const toolPart = part as ToolInvocationPart;
					const toolCallId =
						toolPart.toolCallId || toolPart.toolInvocation?.toolCallId;
					const state = toolPart.state || toolPart.toolInvocation?.state;
					const output = toolPart.output || toolPart.toolInvocation?.result;
					const toolName =
						toolPart.toolName || toolPart.toolInvocation?.toolName;

					// Unique execution key
					const key = `${message.id}-${toolCallId}`;
					const isCanvasImageTool = toolName === "canvasTextToImageTool";

					if (
						isCanvasImageTool &&
						toolCallId &&
						state &&
						!FINAL_TOOL_STATES.has(state) &&
						!ERROR_TOOL_STATES.has(state) &&
						!pendingToolCallsRef.current.has(toolCallId)
					) {
						pendingToolCallsRef.current.add(toolCallId);
						try {
							onCanvasCommand({
								type: "add-image",
								url: TRANSPARENT_PIXEL_DATA_URL,
								width: 512,
								height: 512,
								meta: {
									provider: toolName,
									status: "pending",
									toolCallId,
								},
							} as CanvasCommand);
						} catch (error) {
							console.error("Failed to create optimistic placeholder", error);
						}
					}

					if (
						isCanvasImageTool &&
						toolCallId &&
						ERROR_TOOL_STATES.has(state) &&
						pendingToolCallsRef.current.has(toolCallId)
					) {
						pendingToolCallsRef.current.delete(toolCallId);
						try {
							onCanvasCommand({
								type: "add-image",
								url: TRANSPARENT_PIXEL_DATA_URL,
								width: 1,
								height: 1,
								meta: {
									provider: toolName,
									status: "error",
									toolCallId,
								},
							} as CanvasCommand);
						} catch (error) {
							console.error("Failed to notify placeholder error", error);
						}
					}

					// Process only completed results we haven't seen yet
					if (
						(state === "output-available" || state === "result") &&
						!processedPartsRef.current.has(key)
					) {
						// Check if the tool returned a UI command
						// We look for 'command' in the output (standard protocol)
						// Fallback: check if output itself looks like a command (legacy)
						const command =
							extractCommandFromPayload(output) ||
							extractCommandFromPayload(toolPart.toolInvocation?.result);

						if (command) {
							processedPartsRef.current.add(key);
							try {
								console.log(
									"🎨 ChatPanel extracted command from tool result:",
									command,
								);
								const normalizedCommand: CanvasCommand = {
									...command,
									meta: {
										...(command as CanvasCommand).meta,
										toolCallId,
										provider:
											(command as CanvasCommand).meta?.provider || toolName,
										status: "ready",
									},
								};
								if (toolCallId) {
									pendingToolCallsRef.current.delete(toolCallId);
								}
								onCanvasCommand(normalizedCommand);
							} catch (error) {
								console.error("Failed to execute canvas command", error);
							}
						}
					}
				}
			});
		}
	}, [messages, onCanvasCommand]);

	const handleSubmit = async (text: string, files: File[]) => {
		if (!text.trim() && files.length === 0) return;

		// Notify parent (canvas page) about the chat interaction
		onChat(text);

		await sendMessage({ text });
	};

	const handleNewChat = () => {
		setMessages([]);
	};

	// AI SDK useChat already returns UIMessage instances
	const uiMessages = messages as UIMessage[];

	if (!isOpen) return null;

	return (
		<div className={cn("h-full flex flex-col bg-background", className)}>
			<ChatHeader
				onNewChat={handleNewChat}
				onToggleHistory={() => {}}
				onToggleFiles={() => {}}
				onCollapse={onClose}
			/>
			<div className="flex-1 overflow-y-auto">
				{messages.length === 0 ? (
					<ChatWelcome
						onSelectTemplate={(template) => handleSubmit(template, [])}
					/>
				) : (
					<ChatList messages={uiMessages} className="h-full" />
				)}
			</div>
			<div className="p-4 pt-0">
				<ChatInput
					onSubmit={handleSubmit}
					isLoading={isLoading}
					className="p-0 border-0"
				/>
			</div>
		</div>
	);
};
