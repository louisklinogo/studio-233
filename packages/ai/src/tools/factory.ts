import type { z } from "zod";

export type ToolExecuteArgs<TInput> = {
	context: TInput;
	runtimeContext?: any;
};

export type ToolExecuteFn<TInput, TOutput> = (
	args: ToolExecuteArgs<TInput>,
) => Promise<TOutput>;

export type ToolDefinition<
	TInputSchema extends z.ZodTypeAny,
	TOutputSchema extends z.ZodTypeAny,
> = {
	id: string;
	description: string;
	inputSchema: TInputSchema;
	outputSchema?: TOutputSchema;
	execute?: ToolExecuteFn<z.infer<TInputSchema>, z.infer<TOutputSchema>>;
};

export function createTool<
	TInputSchema extends z.ZodTypeAny,
	TOutputSchema extends z.ZodTypeAny,
>(definition: ToolDefinition<TInputSchema, TOutputSchema>) {
	return definition;
}

export function createClientTool<TInputSchema extends z.ZodTypeAny>(
	definition: Omit<
		ToolDefinition<TInputSchema, z.ZodTypeAny>,
		"execute" | "outputSchema"
	>,
) {
	return {
		...definition,
		execute: undefined,
	};
}
