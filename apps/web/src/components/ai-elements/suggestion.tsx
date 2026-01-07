"use client";

import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type SuggestionsProps = ComponentProps<typeof ScrollArea>;

export const Suggestions = ({
	className,
	children,
	...props
}: SuggestionsProps) => (
	<ScrollArea className="w-full overflow-x-auto whitespace-nowrap" {...props}>
		<div className={cn("flex w-max flex-nowrap items-center gap-2", className)}>
			{children}
		</div>
		<ScrollBar className="hidden" orientation="horizontal" />
	</ScrollArea>
);

export type SuggestionProps = Omit<ComponentProps<typeof Button>, "onClick"> & {
	suggestion: string;
	onClick?: (suggestion: string) => void;
};

export const Suggestion = ({
	suggestion,
	onClick,
	className,
	variant = "outline",
	size = "sm",
	children,
	...props
}: SuggestionProps) => {
	const handleClick = () => {
		onClick?.(suggestion);
	};

	return (
		<Button
			className={cn(
				"cursor-pointer rounded-[2px] px-3 font-sans text-[10px] font-medium tracking-wider uppercase transition-all duration-300",
				"border-neutral-200 dark:border-neutral-800",
				"bg-white/50 dark:bg-white/5 hover:bg-[#FF4D00] hover:text-white dark:hover:bg-[#FF4D00] hover:border-[#FF4D00]",
				className,
			)}
			onClick={handleClick}
			size={size}
			type="button"
			variant={variant}
			{...props}
		>
			{children || suggestion}
		</Button>
	);
};
