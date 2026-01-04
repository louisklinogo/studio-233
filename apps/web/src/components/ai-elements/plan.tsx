"use client";

import type { ComponentProps } from "react";
import { createContext, useContext } from "react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { cn } from "@/lib/utils";
import { Shimmer } from "./shimmer";

type PlanContextValue = {
	isStreaming: boolean;
};

const PlanContext = createContext<PlanContextValue | null>(null);

const usePlan = () => {
	const context = useContext(PlanContext);
	if (!context) {
		throw new Error("Plan components must be used within Plan");
	}
	return context;
};

export type PlanProps = ComponentProps<typeof Collapsible> & {
	isStreaming?: boolean;
};

export const Plan = ({
	className,
	isStreaming = false,
	children,
	...props
}: PlanProps) => (
	<PlanContext.Provider value={{ isStreaming }}>
		<Collapsible
			className={cn(
				"relative border border-neutral-200 dark:border-neutral-800 bg-[#fbfbf9] dark:bg-[#0a0a0a] rounded-[2px] transition-all duration-300 overflow-hidden",
				className,
			)}
			data-slot="plan"
			{...props}
		>
			{/* Industrial Notch (Top Left) */}
			<div className="absolute top-0 left-0 w-1 h-8 bg-[#FF4D00]" />
			{children}
		</Collapsible>
	</PlanContext.Provider>
);

export const PlanHeader = ({ className, ...props }: ComponentProps<"div">) => (
	<div
		className={cn(
			"flex items-center justify-between p-4 border-b border-neutral-100 dark:border-neutral-900",
			className,
		)}
		data-slot="plan-header"
		{...props}
	/>
);

export type PlanTitleProps = ComponentProps<"h3"> & {
	children: string;
};

export const PlanTitle = ({
	children,
	className,
	...props
}: PlanTitleProps) => {
	const { isStreaming } = usePlan();

	return (
		<h3
			className={cn(
				"font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400",
				className,
			)}
			data-slot="plan-title"
			{...props}
		>
			{isStreaming ? <Shimmer>{children}</Shimmer> : children}
		</h3>
	);
};

export type PlanDescriptionProps = ComponentProps<"p"> & {
	children: string;
};

export const PlanDescription = ({
	className,
	children,
	...props
}: PlanDescriptionProps) => {
	const { isStreaming } = usePlan();

	return (
		<p
			className={cn(
				"text-[11px] font-sans text-neutral-400 dark:text-neutral-500 mt-1 tracking-tight leading-relaxed",
				className,
			)}
			data-slot="plan-description"
			{...props}
		>
			{isStreaming ? <Shimmer>{children}</Shimmer> : children}
		</p>
	);
};

export const PlanContent = ({ className, ...props }: ComponentProps<"div">) => (
	<CollapsibleContent>
		<div
			className={cn("p-4 bg-white/50 dark:bg-black/20", className)}
			data-slot="plan-content"
			{...props}
		/>
	</CollapsibleContent>
);

export const PlanFooter = ({ className, ...props }: ComponentProps<"div">) => (
	<div
		className={cn(
			"p-3 border-t border-neutral-100 dark:border-neutral-900 bg-neutral-50/50 dark:bg-black/40",
			className,
		)}
		data-slot="plan-footer"
		{...props}
	/>
);

export const PlanTrigger = ({
	className,
	...props
}: ComponentProps<typeof CollapsibleTrigger>) => (
	<CollapsibleTrigger asChild>
		<button
			className={cn(
				"flex items-center justify-center p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-[1px] transition-colors group",
				className,
			)}
			data-slot="plan-trigger"
			{...props}
		>
			<SwissIcons.ChevronDown className="size-3.5 text-neutral-400 transition-transform duration-300 group-data-[state=open]:rotate-180" />
			<span className="sr-only">Toggle plan</span>
		</button>
	</CollapsibleTrigger>
);
