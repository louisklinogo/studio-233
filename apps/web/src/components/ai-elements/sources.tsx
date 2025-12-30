"use client";

import type { ComponentProps } from "react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { cn } from "@/lib/utils";

export type SourcesProps = ComponentProps<"div">;

export const Sources = ({ className, ...props }: SourcesProps) => (
	<Collapsible
		className={cn("not-prose mb-4 text-primary", className)}
		{...props}
	/>
);

export type SourcesTriggerProps = ComponentProps<typeof CollapsibleTrigger> & {
	count: number;
};

export const SourcesTrigger = ({
	className,
	count,
	children,
	...props
}: SourcesTriggerProps) => (
	<CollapsibleTrigger
		className={cn(
			"flex items-center gap-2 group hover:text-[#FF4D00] transition-colors duration-200",
			className,
		)}
		{...props}
	>
		{children ?? (
			<>
				<p className="font-mono text-[10px] tracking-wider uppercase font-bold">
					Used {count} sources
				</p>
				<SwissIcons.ChevronDown className="h-3 w-3 group-data-[state=open]:rotate-180 transition-transform duration-300" />
			</>
		)}
	</CollapsibleTrigger>
);

export type SourcesContentProps = ComponentProps<typeof CollapsibleContent>;

export const SourcesContent = ({
	className,
	...props
}: SourcesContentProps) => (
	<CollapsibleContent
		className={cn(
			"mt-3 flex w-fit flex-col gap-1.5 border-l border-neutral-200 dark:border-neutral-800 pl-3",
			"data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-1 data-[state=open]:slide-in-from-top-1 outline-none data-[state=closed]:animate-out data-[state=open]:animate-in",
			className,
		)}
		{...props}
	/>
);

export type SourceProps = ComponentProps<"a">;

export const Source = ({ href, title, children, ...props }: SourceProps) => (
	<a
		className="flex items-center gap-2 text-neutral-500 hover:text-[#FF4D00] transition-colors duration-200"
		href={href}
		rel="noreferrer"
		target="_blank"
		{...props}
	>
		{children ?? (
			<>
				<SwissIcons.Globe className="h-3.5 w-3.5 opacity-70" />
				<span className="block font-mono text-[11px] truncate max-w-[300px]">
					{title}
				</span>
			</>
		)}
	</a>
);
