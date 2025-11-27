import { useChat } from "@ai-sdk/react";
import type { CanvasCommand } from "@studio233/ai";
import { DefaultChatTransport, type UIMessage } from "ai";
import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { ChatList } from "./ChatList";
import { ChatWelcome } from "./ChatWelcome";

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

	useEffect(() => {
		if (!onCanvasCommand) return;

		for (const message of messages) {
			const parts = (message as UIMessage).parts ?? [];
			parts.forEach((part, index) => {
				// Handle explicit data commands
				if ((part as any).type === "data-canvas-command") {
					const key = `${message.id}-${index}`;
					if (processedPartsRef.current.has(key)) return;
					processedPartsRef.current.add(key);
					try {
						const command = (part as any).data as CanvasCommand;
						onCanvasCommand(command);
					} catch (error) {
						console.error("Failed to handle canvas command part", error);
					}
				}

				// Standardized Tool Result Handler
				// Supports both standard AI SDK 'tool-invocation' and Mastra's custom types
				const isToolResult =
					part.type === "tool-invocation" ||
					(part as any).type?.startsWith("tool-");

				if (isToolResult) {
					const toolPart = part as any;
					const toolCallId =
						toolPart.toolCallId || toolPart.toolInvocation?.toolCallId;
					const state = toolPart.state || toolPart.toolInvocation?.state;
					const output = toolPart.output || toolPart.toolInvocation?.result;

					// Unique execution key
					const key = `${message.id}-${toolCallId}`;

					// Process only completed results we haven't seen yet
					if (
						(state === "output-available" || state === "result") &&
						!processedPartsRef.current.has(key)
					) {
						// Check if the tool returned a UI command
						// We look for 'command' in the output (standard protocol)
						// Fallback: check if output itself looks like a command (legacy)
						const command =
							output?.command || (output?.type && output?.url ? output : null);

						if (command) {
							processedPartsRef.current.add(key);
							try {
								onCanvasCommand(command as CanvasCommand);
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
