import type { UIMessage } from "ai";
import { nanoid } from "nanoid";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { ChatList } from "./ChatList";
import { ChatWelcome } from "./ChatWelcome";

interface ChatPanelProps {
	isOpen: boolean;
	onClose: () => void;
	onChat: (prompt: string) => void;
	className?: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
	isOpen,
	onClose,
	onChat,
	className,
}) => {
	const [messages, setMessages] = useState<UIMessage[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (text: string, files: File[]) => {
		if (!text.trim() && files.length === 0) return;

		// Add user message
		const userMessage: UIMessage = {
			id: nanoid(),
			role: "user",
			content: text,
		};

		setMessages((prev) => [...prev, userMessage]);
		setIsLoading(true);

		// Call the parent onChat handler
		onChat(text);

		// Simulate response for now
		setTimeout(() => {
			const assistantMessage: UIMessage = {
				id: nanoid(),
				role: "assistant",
				content: "I'm processing your request...",
			};
			setMessages((prev) => [...prev, assistantMessage]);
			setIsLoading(false);
		}, 1000);
	};

	const handleNewChat = () => {
		setMessages([]);
	};

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
					<ChatList messages={messages} className="h-full" />
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
