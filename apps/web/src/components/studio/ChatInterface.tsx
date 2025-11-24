import { Command, Trash2, X } from "lucide-react";
import React, { useState } from "react";
import { Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
	isOpen: boolean;
	onClose: () => void;
	selectedCount: number;
	onRun: (prompt: string) => void;
	onChat: (prompt: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
	isOpen,
	onClose,
	selectedCount,
	onRun,
	onChat,
}) => {
	const [prompt, setPrompt] = useState("");

	if (!isOpen) return null;

	return (
		<div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[400px] bg-background border rounded-2xl shadow-xl z-30 animate-in slide-in-from-bottom-4 fade-in-0">
			<div className="flex items-center justify-between p-3 border-b">
				<div className="flex items-center gap-2">
					<span className="font-medium">Chat</span>
					{selectedCount > 0 && (
						<span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
							{selectedCount} selected
						</span>
					)}
				</div>
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={() => setPrompt("")}
					>
						<Trash2 className="h-4 w-4 text-muted-foreground" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={onClose}
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
			</div>

			<div className="p-3 space-y-3">
				<Textarea
					placeholder={
						selectedCount > 0
							? "Describe how you want to modify the selected items..."
							: "Describe what you want to create..."
					}
					value={prompt}
					onChange={(e) => setPrompt(e.target.value)}
					className="min-h-[100px] resize-none border-0 focus-visible:ring-0 bg-muted/50 rounded-xl p-3"
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							if (prompt.trim()) {
								onRun(prompt);
							}
						}
					}}
				/>

				<div className="flex items-center justify-end gap-2">
					<Button
						variant="secondary"
						className="rounded-xl"
						onClick={() => onChat(prompt)}
						disabled={!prompt.trim()}
					>
						Queue
					</Button>
					<Button
						className="rounded-xl gap-2"
						onClick={() => onRun(prompt)}
						disabled={!prompt.trim()}
					>
						Run <Command className="h-3 w-3" />
					</Button>
				</div>
			</div>
		</div>
	);
};
