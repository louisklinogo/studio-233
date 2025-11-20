import { Check, ChevronsUpDown } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
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
	{ value: "Inter", label: "Inter" },
	{ value: "Arial", label: "Arial" },
	{ value: "Times New Roman", label: "Times New Roman" },
	{ value: "Courier New", label: "Courier New" },
	{ value: "Georgia", label: "Georgia" },
	{ value: "Verdana", label: "Verdana" },
	{ value: "Impact", label: "Impact" },
	{ value: "Comic Sans MS", label: "Comic Sans MS" },
	{ value: "Trebuchet MS", label: "Trebuchet MS" },
	{ value: "Arial Black", label: "Arial Black" },
];

interface FontSelectorProps {
	value: string;
	onChange: (value: string) => void;
}

export const FontSelector: React.FC<FontSelectorProps> = ({
	value,
	onChange,
}) => {
	const [open, setOpen] = useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-full justify-between h-8 text-xs px-2 font-normal"
				>
					<span style={{ fontFamily: value }} className="truncate">
						{fonts.find((font) => font.value === value)?.label || value}
					</span>
					<ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0">
				<Command>
					<CommandInput placeholder="Search font..." className="h-8 text-xs" />
					<CommandList>
						<CommandEmpty>No font found.</CommandEmpty>
						<CommandGroup>
							{fonts.map((font) => (
								<CommandItem
									key={font.value}
									value={font.value}
									onSelect={(currentValue) => {
										onChange(currentValue === value ? "" : currentValue);
										setOpen(false);
									}}
									className="text-xs"
								>
									<Check
										className={cn(
											"mr-2 h-3 w-3",
											value === font.value ? "opacity-100" : "opacity-0",
										)}
									/>
									<span style={{ fontFamily: font.value }}>{font.label}</span>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
};
