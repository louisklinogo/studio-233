import type { CoreMessage } from "ai";

export type AgentMessage = CoreMessage;

export type ToolCallInfo = {
	toolCallId: string;
	name: string;
	arguments: unknown;
	result?: unknown;
	error?: Error;
};

export type AgentRunOptions = {
	messages?: AgentMessage[];
	prompt?: string;
	metadata?: {
		context?: Record<string, unknown>;
	};
	/** Maximum number of steps (generations) to allow. Defaults vary by agent type. */
	maxSteps?: number;
	/** Callback invoked after each tool call completes */
	onToolCall?: (toolCall: ToolCallInfo) => void | Promise<void>;
	/** Callback invoked when the stream finishes */
	onFinish?: (event: any) => void | Promise<void>;
};
