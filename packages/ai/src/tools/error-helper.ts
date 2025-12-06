export type ToolError = {
	message: string;
	code: string;
	recoverable: boolean;
};

export type ToolResult<T = any> = {
	result?: T;
	error?: ToolError;
};

export function createToolError(
	message: string,
	code = "TOOL_ERROR",
	recoverable = true,
): ToolResult {
	return {
		error: {
			message,
			code,
			recoverable,
		},
	};
}

export function createToolSuccess<T>(result: T): ToolResult<T> {
	return {
		result,
	};
}
