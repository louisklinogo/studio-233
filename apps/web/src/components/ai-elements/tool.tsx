"use client";

import type { ToolUIPart } from "ai";
import { ChevronRightIcon } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { isValidElement } from "react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./code-block";

export type ToolProps = ComponentProps<typeof Collapsible>;

export const Tool = ({ className, ...props }: ToolProps) => (
	<Collapsible
		className={cn(
			"group/tool w-full rounded-sm border-l-2 border-neutral-200 pl-4 transition-all data-[state=open]:border-[#FF4D00] dark:border-neutral-800",
			className,
		)}
		{...props}
	/>
);

type ToolState =
	| ToolUIPart["state"]
	| "approval-requested"
	| "approval-responded"
	| "output-denied";

export type ToolHeaderProps = {
	title?: string;
	type: ToolUIPart["type"];
	state: ToolState;
	className?: string;
};

// Map technical tool names to "System Titles"
const getSystemTitle = (type: string) => {
	const rawName = type.split("-").slice(1).join("-") || type;
	const titleMap: Record<string, string> = {
		canvasTextToImage: "GENERATOR // IMG",
		delegateToAgent: "AGENT // DELEGATE",
		generateImage: "GENERATOR // IMG",
		editImage: "GENERATOR // EDIT",
		searchWeb: "NETWORK // SEARCH",
		readFile: "SYSTEM // READ",
		writeFile: "SYSTEM // WRITE",
	};
	return titleMap[rawName] || rawName.toUpperCase().replace(/_/g, " ");
};

// The "Signal Light" component (Braun/Swiss style)
const Signal = ({ state }: { state: ToolState }) => {
	const getSignalStyle = () => {
		switch (state) {
			case "input-streaming":
			case "input-available":
				return "bg-neutral-400 animate-pulse";
			case "output-available":
				return "bg-[#FF4D00]"; // Braun Orange for success/active completion
			case "output-error":
			case "output-denied":
				return "bg-red-600";
			case "approval-requested":
				return "bg-yellow-500 animate-pulse";
			default:
				return "bg-neutral-300";
		}
	};

	return (
		<div className="relative flex items-center justify-center size-3">
			<div
				className={cn(
					"size-1.5 rounded-full transition-colors",
					getSignalStyle(),
				)}
			/>
			{/* Optional glowing ring for active states */}
			{(state === "input-available" || state === "input-streaming") && (
				<div className="absolute inset-0 rounded-full bg-neutral-400/30 animate-ping" />
			)}
		</div>
	);
};

export const ToolHeader = ({
	className,
	title,
	type,
	state,
	...props
}: ToolHeaderProps) => (
	<CollapsibleTrigger
		className={cn(
			"flex w-full items-center justify-between py-2 group/header cursor-pointer",
			className,
		)}
		{...props}
	>
		<div className="flex items-center gap-3">
			<Signal state={state} />
			<span className="font-mono text-[10px] tracking-[0.2em] font-medium text-neutral-500 uppercase group-data-[state=open]/tool:text-foreground transition-colors">
				{title ?? getSystemTitle(type)}
			</span>
		</div>
		<ChevronRightIcon className="size-3 text-neutral-400 transition-transform duration-300 group-data-[state=open]/tool:rotate-90" />
	</CollapsibleTrigger>
);

export type ToolContentProps = ComponentProps<typeof CollapsibleContent>;

export const ToolContent = ({ className, ...props }: ToolContentProps) => (
	<CollapsibleContent
		className={cn(
			"overflow-hidden data-[state=closed]:animate-collapse data-[state=open]:animate-expand",
			className,
		)}
		{...props}
	/>
);

export type ToolInputProps = ComponentProps<"div"> & {
	input: ToolUIPart["input"];
};

// Helper to clean up parameter values
const formatValue = (value: any): string => {
	if (typeof value === "string") return value;
	if (typeof value === "number") return value.toString();
	if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
	if (value === null) return "NULL";
	if (typeof value === "object") return "{...}"; // Abbreviate nested objects
	return String(value);
};

export const ToolInput = ({ className, input, ...props }: ToolInputProps) => {
	// Flatten the input for the grid
	const params = typeof input === "object" ? Object.entries(input || {}) : [];

	return (
		<div className={cn("pt-1 pb-3 pl-6", className)} {...props}>
			{params.length > 0 ? (
				<div className="grid grid-cols-[80px_1fr] gap-y-1 gap-x-4">
					{params.map(([key, value]) => (
						<div key={key} className="contents group/param">
							<span className="font-mono text-[9px] uppercase tracking-wider text-neutral-400 py-1 border-b border-dashed border-neutral-100 dark:border-neutral-800">
								{key}
							</span>
							<span className="font-sans text-[11px] text-neutral-700 dark:text-neutral-300 py-1 border-b border-dashed border-neutral-100 dark:border-neutral-800 truncate">
								{formatValue(value)}
							</span>
						</div>
					))}
				</div>
			) : (
				<div className="font-mono text-[9px] text-neutral-400 italic">
					NO PARAMETERS
				</div>
			)}
		</div>
	);
};

export type ToolOutputProps = ComponentProps<"div"> & {
	output: ToolUIPart["output"];
	errorText: ToolUIPart["errorText"];
};

export const ToolOutput = ({
	className,
	output,
	errorText,
	...props
}: ToolOutputProps) => {
	if (!(output || errorText)) {
		return null;
	}

	// If error, show system alert style
	if (errorText) {
		return (
			<div className="pl-6 pb-2 text-[10px] font-mono text-red-600 flex gap-2">
				<span>[ERR]</span>
				<span>{errorText}</span>
			</div>
		);
	}

	// For standard output, try to keep it minimal
	// If it's a generated image output (special case for our app likely), we could show a thumb
	// For now, let's just log "OK" or the simplified result

	let displayOutput: ReactNode = "completed";

	if (typeof output === "string") {
		// If it's a URL, maybe shorten it?
		if (output.startsWith("http")) {
			displayOutput = "ASSET GENERATED";
		} else {
			displayOutput = output;
		}
	} else if (typeof output === "object") {
		// If it contains a 'result' or 'status' field, prioritize that
		const result = (output as any).result || (output as any).status;
		if (result) displayOutput = String(result);
		else displayOutput = "DATA RECEIVED";
	}

	return (
		<div className={cn("pl-6 pb-2", className)} {...props}>
			<div className="flex items-center gap-2">
				<div className="h-px w-2 bg-[#FF4D00]" />
				<span className="font-mono text-[9px] uppercase tracking-wider text-[#FF4D00]">
					{displayOutput}
				</span>
			</div>
		</div>
	);
};
