import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, UIMessage } from "ai";
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
	const transport = React.useMemo(
		() => new DefaultChatTransport({ api: "/api/chat" }),
		[],
	);
	const { messages, sendMessage, status } = useChat({
		id: "studio-chat",
		messages: [],
		transport,
	});

	// Map AI SDK messages to UIMessage format expected by ChatList
	// Note: In a real app, types should be unified.
	// The 'ai' package's Message type is very compatible with UIMessage.
	const uiMessages = messages as unknown as UIMessage[];

	const handleSubmit = (text: string, _files: File[]) => {
		if (text.trim()) {
			void sendMessage({ text });
		}
	};

	const handleSuggestionSelect = (suggestion: string) => {
		void sendMessage({ text: suggestion });
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
