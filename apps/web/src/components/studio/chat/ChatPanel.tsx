import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import React from "react";
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
	const { messages, sendMessage, status, setMessages } = useChat({
		transport: new DefaultChatTransport({
			api: "/api/chat",
		}),
		onError: (err) => {
			console.error("Chat error:", err);
		},
	});

	const isLoading = status === "submitted" || status === "streaming";

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
