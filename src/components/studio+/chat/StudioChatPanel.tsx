import { useChat } from "@ai-sdk/react";
import { UIMessage } from "ai";
import { nanoid } from "nanoid";
import React from "react";
import { ChatInput } from "@/components/studio/chat/ChatInput";
import { ChatList } from "@/components/studio/chat/ChatList";
import { cn } from "@/lib/utils";
import { StudioChatWelcome } from "./StudioChatWelcome";

interface StudioChatPanelProps {
	filesCount: number;
	className?: string;
}

export const StudioChatPanel: React.FC<StudioChatPanelProps> = ({
	filesCount,
	className,
}) => {
	const { messages, append, status, setMessages } = useChat({
		api: "/api/chat", // Placeholder endpoint
		id: "studio-chat",
		initialMessages: [],
	});

	// Map AI SDK messages to UIMessage format expected by ChatList
	// Note: In a real app, types should be unified.
	// The 'ai' package's Message type is very compatible with UIMessage.
	const uiMessages = messages as unknown as UIMessage[];

	const handleSubmit = (text: string, files: File[]) => {
		if (text.trim()) {
			append({
				id: nanoid(),
				role: "user",
				content: text,
				// In a real implementation, we'd handle file attachments here
				// experimental_attachments: files
			});
		}
	};

	const handleSuggestionSelect = (suggestion: string) => {
		append({
			id: nanoid(),
			role: "user",
			content: suggestion,
		});
	};

	return (
		<div
			className={cn(
				"flex flex-col h-full bg-background max-w-3xl mx-auto w-full",
				className,
			)}
		>
			<div className="flex-1 overflow-y-auto overflow-x-hidden">
				<ChatList
					messages={uiMessages}
					className="h-full"
					emptyState={
						<StudioChatWelcome
							hasFiles={filesCount > 0}
							fileCount={filesCount}
							onSelectSuggestion={handleSuggestionSelect}
						/>
					}
				/>
			</div>

			<div className="p-4 pt-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<ChatInput
					onSubmit={handleSubmit}
					isLoading={status === "streaming"}
					className="p-0 border-0 pt-4"
				/>
			</div>
		</div>
	);
};
