export type AgentMessage = {
	role: "system" | "user" | "assistant";
	content: string;
};

export type AgentRunOptions = {
	messages?: AgentMessage[];
	prompt?: string;
	metadata?: {
		context?: Record<string, unknown>;
	};
};
