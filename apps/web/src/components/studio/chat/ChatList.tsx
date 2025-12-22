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
import { AspectRatioPicker } from "./AspectRatioPicker";
import type { AspectRatio } from "./AspectRatioSelector";

interface ChatListProps {
	messages: UIMessage[];
	className?: string;
	emptyState?: React.ReactNode;
	showStreamingStatus?: boolean;
	onToolInteraction?: (toolCallId: string, result: AspectRatio) => void;
}

const isFilePart = (part: UIMessage["parts"][number]): part is FileUIPart =>
	part.type === "file";

const isToolPart = (
	part: UIMessage["parts"][number],
): part is ToolUIPart<Record<string, any>> =>
	typeof part.type === "string" && part.type.startsWith("tool-");

const toolInvocationsToParts = (
	message: UIMessage,
): ToolUIPart<Record<string, any>>[] => {
	const invocations = (message as any)?.toolInvocations;
	if (!Array.isArray(invocations)) return [];

	return invocations.map((invocation: any) => {
		const state = invocation.state;
		const toolState:
			| "input-streaming"
			| "input-available"
			| "output-available"
			| "output-error" =
			state === "result"
				? "output-available"
				: state === "error"
					? "output-error"
					: state === "call" || state === "started"
						? "input-available"
						: "input-streaming";

		return {
			type: `tool-${invocation.toolName ?? invocation.name ?? "call"}`,
			state: toolState,
			input: invocation.args ?? invocation.input,
			output: invocation.result ?? invocation.output,
			errorText: invocation.error ?? invocation.errorText,
			toolCallId: invocation.toolCallId,
		} as ToolUIPart<Record<string, any>> & { toolCallId: string };
	});
};

export const ChatList: React.FC<ChatListProps> = ({
	messages,
	className,
	emptyState,
	showStreamingStatus,
	onToolInteraction,
}) => {
	const cleanText = (text: string) => {
		const withoutSystemDirective = text.replace(
			/^\s*\[System:[^\]]*\]\s*/i,
			"",
		);
		return withoutSystemDirective
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
							const toolParts = toolInvocationsToParts(message);
							const resolvedParts = [...(message.parts ?? []), ...toolParts];
							const attachmentParts = resolvedParts.filter(isFilePart);

							return (
								<Message
									key={message.id}
									from={message.role === "user" ? "user" : "assistant"}
									className="max-w-full"
								>
									<MessageContent className="max-w-full break-words space-y-2">
										{resolvedParts.map((part, index) => {
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
												const toolPart = part as ToolUIPart<
													Record<string, any>
												> & { toolCallId?: string };

												if (part.type === "tool-askForAspectRatio") {
													if (part.state === "output-available") {
														return (
															<div
																key={`${message.id}-tool-${index}`}
																className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-md text-sm text-neutral-500"
															>
																Selected Aspect Ratio: {part.output}
															</div>
														);
													}

													return (
														<AspectRatioPicker
															key={`${message.id}-tool-${index}`}
															message={part.input?.message}
															onSelect={(ratio) => {
																if (onToolInteraction && toolPart.toolCallId) {
																	onToolInteraction(toolPart.toolCallId, ratio);
																}
															}}
														/>
													);
												}

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

				{showStreamingStatus && (
					<Message
						key="streaming-status"
						from="assistant"
						className="max-w-full"
					>
						<MessageContent className="max-w-full break-words space-y-2">
							<MessageResponse className="font-mono text-[11px] tracking-[0.3em] uppercase text-neutral-600 dark:text-neutral-400">
								EXECUTING_WORKFLOW…
							</MessageResponse>
						</MessageContent>
					</Message>
				)}
			</ConversationContent>
		</Conversation>
	);
};
