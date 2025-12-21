import React from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SwissIcons } from "@/components/ui/SwissIcons";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { GenerationSettings } from "@/types/canvas";

export type AspectRatio = GenerationSettings["aspectRatio"];

interface AspectRatioSelectorProps {
	value: AspectRatio;
	onChange: (value: AspectRatio) => void;
}

const aspectRatios: NonNullable<AspectRatio>[] = [
	"1:1",
	"2:3",
	"3:2",
	"3:4",
	"4:3",
	"4:5",
	"5:4",
	"9:16",
	"16:9",
	"21:9",
];

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({
	value,
	onChange,
}) => {
	return (
		<DropdownMenu>
			<Tooltip>
				<TooltipTrigger asChild>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon-sm"
							className={cn(
								"h-8 w-8 rounded-sm",
								value
									? "text-[#FF4D00] bg-neutral-200 dark:bg-neutral-800"
									: "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-800",
							)}
							type="button"
						>
							<SwissIcons.Image className="h-4 w-4" />
							<span className="sr-only">Aspect Ratio</span>
						</Button>
					</DropdownMenuTrigger>
				</TooltipTrigger>
				<TooltipContent>Aspect Ratio: {value || "Default"}</TooltipContent>
			</Tooltip>
			<DropdownMenuContent align="start" className="w-32">
				<DropdownMenuItem onClick={() => onChange(undefined)}>
					Default
				</DropdownMenuItem>
				{aspectRatios.map((ratio) => (
					<DropdownMenuItem
						key={ratio}
						onClick={() => onChange(ratio)}
						className={cn(
							value === ratio && "bg-neutral-100 dark:bg-neutral-800",
						)}
					>
						{ratio}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
