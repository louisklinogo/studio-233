import type { FileUIPart, ToolUIPart, UIMessage } from "ai";
import React, { useState } from "react";
import {
	Conversation,
	ConversationContent,
	ConversationEmptyState,
} from "@/components/ai-elements/conversation";
import {
	InlineCitation,
	InlineCitationCard,
	InlineCitationCardBody,
	InlineCitationCardTrigger,
	InlineCitationCarousel,
	InlineCitationCarouselContent,
	InlineCitationCarouselHeader,
	InlineCitationCarouselIndex,
	InlineCitationCarouselItem,
	InlineCitationCarouselNext,
	InlineCitationCarouselPrev,
	InlineCitationSource,
} from "@/components/ai-elements/inline-citation";
import { Loader } from "@/components/ai-elements/loader";
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
import { Shimmer } from "@/components/ai-elements/shimmer";
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
import {
	WebPreview,
	WebPreviewBody,
	WebPreviewNavigation,
	WebPreviewUrl,
} from "@/components/ai-elements/web-preview";
import { StudioLogo } from "@/components/icons/StudioLogo";
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
	onRevisePlan?: (suggestion: string) => void;
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
		const toolState: ToolUIPart["state"] =
			state === "result"
				? "output-available"
				: state === "error"
					? "output-error"
					: invocation.approval
						? "approval-requested"
						: state === "call" || state === "started"
							? "input-available"
							: "input-streaming";

		const rawName = invocation.toolName ?? invocation.name ?? "call";
		const normalizedName = rawName.replace(/[-_]([a-z])/g, (g: string) =>
			g[1].toUpperCase(),
		);

		return {
			type: `tool-${normalizedName}`,
			state: toolState,
			input: invocation.args ?? invocation.input,
			output: invocation.result ?? invocation.output,
			errorText: invocation.error ?? invocation.errorText,
			toolCallId: invocation.toolCallId,
			approval: invocation.approval,
		} as ToolUIPart<Record<string, any>> & { toolCallId: string };
	});
};

const MessageResponseWithCitations: React.FC<{
	text: string;
	sources: any[];
}> = ({ text, sources }) => {
	const citationRegex = /\[(\d+)\]/g;
	const parts = text.split(citationRegex);

	if (parts.length === 1 || sources.length === 0) {
		return <MessageResponse>{text}</MessageResponse>;
	}

	return (
		<div className="space-y-2">
			<MessageResponse>
				{parts
					.map((part, i) => {
						if (i % 2 === 0) return part;
						const citationNumber = part;
						const index = Number.parseInt(citationNumber) - 1;
						const source = sources[index];
						return source ? "" : `[${citationNumber}]`;
					})
					.join("")}
			</MessageResponse>

			<div className="flex flex-wrap gap-1 mt-1">
				{parts.map((part, i) => {
					if (i % 2 === 0) return null;
					const citationNumber = part;
					const index = Number.parseInt(citationNumber) - 1;
					const source = sources[index];
					if (!source) return null;

					return (
						<InlineCitation key={`cit-${i}`}>
							<InlineCitationCard>
								<InlineCitationCardTrigger
									sources={[source.url || source.href]}
								/>
								<InlineCitationCardBody>
									<InlineCitationCarousel>
										<InlineCitationCarouselHeader>
											<InlineCitationCarouselPrev />
											<InlineCitationCarouselNext />
											<InlineCitationCarouselIndex />
										</InlineCitationCarouselHeader>
										<InlineCitationCarouselContent>
											<InlineCitationCarouselItem>
												<InlineCitationSource
													description={source.snippet || source.description}
													title={source.title || source.url || source.href}
													url={source.url || source.href}
												/>
											</InlineCitationCarouselItem>
										</InlineCitationCarouselContent>
									</InlineCitationCarousel>
								</InlineCitationCardBody>
							</InlineCitationCard>
						</InlineCitation>
					);
				})}
			</div>
		</div>
	);
};

