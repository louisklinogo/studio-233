import { Check, ChevronDown } from "lucide-react";
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

const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72, 96];

interface FontSizeSelectorProps {
	value: number;
	onChange: (value: number) => void;
}

export const FontSizeSelector: React.FC<FontSizeSelectorProps> = ({
	value,
	onChange,
}) => {
	const [open, setOpen] = useState(false);
	const [inputValue, setInputValue] = useState("");

	const handleCustomValue = () => {
		const val = Number(inputValue);
		if (!isNaN(val) && val > 0) {
			onChange(val);
			setOpen(false);
		}
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-[70px] justify-between h-8 text-xs px-2 font-normal"
				>
					<span className="truncate">{value}</span>
					<ChevronDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[100px] p-0">
				<Command>
					<CommandInput
						placeholder="Size..."
						className="h-8 text-xs"
						value={inputValue}
						onValueChange={setInputValue}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								// If there's a custom value that is valid, we can try to select it
								// However, cmdk usually handles selection of the active item.
								// If the list is empty (no matches), this handler catches it.
								// If the list has matches, cmdk might handle it, but if we want to force the custom value if typed exactly?
								// Let's rely on the custom item being in the list.
								const val = Number(inputValue);
								if (!isNaN(val) && val > 0 && !fontSizes.includes(val)) {
									handleCustomValue();
								}
							}
						}}
					/>
					<CommandList>
						<CommandEmpty>No results.</CommandEmpty>
						<CommandGroup>
							{fontSizes.map((size) => (
								<CommandItem
									key={size}
									value={size.toString()}
									onSelect={(currentValue) => {
										onChange(Number(currentValue));
										setOpen(false);
									}}
									className="text-xs"
								>
									<Check
										className={cn(
											"mr-2 h-3 w-3",
											value === size ? "opacity-100" : "opacity-0",
										)}
									/>
									{size}
								</CommandItem>
							))}
							{inputValue &&
								!isNaN(Number(inputValue)) &&
								Number(inputValue) > 0 &&
								!fontSizes.includes(Number(inputValue)) && (
									<CommandItem
										key={`custom-${inputValue}`}
										value={inputValue}
										onSelect={handleCustomValue}
										className="text-xs"
									>
										<Check className="mr-2 h-3 w-3 opacity-0" />
										Use {inputValue}
									</CommandItem>
								)}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
};
