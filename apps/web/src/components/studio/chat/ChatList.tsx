import type { FileUIPart, ToolUIPart, UIMessage } from "ai";
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
import {
	Tool,
	ToolContent,
	ToolHeader,
	ToolInput,
	ToolOutput,
} from "@/components/ai-elements/tool";
import { Logo } from "@/components/icons";

interface ChatListProps {
	messages: UIMessage[];
	className?: string;
	emptyState?: React.ReactNode;
	isStreaming?: boolean;
}

const isFilePart = (part: UIMessage["parts"][number]): part is FileUIPart =>
	part.type === "file";

const isToolPart = (
	part: UIMessage["parts"][number],
): part is ToolUIPart<Record<string, any>> =>
	typeof part.type === "string" && part.type.startsWith("tool-");

export const ChatList: React.FC<ChatListProps> = ({
	messages,
	className,
	emptyState,
	isStreaming,
}) => {
	// Helper to cleaner internal orchestration JSON
	const cleanText = (text: string) => {
		return text
			.replace(/```json\s*\{[\s\S]*?"intent"[\s\S]*?\}[\s\S]*?```/g, "")
			.trim();
	};

	return (
		<Conversation className={className}>
			<ConversationContent className="h-full w-full overflow-x-hidden">
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
									className="max-w-full"
								>
									<MessageContent className="max-w-full break-words space-y-2">
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

											if (isToolPart(part)) {
												return (
													<Tool
														key={`${message.id}-tool-${index}`}
														defaultOpen={part.state !== "input-streaming"}
													>
														<ToolHeader type={part.type} state={part.state} />
														<ToolContent>
															{part.input !== undefined &&
															part.input !== null ? (
																<ToolInput input={part.input} />
															) : null}
															<ToolOutput
																output={part.output}
																errorText={part.errorText}
															/>
														</ToolContent>
													</Tool>
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

				{isStreaming && (
					<Message
						key="streaming-placeholder"
						from="assistant"
						className="max-w-full"
					>
						<MessageContent className="max-w-full break-words space-y-2">
							<MessageResponse>Thinking…</MessageResponse>
						</MessageContent>
					</Message>
				)}
			</ConversationContent>
		</Conversation>
	);
};
