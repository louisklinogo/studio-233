import { z } from "zod";
import { canvasToolOutputSchema } from "../schemas/tool-output";

/**
 * Validates tool output against the canvas tool output schema
 * @param output - The raw output from a tool execution
 * @param toolName - Optional name of the tool for better error messages
 * @returns Validated and type-safe output
 * @throws Error if validation fails
 */
export function validateToolOutput(output: unknown, toolName?: string) {
	const result = canvasToolOutputSchema.safeParse(output);

	if (!result.success) {
		const toolLabel = toolName ? `Tool "${toolName}"` : "Tool";
		const errors = result.error.errors
			.map((err) => `  - ${err.path.join(".")}: ${err.message}`)
			.join("\n");

		console.error(`${toolLabel} output validation failed:\n${errors}`);
		console.error("Received output:", JSON.stringify(output, null, 2));

		throw new Error(
			`${toolLabel} returned invalid output format. Please check logs for details.`,
		);
	}

	return result.data;
}

/**
 * Middleware wrapper for tool execute functions
 * Automatically validates output against canvasToolOutputSchema
 */
export function withValidation<TInput, TOutput>(
	executeFn: (input: TInput) => Promise<TOutput>,
	toolName: string,
): (input: TInput) => Promise<TOutput> {
	return async (input: TInput) => {
		const output = await executeFn(input);
		return validateToolOutput(output, toolName) as TOutput;
	};
}

/**
 * Type guard to check if an output has a canvas command
 */
export function hasCanvasCommand(
	output: unknown,
): output is {
	command: NonNullable<z.infer<typeof canvasToolOutputSchema>["command"]>;
} {
	if (
		!output ||
		typeof output !== "object" ||
		!("command" in output) ||
		!output.command
	) {
		return false;
	}

	const result = canvasToolOutputSchema.shape.command.safeParse(
		(output as any).command,
	);
	return result.success;
}

/**
 * Extracts canvas command from validated tool output
 * Returns undefined if no command present (tool doesn't update canvas)
 */
export function extractCanvasCommand(output: unknown) {
	const validated = canvasToolOutputSchema.safeParse(output);
	if (!validated.success) {
		return undefined;
	}

	return validated.data.command;
}
