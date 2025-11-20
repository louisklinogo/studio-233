import type { UIMessage } from "ai";
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
} from "@/components/ai-elements/message";
import { Logo } from "@/components/icons";

interface ChatListProps {
	messages: UIMessage[];
	className?: string;
}

export const ChatList: React.FC<ChatListProps> = ({ messages, className }) => {
	return (
		<Conversation className={className}>
			<ConversationContent>
				{messages.length === 0 ? (
					<ConversationEmptyState
						icon={<Logo className="h-12 w-12 text-muted-foreground/50" />}
						title="Welcome to Studio+233"
						description="I can help you generate images, edit videos, and more. Just ask!"
					/>
				) : (
					messages.map((message) => (
						<Message
							key={message.id}
							from={message.role === "user" ? "user" : "assistant"}
						>
							<MessageContent>
								{message.content}
								{message.parts && message.parts.length > 0 && (
									<MessageAttachments>
										{message.parts
											.filter(
												(part) => part.type === "file" || part.type === "image",
											)
											.map((part, index) => (
												<MessageAttachment
													key={index}
													data={part as any} // Type assertion needed as UIMessage parts might differ slightly from FileUIPart
												/>
											))}
									</MessageAttachments>
								)}
							</MessageContent>
						</Message>
					))
				)}
			</ConversationContent>
		</Conversation>
	);
};
