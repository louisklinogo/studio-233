"use server";

import { usageService } from "@studio233/auth";
import { getSessionWithRetry } from "@studio233/auth/lib/session";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { inngest } from "@/inngest/client";
import { batchStore } from "@/lib/batch-store";

export async function startBatchProcessing(imageUrls: string[]) {
	const jobs: string[] = [];
	const requestHeaders = await headers();
	const headerRecord = Object.fromEntries(requestHeaders.entries());
	const session = await getSessionWithRetry(headerRecord);
	const userId = session?.user.id;
	if (!userId) {
		throw new Error("Authentication required to start batch jobs.");
	}

	const reference = `batch:${Date.now()}`;
	const debitedAmount = await usageService.consumeForBatch(
		userId,
		imageUrls.length,
		{
			reference,
			description: `Batch run with ${imageUrls.length} images`,
			metadata: { kind: "batch" },
		},
	);

	// Create jobs in Postgres and prepare events
	try {
		const events = await Promise.all(
			imageUrls.map(async (url) => {
				const jobId = nanoid();

				await batchStore.createJob(jobId, url, {
					userId,
				});
				jobs.push(jobId);

				return {
					name: "studio/process-fashion-item",
					data: {
						jobId,
						imageUrl: url,
						referenceImage: "default-mannequin",
						timestamp: Date.now(),
					},
				};
			}),
		);

		await inngest.send(events);

		return { success: true, count: events.length, jobIds: jobs };
	} catch (error) {
		await usageService.refund(userId, debitedAmount, {
			reference: `${reference}:refund`,
			description: "Batch run canceled",
			metadata: { jobsAttempted: imageUrls.length },
		});
		throw error;
	}
}
