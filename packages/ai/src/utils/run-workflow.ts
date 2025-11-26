import type { Workflow } from "@mastra/core/workflows";

export async function runWorkflow<TInput extends Record<string, any>, TResult>(
	workflow: Workflow<any, any, any, any, any>,
	inputData: TInput,
): Promise<TResult> {
	const run = await workflow.createRunAsync();
	const result = await run.start({ inputData });
	if (result.status !== "success") {
		throw new Error(
			`Workflow ${workflow.id} failed with status ${result.status}: ${result.error ?? "unknown"}`,
		);
	}
	return result.result as TResult;
}
