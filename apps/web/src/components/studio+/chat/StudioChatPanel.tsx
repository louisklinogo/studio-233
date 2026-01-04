import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type FileUIPart, UIMessage } from "ai";
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

	const handleSubmit = (text: string, attachments: FileUIPart[]) => {
		const hasText = text.trim().length > 0;
		const hasAttachments = attachments.length > 0;
		if (!hasText && !hasAttachments) return;

		if (hasAttachments) {
			const parts: UIMessage["parts"] = [
				...(hasText ? [{ type: "text" as const, text }] : []),
				...attachments.map((file) => ({ ...file, type: "file" as const })),
			];
			void sendMessage({
				parts,
			});
			return;
		}

		void sendMessage({ text });
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
					isLoading={status === "streaming" || status === "submitted"}
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
