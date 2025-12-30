import type { FileUIPart } from "ai";
import React, { createContext, useEffect } from "react";
import {
	PromptInput,
	PromptInputAttachment,
	PromptInputAttachments,
	PromptInputBody,
	PromptInputButton,
	PromptInputFooter,
	PromptInputHeader,
	PromptInputProvider,
	PromptInputTextarea,
	PromptInputTools,
	usePromptInputAttachments,
	usePromptInputController,
} from "@/components/ai-elements/prompt-input";

import { Button } from "@/components/ui/button";
import { SwissIcons } from "@/components/ui/SwissIcons";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const SelectedAssetsContext = createContext<string[] | null>(null);

const SeedAttachmentsLoader: React.FC<{
	seeds: { filename: string; url: string; mimeType?: string }[];
	onConsumed?: () => void;
}> = ({ seeds, onConsumed }) => {
	const attachmentsApi = usePromptInputAttachments();
	// Track the last processed seeds array reference to prevent duplicate processing
	// from re-renders, while allowing new seeds arrays to be processed
	const processedSeedsRef = React.useRef<typeof seeds | null>(null);

	useEffect(() => {
		// Skip if no seeds or if we've already processed this exact seeds array
		if (!seeds.length || processedSeedsRef.current === seeds) {
			return;
		}

		// Mark as processed immediately to prevent duplicate runs from Strict Mode
		processedSeedsRef.current = seeds;

		const toFiles = async () => {
			const filesToAdd: {
				url: string;
				filename: string;
				mediaType: string;
			}[] = [];

			for (const seed of seeds) {
				// If it's a remote URL (http/https), pass it directly
				if (seed.url.startsWith("http")) {
					filesToAdd.push({
						url: seed.url,
						filename: seed.filename,
						mediaType: seed.mimeType || "image/png",
					});
				} else {
					// For data/blob URLs, we treat them as 'remote' so they keep their local URL
					// PromptInput will handle the conversion to File if needed during submission
					filesToAdd.push({
						url: seed.url,
						filename: seed.filename,
						mediaType: seed.mimeType || "image/png",
					});
				}
			}

			if (filesToAdd.length > 0) {
				attachmentsApi.addRemote(filesToAdd);
			}

			onConsumed?.();
		};

		void toFiles();
		// eslint-disable-next-line react-hooks/exhaustive-deps -- attachmentsApi changes on every render, but we track seeds by reference
	}, [seeds, onConsumed]);

	return null;
};

interface ChatInputProps {
	onSubmit: (
		message: string,
		attachments: FileUIPart[],
		config?: { mode: "default" | "search" | "brainstorm" },
	) => void;
	isLoading?: boolean;
	onStop?: () => void;
	className?: string;
	selectedAssetIds?: string[];
	seedAttachments?: { filename: string; url: string; mimeType?: string }[];
	onSeedConsumed?: () => void;
}

const AttachButton = () => {
	const attachments = usePromptInputAttachments();

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant="ghost"
					size="icon-sm"
					className="h-8 w-8 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-sm"
					type="button"
					onClick={() => attachments.openFileDialog()}
				>
					<SwissIcons.Link className="h-4 w-4" />
					<span className="sr-only">Attach files</span>
				</Button>
			</TooltipTrigger>
			<TooltipContent>Attach files</TooltipContent>
		</Tooltip>
	);
};

const MentionButton = () => {
	// We need access to the text input to insert "@"
	// However, ChatInput wraps PromptInput, so we might not be able to easy access context *outside* PromptInput unless we refactor.
	// Actually, these buttons are INSIDE PromptInputFooter, which is INSIDE PromptInput.
	// So we CAN use the hooks!

	// We need a hook to set text. let's assume usePromptInputController or similar is available/exported from prompt-input
	// Looking at previous valid code, we have usePromptInputController.

	const { textInput } = usePromptInputController();
	const selectedAssets = React.useContext(SelectedAssetsContext);

	const handleMention = () => {
		if (selectedAssets && selectedAssets.length > 0) {
			const token = `@asset:${selectedAssets[0]}`;
			const needsSpace = textInput.value && !textInput.value.endsWith(" ");
			textInput.setInput(`${textInput.value}${needsSpace ? " " : ""}${token} `);
			return;
		}

		textInput.setInput(`${textInput.value}@`);
	};

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant="ghost"
					size="icon-sm"
					className="h-8 w-8 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-sm"
					type="button"
					onClick={handleMention}
					disabled={!selectedAssets || selectedAssets.length === 0}
				>
					<SwissIcons.Target className="h-4 w-4" />
					<span className="sr-only">Tag asset</span>
				</Button>
			</TooltipTrigger>
			<TooltipContent>Tag selected asset</TooltipContent>
		</Tooltip>
	);
};

