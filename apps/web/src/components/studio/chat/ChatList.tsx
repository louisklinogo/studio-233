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
	// Pattern for [1], [2], etc.
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
						// Even indices are text, odd are captured numbers
						if (i % 2 === 0) return part;

						const citationNumber = part;
						const index = Number.parseInt(citationNumber) - 1;
						const source = sources[index];

						// If no source found, return the original [n] text
						return source ? "" : `[${citationNumber}]`;
					})
					.join("")}
			</MessageResponse>

			{/* Render Citation Pills below or interleaved if supported by Streamdown */}
			{/* For now, we render them as a secondary row to satisfy type safety */}
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
													title={source.title || source.url || source.href}
													url={source.url || source.href}
													description={source.snippet || source.description}
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
								icon={
									<StudioLogo
										variant="mark"
										className="text-4xl text-muted-foreground/50"
									/>
								}
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
										<Sources className="mb-2">
											<SourcesTrigger count={sourceParts.length} />
											<SourcesContent>
												{sourceParts.map((part: any, sIndex) => (
													<Source
														key={`${message.id}-source-${sIndex}`}
														href={part.url || part.href}
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
										from={message.role === "user" ? "user" : "assistant"}
										className="max-w-full"
									>
										<MessageContent className="max-w-full break-words space-y-2">
											{resolvedParts.map((part, pIndex) => {
												if (part.type === "text") {
													const text = cleanText(part.text);
													if (!text) return null;

													return (
														<MessageResponseWithCitations
															key={`${message.id}-text-${pIndex}`}
															text={text}
															sources={sourceParts}
														/>
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
															approval={(part as any).approval}
															state={part.state}
															onConfirm={(approved) => {
																if (
																	onToolInteraction &&
																	(part as any).toolCallId
																) {
																	onToolInteraction((part as any).toolCallId, {
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
														/>
													);
												}

												if (isToolPart(part)) {
													const toolPart = part as ToolUIPart<
														Record<string, any>
													> & { toolCallId?: string };

													// --- NEW: WebPreview for HTML Tools ---
													if (
														(part.type === "tool-htmlGenerator" ||
															part.type === "tool-renderHtml") &&
														part.state === "output-available"
													) {
														const htmlContent =
															part.output?.html ||
															part.output?.code ||
															(typeof part.output === "string"
																? part.output
																: "");

														if (htmlContent) {
															// Create a data URL for the iframe
															const blob = new Blob([htmlContent], {
																type: "text/html",
															});
															const url = URL.createObjectURL(blob);

															return (
																<div
																	key={`${message.id}-preview-${pIndex}`}
																	className="my-4 h-[400px] border rounded-lg overflow-hidden"
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
							<div className="flex items-center gap-3 px-4 py-3 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-sm">
								<Loader size={14} className="text-[#FF4D00]" />
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
