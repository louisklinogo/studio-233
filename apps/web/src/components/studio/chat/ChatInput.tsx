import React from "react";
import {
	PromptInput,
	PromptInputAttachment,
	PromptInputAttachments,
	PromptInputBody,
	PromptInputButton,
	PromptInputFooter,
	PromptInputTextarea,
	PromptInputTools,
	usePromptInputAttachments,
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

interface ChatInputProps {
	onSubmit: (message: string, files: File[]) => void;
	isLoading?: boolean;
	onStop?: () => void;
	className?: string;
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

export const ChatInput: React.FC<ChatInputProps> = ({
	onSubmit,
	isLoading,
	onStop,
	className,
}) => {
	return (
		<div className={cn("p-4 bg-[#f4f4f0] dark:bg-[#111111]", className)}>
			<PromptInput
				onSubmit={(message) => {
					onSubmit(message.text, []);
				}}
				className="relative flex flex-col rounded-sm border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 shadow-inner transition-colors focus-within:border-[#3B4B59]/50"
			>
				<PromptInputBody>
					<PromptInputTextarea
						className="min-h-[44px] max-h-[200px] bg-transparent border-0 focus-visible:ring-0 p-4 resize-none shadow-none text-base placeholder:text-neutral-400 font-mono"
						placeholder="Input command..."
					/>
				</PromptInputBody>

				<PromptInputFooter className="px-2 pb-2">
					<div className="flex items-center gap-1">
						<TooltipProvider>
							<AttachButton />
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										variant="ghost"
										size="icon-sm"
										className="h-8 w-8 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-sm"
										type="button"
									>
										<SwissIcons.Target className="h-4 w-4" />
										<span className="sr-only">Mention</span>
									</Button>
								</TooltipTrigger>
								<TooltipContent>Mention</TooltipContent>
							</Tooltip>
						</TooltipProvider>
						<PromptInputAttachments>
							{(attachment) => <PromptInputAttachment data={attachment} />}
						</PromptInputAttachments>
					</div>

					<PromptInputTools className="gap-1">
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<PromptInputButton className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-sm">
										<SwissIcons.Sparkles className="h-4 w-4" />
									</PromptInputButton>
								</TooltipTrigger>
								<TooltipContent>Brainstorm</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<PromptInputButton className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-sm">
										<SwissIcons.Pulse className="h-4 w-4" />
									</PromptInputButton>
								</TooltipTrigger>
								<TooltipContent>Quick Action</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<PromptInputButton className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-sm">
										<SwissIcons.Globe className="h-4 w-4" />
									</PromptInputButton>
								</TooltipTrigger>
								<TooltipContent>Web Search</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									{isLoading && onStop ? (
										<Button
											type="button"
											size="icon-sm"
											className="h-8 w-8 rounded-sm bg-[#3B4B59] text-white hover:bg-[#3B4B59]/90 shadow-sm"
											onClick={onStop}
										>
											<SwissIcons.Square className="h-3 w-3 fill-current" />
											<span className="sr-only">Stop Generating</span>
										</Button>
									) : (
										<Button
											type="submit"
											size="icon-sm"
											className="h-8 w-8 rounded-sm bg-[#3B4B59] text-white hover:bg-[#3B4B59]/90 shadow-sm"
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
			<div className="text-center text-[10px] text-neutral-400 pt-2 font-mono uppercase tracking-wider">
				System Ready
			</div>
		</div>
	);
};