const StatusLine: React.FC<{ mode: "default" | "search" | "brainstorm" }> = ({
	mode,
}) => {
	const attachments = usePromptInputAttachments();
	const count = attachments.files.length;
	const modeLabel =
		mode === "search"
			? "Search mode"
			: mode === "brainstorm"
				? "Brainstorm mode"
				: "Ready";
	const attachmentLabel =
		count === 0 ? null : count === 1 ? "1 attachment" : `${count} attachments`;

	return (
		<div className="text-center text-[10px] text-neutral-400 pt-1 font-mono uppercase tracking-wider">
			{attachmentLabel ? `${attachmentLabel} • ${modeLabel}` : modeLabel}
		</div>
	);
};

export const ChatInput: React.FC<ChatInputProps> = ({
	onSubmit,
	isLoading,
	onStop,
	className,
	selectedAssetIds = [],
	seedAttachments = [],
	onSeedConsumed,
}) => {
	const [mode, setMode] = React.useState<"default" | "search" | "brainstorm">(
		"default",
	);

	const toggleMode = (newMode: "search" | "brainstorm") => {
		setMode((prev) => (prev === newMode ? "default" : newMode));
	};

	return (
		<SelectedAssetsContext.Provider value={selectedAssetIds}>
			<div className={cn("p-2 bg-[#f4f4f0] dark:bg-[#111111]", className)}>
				<PromptInputProvider>
					<SeedAttachmentsLoader
						seeds={seedAttachments}
						onConsumed={onSeedConsumed}
					/>
					<PromptInput
						onSubmit={(message) => {
							onSubmit(message.text, message.files, { mode });
							setMode("default");
						}}
						className="relative flex flex-col rounded-md border border-neutral-300/80 dark:border-neutral-800 bg-neutral-50 dark:bg-[#0e0e0e] shadow-inner transition-colors focus-within:border-[#FF4D00]/60"
					>
						<PromptInputHeader className="px-3 pt-3 pb-1">
							<PromptInputAttachments>
								{(attachment) => <PromptInputAttachment data={attachment} />}
							</PromptInputAttachments>
						</PromptInputHeader>
						<PromptInputBody className="relative z-10">
							<PromptInputTextarea
								className="min-h-[44px] max-h-[200px] bg-transparent border-0 focus-visible:ring-0 px-3 pb-3 pt-1.5 resize-none shadow-none text-base placeholder:text-neutral-400 font-mono"
								placeholder={
									mode === "search"
										? "Ask the web..."
										: mode === "brainstorm"
											? "What shall we explore..."
											: "Input command..."
								}
							/>
						</PromptInputBody>

						<PromptInputFooter className="px-2 pb-2">
							<div className="flex items-center gap-1">
								<TooltipProvider>
									<AttachButton />
									<MentionButton />
								</TooltipProvider>
							</div>

							<PromptInputTools className="gap-1">
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<PromptInputButton
												onClick={() => toggleMode("brainstorm")}
												className={cn(
													"rounded-sm transition-colors",
													mode === "brainstorm"
														? "text-[#FF4D00] bg-neutral-200 dark:bg-neutral-800"
														: "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-800",
												)}
											>
												<SwissIcons.Sparkles className="h-4 w-4" />
											</PromptInputButton>
										</TooltipTrigger>
										<TooltipContent>Brainstorm Mode</TooltipContent>
									</Tooltip>
									<Tooltip>
										<TooltipTrigger asChild>
											<PromptInputButton
												onClick={() => toggleMode("search")}
												className={cn(
													"rounded-sm transition-colors",
													mode === "search"
														? "text-[#FF4D00] bg-neutral-200 dark:bg-neutral-800"
														: "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-800",
												)}
											>
												<SwissIcons.Globe className="h-4 w-4" />
											</PromptInputButton>
										</TooltipTrigger>
										<TooltipContent>Web Search Mode</TooltipContent>
									</Tooltip>
									<Tooltip>
										<TooltipTrigger asChild>
											{isLoading && onStop ? (
												<Button
													type="button"
													size="icon-sm"
													className="h-9 w-9 rounded-md bg-[#3B4B59] text-white hover:bg-[#3B4B59]/90 shadow-sm"
													onClick={onStop}
												>
													<SwissIcons.Square className="h-3 w-3 fill-current" />
													<span className="sr-only">Stop Generating</span>
												</Button>
											) : (
												<Button
													type="submit"
													size="icon-sm"
													className="h-9 w-9 rounded-md bg-[#FF4D00] text-white hover:bg-[#e44400] shadow-sm"
													disabled={isLoading}
												>
													<SwissIcons.ArrowUp className="h-4 w-4" />
													<span className="sr-only">Send</span>
												</Button>
											)}
										</TooltipTrigger>
										<TooltipContent>
											{isLoading ? "Stop Generating" : "Execute Command"}
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</PromptInputTools>
						</PromptInputFooter>
					</PromptInput>
					<StatusLine mode={mode} />
				</PromptInputProvider>
			</div>
		</SelectedAssetsContext.Provider>
	);
};