export const ChatList: React.FC<ChatListProps> = ({
	messages,
	className,
	emptyState,
	showStreamingStatus,
	isLoading,
	onToolInteraction,
	onReload,
	onRevisePlan,
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
								description="I can help you generate images, edit videos, and more. Just ask!"
								icon={
									<StudioLogo
										className="text-4xl text-muted-foreground/50"
										variant="mark"
									/>
								}
								title="Welcome to Studio+233"
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
								<div className="w-full" key={message.id}>
									{message.role === "assistant" && sourceParts.length > 0 && (
										<Sources className="mb-2">
											<SourcesTrigger count={sourceParts.length} />
											<SourcesContent>
												{sourceParts.map((part: any, sIndex) => (
													<Source
														href={part.url || part.href}
														key={`${message.id}-source-${sIndex}`}
														title={part.title || part.url || part.href}
													>
														<div className="flex flex-col gap-0.5">
															<span className="font-bold text-[10px] line-clamp-1">
																{part.title || "Source Reference"}
															</span>
															{part.snippet && (
																<span className="text-[9px] text-neutral-500 line-clamp-2">
																	{part.snippet}
																</span>
															)}
														</div>
													</Source>
												))}
											</SourcesContent>
										</Sources>
									)}
									<Message
										className="max-w-full"
										from={message.role === "user" ? "user" : "assistant"}
									>
										<MessageContent className="max-w-full break-words space-y-2">
											{resolvedParts.map((part, pIndex) => {
												// Direct access to part properties with type safety
												if (part.type === "text") {
													const text = cleanText(part.text);
													if (!text) return null;

													return (
														<MessageResponseWithCitations
															key={`${message.id}-text-${pIndex}`}
															sources={sourceParts}
															text={text}
														/>
													);
												}

												if (part.type === "reasoning") {
													return (
														<Reasoning
															isStreaming={
																isLoading &&
																isLastMessage &&
																pIndex === resolvedParts.length - 1
															}
															key={`${message.id}-reasoning-${pIndex}`}
														>
															<ReasoningTrigger title="System Logic" />
															<ReasoningContent>{part.text}</ReasoningContent>
														</Reasoning>
													);
												}

												// Use normalized type for tool identification but maintain narrowing
												const rawType = part.type;
												const normalizedType = rawType.startsWith("tool-")
													? `tool-${rawType.slice(5).replace(/[-_]([a-z])/g, (g) => g[1].toUpperCase())}`
													: rawType;

												if (
													normalizedType === "tool-proposePlan" &&
													isToolPart(part)
												) {
													const planData =
														(part.output as any)?.plan || part.input || part;

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
															approval={part.approval}
															description={planData.description}
															isStreaming={isLoading && isLastMessage}
															key={`${message.id}-plan-${pIndex}`}
															onConfirm={(approved) => {
																if (onToolInteraction && part.toolCallId) {
																	onToolInteraction(part.toolCallId, {
																		confirmed: approved,
																	});
																}
															}}
															onRevise={() => {
																if (onRevisePlan) {
																	onRevisePlan(
																		`I have some feedback on the plan for "${planData.task || "this task"}". Please consider these changes: `,
																	);
																} else {
																	const input =
																		document.querySelector("textarea");
																	input?.focus();
																}
															}}
															requiresApproval={planData.requiresApproval}
															state={part.state}
															steps={stepsWithStatus}
															task={planData.task || "Operational Roadmap"}
														/>
													);
												}

												if (isToolPart(part)) {
													const toolPart = part;

													if (
														normalizedType.startsWith("tool-computer") &&
														toolPart.state === "output-available"
													) {
														const output = toolPart.output as any;
														if (output?.sessionViewerUrl) {
															return (
																<div
																	className="my-2 h-[200px] border border-neutral-200 dark:border-neutral-800 rounded-sm overflow-hidden bg-black relative group"
																	key={`${message.id}-glimpse-${pIndex}`}
																>
																	<div className="absolute top-2 left-3 z-10 flex items-center gap-2">
																		<div className="w-1.5 h-1.5 rounded-full bg-[#FF4D00] animate-pulse" />
																		<span className="font-mono text-[8px] text-white uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
																			LIVE_CORTEX_FEED
																		</span>
																	</div>
																	<iframe
																		className="size-full scale-100 origin-top-left pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity"
																		src={`${output.sessionViewerUrl}&interactive=false`}
																		title="Live Glimpse"
																	/>
																</div>
															);
														}
													}

													if (
														(normalizedType === "tool-htmlGenerator" ||
															normalizedType === "tool-renderHtml") &&
														toolPart.state === "output-available"
													) {
														const output = toolPart.output as Record<
															string,
															any
														>;
														const htmlContent =
															output?.html ||
															output?.code ||
															(typeof toolPart.output === "string"
																? toolPart.output
																: "");

														if (htmlContent) {
															const blob = new Blob([htmlContent], {
																type: "text/html",
															});
															const url = URL.createObjectURL(blob);

															return (
																<div
																	className="my-4 h-[400px] border rounded-lg overflow-hidden"
																	key={`${message.id}-preview-${pIndex}`}
																>
																	<WebPreview defaultUrl={url}>
																		<WebPreviewNavigation>
																			<WebPreviewUrl />
																		</WebPreviewNavigation>
																		<WebPreviewBody src={url} />
																	</WebPreview>
																</div>
															);
														}
													}

													if (normalizedType === "tool-askForAspectRatio") {
														if (toolPart.state === "output-available") {
															return (
																<div
																	className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-md text-sm text-neutral-500"
																	key={`${message.id}-tool-${pIndex}`}
																>
																	Selected Aspect Ratio: {toolPart.output}
																</div>
															);
														}

														return (
															<AspectRatioPicker
																key={`${message.id}-tool-${pIndex}`}
																message={toolPart.input?.message}
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
															defaultOpen={toolPart.state !== "input-streaming"}
															key={`${message.id}-tool-${pIndex}`}
														>
															<ToolHeader
																state={toolPart.state}
																type={toolPart.type}
															/>
															<ToolContent>
																{toolPart.input !== undefined &&
																toolPart.input !== null ? (
																	<ToolInput input={toolPart.input} />
																) : null}
																<ToolOutput
																	errorText={toolPart.errorText}
																	output={toolPart.output}
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
															data={part}
															key={`${message.id}-attachment-${aIndex}`}
														/>
													))}
												</MessageAttachments>
											)}
										</MessageContent>

										{showActions && (
											<MessageActions>
												{isLastMessage && onReload && (
													<MessageAction label="Retry" onClick={onReload}>
														<SwissIcons.Refresh size={12} />
													</MessageAction>
												)}
												<MessageAction
													label="Copy"
													onClick={() => handleCopy(message.id, fullText)}
												>
													{copiedId === message.id ? (
														<SwissIcons.Check
															className="text-green-500"
															size={12}
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
						className="max-w-full"
						from="assistant"
						key="streaming-status"
					>
						<MessageContent className="max-w-full break-words space-y-2">
							<div className="flex items-center gap-3 px-4 py-3 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-sm">
								<Loader className="text-[#FF4D00]" size={14} />
								<Shimmer className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500 dark:text-neutral-400">
									SYSTEM_EXECUTING_WORKFLOW
								</Shimmer>
							</div>
						</MessageContent>
					</Message>
				)}
			</ConversationContent>
		</Conversation>
	);
};
