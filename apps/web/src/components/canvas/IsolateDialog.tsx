import React from "react";
import { SpinnerIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface IsolateDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onIsolate: () => void;
	inputValue: string;
	setInputValue: (value: string) => void;
	isIsolating: boolean;
}

export const IsolateDialog: React.FC<IsolateDialogProps> = ({
	isOpen,
	onClose,
	onIsolate,
	inputValue,
	setInputValue,
	isIsolating,
}) => {
	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-[440px] p-0 gap-0 border-neutral-200 dark:border-neutral-800 rounded-none shadow-2xl">
				<DialogHeader className="p-6 pb-4 border-b border-neutral-100 dark:border-neutral-800">
					<DialogTitle className="text-sm font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
						Isolate Object
					</DialogTitle>
					<DialogDescription className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
						Describe the object to extract.
					</DialogDescription>
				</DialogHeader>

				<div className="p-6 pt-6 flex flex-col gap-6">
					<div className="space-y-2">
						<Label
							htmlFor="isolate-prompt"
							className="text-xs uppercase font-semibold tracking-wider text-neutral-900 dark:text-white"
						>
							Description
						</Label>
						<Input
							id="isolate-prompt"
							placeholder="e.g. red car"
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							className="rounded-none border-0 border-b border-neutral-300 dark:border-neutral-700 bg-transparent px-0 focus-visible:ring-0 focus-visible:border-[#FF4D00] transition-colors placeholder:text-neutral-300 dark:placeholder:text-neutral-600"
						/>
					</div>

					<div className="flex justify-end pt-2">
						<Button
							onClick={onIsolate}
							disabled={isIsolating || !inputValue.trim()}
							className="rounded-none bg-[#FF4D00] hover:bg-[#E04400] text-white font-medium px-6 h-10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isIsolating && (
								<SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
							)}
							RUN ISOLATION
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
