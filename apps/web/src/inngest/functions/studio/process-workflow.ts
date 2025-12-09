import { prisma } from "@studio233/db";
import { inngest } from "@/inngest/client";
import {
	workflowRequestedEvent,
	workflowRequestedSchema,
} from "@/inngest/events";

export const processStudioWorkflow = inngest.createFunction(
	{ id: "process-studio-workflow", concurrency: 8 },
	{ event: workflowRequestedEvent },
	async ({ event, step }) => {
		const payload = workflowRequestedSchema.parse(event.data);
		const run = await prisma.workflowRun.findUnique({
			where: { id: payload.runId },
		});
		if (!run) {
			return { status: "ignored", reason: "run missing" } as const;
		}
		if (run.state === "COMPLETED" || run.state === "FAILED") {
			return { status: "ignored", reason: "already finished" } as const;
		}

		await step.run("mark-running", async () => {
			await prisma.workflowRun.update({
				where: { id: payload.runId },
				data: { state: "RUNNING", startedAt: new Date(), error: null },
			});
		});

		try {
			for (const [index, node] of payload.nodes.entries()) {
				await step.run(`step-${node.id}-start`, async () => {
					await prisma.workflowStep.updateMany({
						where: { runId: payload.runId, order: index },
						data: { state: "RUNNING", startedAt: new Date() },
					});
				});

				// Placeholder execution; replace with real batch action invocation
				const output = {
					nodeId: node.id,
					label: node.data?.label,
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

			await step.run("mark-completed", async () => {
				await prisma.workflowRun.update({
					where: { id: payload.runId },
					data: {
						state: "COMPLETED",
						finishedAt: new Date(),
						output: { status: "completed", steps: payload.nodes.length },
					},
				});
			});

			return { status: "completed", runId: payload.runId } as const;
		} catch (error) {
			const message = error instanceof Error ? error.message : "unknown";
			await step.run("mark-failed", async () => {
				await prisma.workflowRun.update({
					where: { id: payload.runId },
					data: {
						state: "FAILED",
						finishedAt: new Date(),
						error: { message },
					},
				});
			});
			throw error;
		}
	},
);
