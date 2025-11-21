"use server";

import { nanoid } from "nanoid";
import { inngest } from "@/inngest/client";
import { batchStore } from "@/lib/batch-store";

export async function startBatchProcessing(imageUrls: string[]) {
	const jobs = [];

	// Create jobs in KV and prepare events
	const events = await Promise.all(
		imageUrls.map(async (url) => {
			const jobId = nanoid();

			// Initialize job in KV
			await batchStore.createJob(jobId, url);
			jobs.push(jobId);

			return {
				name: "studio/process-fashion-item",
				data: {
					jobId, // Pass ID to Inngest function
					imageUrl: url,
					referenceImage: "default-mannequin",
					timestamp: Date.now(),
				},
			};
		}),
	);

	await inngest.send(events);

	return { success: true, count: events.length, jobIds: jobs };
}
