"use client";

import type { ComponentProps } from "react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SwissIcons } from "@/components/ui/SwissIcons";
import { cn } from "@/lib/utils";

export type TaskStatus = "pending" | "running" | "complete" | "error";

export type TaskItemProps = ComponentProps<"div"> & {
	status?: TaskStatus;
	label: string;
	details?: string;
};

export const TaskItem = ({
	label,
	details,
	status = "pending",
	className,
	...props
}: TaskItemProps) => {
	const renderIcon = () => {
		if (status === "running")
			return (
				<SwissIcons.Spinner className="size-3 animate-spin text-[#FF4D00]" />
			);
		if (status === "complete")
			return <SwissIcons.Check className="size-3 text-green-500" />;
		return (
			<SwissIcons.Circle className="size-3 text-neutral-300 dark:text-neutral-700" />
		);
	};

	return (
		<div
			className={cn(
				"flex items-start gap-3 py-2 group/task transition-all duration-300",
				status === "complete" ? "opacity-50 grayscale" : "opacity-100",
				className,
			)}
			{...props}
		>
			<div className="mt-0.5 relative flex items-center justify-center">
				{renderIcon()}
			</div>

			<div className="flex flex-col gap-0.5">
				<span
					className={cn(
						"text-[11px] font-bold uppercase tracking-wider font-mono",
						status === "running"
							? "text-[#FF4D00]"
							: "text-neutral-700 dark:text-neutral-300",
					)}
				>
					{label}
				</span>
				{details && (
					<span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-sans tracking-tight">
						{details}
					</span>
				)}
			</div>
		</div>
	);
};

export const Task = ({
	defaultOpen = true,
	className,
	...props
}: ComponentProps<typeof Collapsible>) => (
	<Collapsible
		className={cn("w-full", className)}
		defaultOpen={defaultOpen}
		{...props}
	/>
);

export const TaskTrigger = ({
	children,
	className,
	title,
	...props
}: ComponentProps<typeof CollapsibleTrigger> & { title: string }) => (
	<CollapsibleTrigger asChild className={cn("group", className)} {...props}>
		<div className="flex w-full cursor-pointer items-center gap-3 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors py-1">
			<div className="h-[1px] flex-1 bg-neutral-100 dark:bg-neutral-900" />
			<p className="text-[9px] font-mono uppercase tracking-[0.3em] font-bold">
				{title}
			</p>
			<div className="h-[1px] flex-1 bg-neutral-100 dark:bg-neutral-900" />
		</div>
	</CollapsibleTrigger>
);

export const TaskContent = ({
	children,
	className,
	...props
}: ComponentProps<typeof CollapsibleContent>) => (
	<CollapsibleContent
		className={cn(
			"data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down overflow-hidden",
			className,
		)}
		{...props}
	>
		<div className="py-2 pl-6 border-l border-neutral-100 dark:border-neutral-900 space-y-1">
			{children}
		</div>
	</CollapsibleContent>
);
