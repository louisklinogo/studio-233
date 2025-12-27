import { prisma } from "@studio233/db";
import { inngest } from "../client";
import { workflowRequestedEvent } from "../events";

export const processWorkflowRun = inngest.createFunction(
	{ id: "process-workflow-run", concurrency: 4 },
	{ event: workflowRequestedEvent },
	async ({ event, step }) => {
		const payload = event.data;
		const nodes = payload.nodes ?? [];
		const now = new Date();

		await step.run("mark-run-running", async () => {
			await prisma.workflowRun.update({
				where: { id: payload.runId },
				data: { state: "RUNNING", startedAt: now },
			});
		});

		try {
			for (const [index, node] of nodes.entries()) {
				const startedAt = new Date();
				await step.run(`step-${node.id}-start`, async () => {
					await prisma.workflowStep.updateMany({
						where: { runId: payload.runId, order: index },
						data: { state: "RUNNING", startedAt },
					});
				});

				const output = {
					message: node.data?.label || node.id,
					description: node.data?.description,
					completedAt: new Date().toISOString(),
				};

				await step.run(`step-${node.id}-complete`, async () => {
					await prisma.workflowStep.updateMany({
						where: { runId: payload.runId, order: index },
						data: {
							state: "COMPLETED",
							finishedAt: new Date(),
							output,
						},
					});
				});
			}

			await step.run("mark-run-complete", async () => {
				await prisma.workflowRun.update({
					where: { id: payload.runId },
					data: {
						state: "COMPLETED",
						finishedAt: new Date(),
						output: { status: "completed", steps: nodes.length },
					},
				});
			});

			return { status: "completed", runId: payload.runId };
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			await step.run("mark-run-failed", async () => {
				await prisma.workflowRun.update({
					where: { id: payload.runId },
					data: {
						state: "FAILED",
						error: { message },
						finishedAt: new Date(),
					},
				});
			});
			throw error;
		}
	},
);
