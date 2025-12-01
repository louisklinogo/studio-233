"use client";

import { Check, ChevronDown } from "lucide-react";
import React, { useState } from "react";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const fonts = [
	{ value: "Inter", label: "INTER" },
	{ value: "Arial", label: "ARIAL" },
	{ value: "Times New Roman", label: "TIMES" },
	{ value: "Courier New", label: "COURIER" },
	{ value: "Georgia", label: "GEORGIA" },
	{ value: "Verdana", label: "VERDANA" },
	{ value: "Impact", label: "IMPACT" },
	{ value: "Comic Sans MS", label: "COMIC" },
	{ value: "Trebuchet MS", label: "TREBUCHET" },
	{ value: "Arial Black", label: "ARIAL BLK" },
];

interface StudioFontSelectorProps {
	value: string;
	onChange: (value: string) => void;
}

export const StudioFontSelector: React.FC<StudioFontSelectorProps> = ({
	value,
	onChange,
}) => {
	const [open, setOpen] = useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					className={cn(
						"h-8 px-2 flex items-center justify-between gap-2 min-w-[120px]",
						"bg-white dark:bg-[#1a1a1a]",
						"border border-neutral-200 dark:border-neutral-800",
						"hover:bg-neutral-50 dark:hover:bg-neutral-800",
						"text-[10px] font-mono uppercase tracking-wider",
						"transition-colors rounded-sm",
						open && "border-neutral-400 dark:border-neutral-600",
					)}
				>
					<span style={{ fontFamily: value }} className="truncate">
						{fonts.find((font) => font.value === value)?.label || value}
					</span>
					<ChevronDown className="h-3 w-3 opacity-50" />
				</button>
			</PopoverTrigger>
			<PopoverContent
				className="w-[160px] p-0 rounded-sm border-neutral-200 dark:border-neutral-800"
				side="bottom"
				align="start"
				sideOffset={4}
			>
				<Command className="bg-white dark:bg-[#1a1a1a]">
					<CommandInput
						placeholder="SEARCH FONT..."
						className="h-8 text-[10px] font-mono uppercase tracking-wider border-b border-neutral-100 dark:border-neutral-800"
					/>
					<CommandList className="max-h-[200px]">
						<CommandEmpty className="py-2 text-[10px] font-mono text-center text-neutral-500">
							NO FONT FOUND
						</CommandEmpty>
						<CommandGroup>
							{fonts.map((font) => (
								<CommandItem
									key={font.value}
									value={font.value}
									onSelect={(currentValue) => {
										// Command component lowercases values, so we need to map back
										// or just use the font value directly if it matches
										const selectedFont = fonts.find(
											(f) =>
												f.value.toLowerCase() === currentValue.toLowerCase(),
										);
										onChange(selectedFont ? selectedFont.value : currentValue);
										setOpen(false);
									}}
									className={cn(
										"text-[10px] font-mono uppercase tracking-wider cursor-pointer",
										"aria-selected:bg-neutral-100 dark:aria-selected:bg-neutral-800",
										"data-[selected=true]:bg-neutral-100 dark:data-[selected=true]:bg-neutral-800",
									)}
								>
									<div className="flex items-center w-full">
										<span style={{ fontFamily: font.value }} className="flex-1">
											{font.label}
										</span>
										{value === font.value && (
											<Check className="h-3 w-3 ml-2 opacity-50" />
										)}
									</div>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
};
