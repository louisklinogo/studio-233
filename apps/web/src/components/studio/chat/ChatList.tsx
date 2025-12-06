import type { FileUIPart, UIMessage } from "ai";
import React from "react";
import {
	Conversation,
	ConversationContent,
	ConversationEmptyState,
} from "@/components/ai-elements/conversation";
import {
	Message,
	MessageAttachment,
	MessageAttachments,
	MessageContent,
	MessageResponse,
} from "@/components/ai-elements/message";
import { Logo } from "@/components/icons";

interface ChatListProps {
	messages: UIMessage[];
	className?: string;
	emptyState?: React.ReactNode;
}

const isFilePart = (part: UIMessage["parts"][number]): part is FileUIPart =>
	part.type === "file";

export const ChatList: React.FC<ChatListProps> = ({
	messages,
	className,
	emptyState,
}) => {
	// Helper to cleaner internal orchestration JSON
	const cleanText = (text: string) => {
		return text
			.replace(/```json\s*\{[\s\S]*?"intent"[\s\S]*?\}[\s\S]*?```/g, "")
			.trim();
	};

	return (
		<Conversation className={className}>
			<ConversationContent className="h-full">
				{messages.length === 0
					? emptyState || (
							<ConversationEmptyState
								icon={<Logo className="h-12 w-12 text-muted-foreground/50" />}
								title="Welcome to Studio+233"
								description="I can help you generate images, edit videos, and more. Just ask!"
							/>
						)
					: messages.map((message) => {
							const attachmentParts = message.parts?.filter(isFilePart) ?? [];

							return (
								<Message
									key={message.id}
									from={message.role === "user" ? "user" : "assistant"}
								>
									<MessageContent>
										{message.parts?.map((part, index) => {
											if (part.type === "text") {
												const text = cleanText(part.text);
												if (!text) return null;

												return (
													<MessageResponse key={`${message.id}-text-${index}`}>
														{text}
													</MessageResponse>
												);
											}
											return null;
										})}
										{attachmentParts.length > 0 && (
											<MessageAttachments>
												{attachmentParts.map((part, index) => (
													<MessageAttachment
														key={`${message.id}-attachment-${index}`}
														data={part}
													/>
												))}
											</MessageAttachments>
										)}
									</MessageContent>
								</Message>
							);
						})}
			</ConversationContent>
		</Conversation>
	);
};
