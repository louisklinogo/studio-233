import {
	ArrowUp,
	AtSign,
	Globe,
	Lightbulb,
	Mic,
	Paperclip,
	Zap,
} from "lucide-react";
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
					className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full"
					type="button"
					onClick={() => attachments.openFileDialog()}
				>
					<Paperclip className="h-4 w-4" />
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
	className,
}) => {
	return (
		<div className={cn("p-4 bg-background", className)}>
			<PromptInput
				onSubmit={(message) => {
					onSubmit(message.text, []);
				}}
				className="relative flex flex-col rounded-2xl border bg-background shadow-sm transition-colors focus-within:border-ring/50 hover:border-ring/20"
			>
				<PromptInputBody>
					<PromptInputTextarea
						className="min-h-[44px] max-h-[200px] bg-transparent border-0 focus-visible:ring-0 p-4 resize-none shadow-none text-base placeholder:text-muted-foreground/70"
						placeholder="Start with an idea, or type '@' to mention"
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
										className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-full"
										type="button"
									>
										<AtSign className="h-4 w-4" />
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
									<PromptInputButton className="text-muted-foreground hover:text-foreground">
										<Lightbulb className="h-4 w-4" />
									</PromptInputButton>
								</TooltipTrigger>
								<TooltipContent>Brainstorm</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<PromptInputButton className="text-muted-foreground hover:text-foreground">
										<Zap className="h-4 w-4" />
									</PromptInputButton>
								</TooltipTrigger>
								<TooltipContent>Quick Action</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<PromptInputButton className="text-muted-foreground hover:text-foreground">
										<Globe className="h-4 w-4" />
									</PromptInputButton>
								</TooltipTrigger>
								<TooltipContent>Web Search</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										type="submit"
										size="icon-sm"
										className="h-8 w-8 rounded-full bg-muted-foreground/20 text-foreground hover:bg-muted-foreground/30"
										disabled={isLoading}
									>
										<ArrowUp className="h-4 w-4" />
										<span className="sr-only">Send</span>
									</Button>
								</TooltipTrigger>
								<TooltipContent>Send Message</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</PromptInputTools>
				</PromptInputFooter>
			</PromptInput>
			<div className="text-center text-[10px] text-muted-foreground pt-2">
				Use{" "}
				<kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-1 rounded border bg-muted px-1 font-mono font-medium opacity-100">
					Shift
				</kbd>{" "}
				+{" "}
				<kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-1 rounded border bg-muted px-1 font-mono font-medium opacity-100">
					Return
				</kbd>{" "}
				for new line
			</div>
		</div>
	);
};
