"use client";

import { useChat } from "@ai-sdk/react";
import type { CanvasCommand } from "@studio233/ai/types/canvas";
import type { UIMessage } from "ai";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChatHeader } from "@/components/studio/chat/ChatHeader";
import { ChatInput } from "@/components/studio/chat/ChatInput";
import { ChatList } from "@/components/studio/chat/ChatList";
import { ChatWelcome } from "@/components/studio/chat/ChatWelcome";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
	isOpen: boolean;
	onClose: () => void;
	onChat: (prompt: string) => void;
	selectedImageIds: string[];
	onCanvasCommand?: (command: CanvasCommand) => void;
	className?: string;
}

export function ChatPanel({
	isOpen,
	onClose,
	onChat,
	selectedImageIds,
	onCanvasCommand,
	className,
}: ChatPanelProps) {
	const [showHistory, setShowHistory] = useState(false);
	const [showFiles, setShowFiles] = useState(false);

	const { messages, setMessages, stop, status, sendMessage } = useChat({
		id: "studio-chat",
		onFinish: ({ message }) => {
			// Process tool invocations for canvas commands
			if (message.parts) {
				for (const part of message.parts) {
					if (
						typeof part.type === "string" &&
						part.type.startsWith("tool-") &&
						"result" in part
					) {
						const toolPart = part as any;
						const result = toolPart.result as any;

						// Helper to process a potential command result
						const processResult = (res: any) => {
							if (res && typeof res === "object" && "command" in res) {
								const command = res.command as CanvasCommand;
								if (command && onCanvasCommand) {
									console.log(
										"[ChatPanel] Dispatching canvas command:",
										command,
									);
									onCanvasCommand(command);
								}
							}
						};

						// 1. Direct tool result (e.g. Orchestrator calls tool directly)
						processResult(result);

						// 2. Delegated tool result (e.g. Orchestrator calls delegateToAgent)
						const toolName = toolPart.toolName as string | undefined;
						const toolResults = result?.toolResults;

						if (toolName === "delegateToAgent" && Array.isArray(toolResults)) {
							for (const subResult of toolResults) {
								if (subResult.result) {
									processResult(subResult.result);
								}
							}
						}
					}
				}
			}
		},
	});

	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages]);

	const handleSubmit = useCallback(
		(message: string, _files: File[]) => {
			if (!message.trim()) return;

			// Use sendMessage if available, otherwise manually add message
			if (sendMessage) {
				sendMessage({
					role: "user",
					parts: [{ type: "text", text: message }],
				});
			} else {
				// Fallback: manually add the message and let the hook handle API call
				const userMessage: UIMessage = {
					id: `user-${Date.now()}`,
					role: "user",
					parts: [{ type: "text", text: message }],
				};
				setMessages((prev) => [...prev, userMessage]);
			}

			onChat(message);
		},
		[sendMessage, setMessages, onChat],
	);

	const handleSelectTemplate = useCallback(
		(template: string) => {
			handleSubmit(template, []);
		},
		[handleSubmit],
	);

	const handleNewChat = useCallback(() => {
		setMessages([]);
	}, [setMessages]);

	const handleToggleHistory = useCallback(() => {
		setShowHistory((prev) => !prev);
	}, []);

	const handleToggleFiles = useCallback(() => {
		setShowFiles((prev) => !prev);
	}, []);

	const isLoading = status === "streaming" || status === "submitted";

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
				<div
					ref={scrollRef}
					className="h-full overflow-y-auto overflow-x-hidden px-4 py-4 scroll-smooth"
				>
					{messages.length === 0 ? (
						<ChatWelcome onSelectTemplate={handleSelectTemplate} />
					) : (
						<ChatList messages={messages as UIMessage[]} />
					)}
				</div>
			</div>

			<div className="p-4 bg-[#f4f4f0] dark:bg-[#111111] border-t border-neutral-200 dark:border-neutral-800">
				<ChatInput
					onSubmit={handleSubmit}
					isLoading={isLoading}
					onStop={stop}
				/>
			</div>
		</div>
	);
}
