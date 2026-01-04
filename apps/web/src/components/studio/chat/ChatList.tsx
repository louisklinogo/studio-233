import type { FileUIPart, ToolUIPart, UIMessage } from "ai";
import React, { useState } from "react";
import {
	Conversation,
	ConversationContent,
	ConversationEmptyState,
} from "@/components/ai-elements/conversation";
import {
	Message,
	MessageAction,
	MessageActions,
	MessageAttachment,
	MessageAttachments,
	MessageContent,
	MessageResponse,
} from "@/components/ai-elements/message";
import {
	Reasoning,
	ReasoningContent,
	ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import {
	Source,
	Sources,
	SourcesContent,
	SourcesTrigger,
} from "@/components/ai-elements/sources";
import {
	Tool,
	ToolContent,
	ToolHeader,
	ToolInput,
	ToolOutput,
} from "@/components/ai-elements/tool";
import { Logo } from "@/components/icons";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { AspectRatioPicker } from "./AspectRatioPicker";
import type { AspectRatio } from "./AspectRatioSelector";
import { ExecutionPlan } from "./ExecutionPlan";

export type ToolInteractionResult =
	| AspectRatio
	| { confirmed: boolean; feedback?: string }
	| Record<string, any>;

interface ChatListProps {
	messages: UIMessage[];
	className?: string;
	emptyState?: React.ReactNode;
	showStreamingStatus?: boolean;
	isLoading?: boolean;
	onToolInteraction?: (
		toolCallId: string,
		result: ToolInteractionResult,
	) => void;
	onReload?: () => void;
}

const isFilePart = (part: UIMessage["parts"][number]): part is FileUIPart =>
	part.type === "file";

const isSourcePart = (part: UIMessage["parts"][number]): boolean =>
	part.type === "source-url" || part.type === "source-document";

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
	isLoading,
	onToolInteraction,
	onReload,
}) => {
	const [copiedId, setCopiedId] = useState<string | null>(null);

	const handleCopy = (id: string, text: string) => {
		navigator.clipboard.writeText(text);
		setCopiedId(id);
		setTimeout(() => setCopiedId(null), 2000);
	};

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
					: messages.map((message, index) => {
							const toolParts = toolInvocationsToParts(message);
							const resolvedParts = [...(message.parts ?? []), ...toolParts];
							const attachmentParts = resolvedParts.filter(isFilePart);
							const sourceParts = resolvedParts.filter(isSourcePart);
							const isLastMessage = index === messages.length - 1;
							const fullText = resolvedParts
								.filter((p) => p.type === "text")
								.map((p) => (p as any).text)
								.join("\n");

							const showActions =
								message.role === "assistant" && (!isLastMessage || !isLoading);

							return (
								<div key={message.id} className="w-full">
									{message.role === "assistant" && sourceParts.length > 0 && (
										<Sources>
											<SourcesTrigger count={sourceParts.length} />
											<SourcesContent>
												{sourceParts.map((part: any, sIndex) => (
													<Source
														key={`${message.id}-source-${sIndex}`}
														href={part.url || part.href}
														title={part.title || part.url || part.href}
													/>
												))}
											</SourcesContent>
										</Sources>
									)}
									<Message
										from={message.role === "user" ? "user" : "assistant"}
										className="max-w-full"
									>
										<MessageContent className="max-w-full break-words space-y-2">
											{resolvedParts.map((part, pIndex) => {
												if (part.type === "text") {
													const text = cleanText(part.text);
													if (!text) return null;

													return (
														<MessageResponse
															key={`${message.id}-text-${pIndex}`}
														>
															{text}
														</MessageResponse>
													);
												}

												if (part.type === "reasoning") {
													return (
														<Reasoning
															key={`${message.id}-reasoning-${pIndex}`}
															isStreaming={
																isLoading &&
																isLastMessage &&
																pIndex === resolvedParts.length - 1
															}
														>
															<ReasoningTrigger title="System Logic" />
															<ReasoningContent>{part.text}</ReasoningContent>
														</Reasoning>
													);
												}

												// --- NEW: Plan Mapping ---
												if (part.type === "tool-proposePlan") {
													const planData =
														(part as any).output?.plan ||
														(part as any).input ||
														part;

													// Sophisticated Logic: Check if any following parts are active tools
													// that match the plan steps.
													const stepsWithStatus = (planData.steps || []).map(
														(step: any) => {
															const isActiveTool = resolvedParts.some(
																(p) =>
																	isToolPart(p) &&
																	p.type.includes(
																		step.toolName || step.label.toLowerCase(),
																	) &&
																	p.state === "input-streaming",
															);
															const isCompletedTool = resolvedParts.some(
																(p) =>
																	isToolPart(p) &&
																	p.type.includes(
																		step.toolName || step.label.toLowerCase(),
																	) &&
																	p.state === "output-available",
															);

															return {
																...step,
																status: isCompletedTool
																	? "complete"
																	: isActiveTool
																		? "running"
																		: "pending",
															};
														},
													);

													return (
														<ExecutionPlan
															key={`${message.id}-plan-${pIndex}`}
															task={planData.task || "Operational Roadmap"}
															description={planData.description}
															steps={stepsWithStatus}
															isStreaming={isLoading && isLastMessage}
															requiresApproval={planData.requiresApproval}
															onConfirm={() => {
																if (
																	onToolInteraction &&
																	(part as any).toolCallId
																) {
																	onToolInteraction((part as any).toolCallId, {
																		confirmed: true,
																	});
																}
															}}
															onRevise={() => {
																const input =
																	document.querySelector("textarea");
																input?.focus();
															}}
														/>
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
																	key={`${message.id}-tool-${pIndex}`}
																	className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-md text-sm text-neutral-500"
																>
																	Selected Aspect Ratio: {part.output}
																</div>
															);
														}

														return (
															<AspectRatioPicker
																key={`${message.id}-tool-${pIndex}`}
																message={part.input?.message}
																onSelect={(ratio) => {
																	if (
																		onToolInteraction &&
																		toolPart.toolCallId
																	) {
																		onToolInteraction(
																			toolPart.toolCallId,
																			ratio,
																		);
																	}
																}}
															/>
														);
													}

													return (
														<Tool
															key={`${message.id}-tool-${pIndex}`}
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
													{attachmentParts.map((part, aIndex) => (
														<MessageAttachment
															key={`${message.id}-attachment-${aIndex}`}
															data={part}
														/>
													))}
												</MessageAttachments>
											)}
										</MessageContent>

										{showActions && (
											<MessageActions>
												{isLastMessage && onReload && (
													<MessageAction onClick={onReload} label="Retry">
														<SwissIcons.Refresh size={12} />
													</MessageAction>
												)}
												<MessageAction
													onClick={() => handleCopy(message.id, fullText)}
													label="Copy"
												>
													{copiedId === message.id ? (
														<SwissIcons.Check
															size={12}
															className="text-green-500"
														/>
													) : (
														<SwissIcons.Copy size={12} />
													)}
												</MessageAction>
											</MessageActions>
										)}
									</Message>
								</div>
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
