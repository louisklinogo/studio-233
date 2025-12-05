"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef } from "react";
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
	onCanvasCommand?: (command: any) => void;
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
	const { messages, input, handleInputChange, handleSubmit, setInput, stop } =
		useChat({
			api: "/api/chat",
			id: "studio-chat",
			initialMessages: [],
			onFinish: (message) => {
				// Handle any tool calls or final processing
			},
		});

	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages]);

	return (
		<div
			className={cn(
				"flex flex-col h-full bg-[#f4f4f0] dark:bg-[#111111]",
				className,
			)}
		>
			<ChatHeader onClose={onClose} />

			<div className="flex-1 overflow-hidden relative">
				<div
					ref={scrollRef}
					className="h-full overflow-y-auto px-4 py-4 scroll-smooth"
				>
					{messages.length === 0 ? (
						<ChatWelcome />
					) : (
						<ChatList
							messages={messages}
							isLoading={false} // Handled by message status
						/>
					)}
				</div>
			</div>

			<div className="p-4 bg-[#f4f4f0] dark:bg-[#111111] border-t border-neutral-200 dark:border-neutral-800">
				<ChatInput
					input={input}
					handleInputChange={handleInputChange}
					handleSubmit={handleSubmit}
					isLoading={false}
					stop={stop}
					setInput={setInput}
				/>
			</div>
		</div>
	);
}
