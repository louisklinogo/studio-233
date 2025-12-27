import { uploadImageBufferToBlob } from "@studio233/ai/utils/blob-storage";
import { resolveOrCreateSourceSnapshot } from "@studio233/ai/utils/vision-ops";
import { inngest } from "../client";
import { visionArchiveRequestedEvent } from "../events";

export const archiveVisionResult = inngest.createFunction(
	{ id: "archive-vision-result", name: "Archive Vision Result" },
	{ event: visionArchiveRequestedEvent },
	async ({ event, step }) => {
		const { imageUrl, imageHash, metadata } = event.data;

		// 1. Persist the AI metadata JSON
		await step.run("archive-metadata", async () => {
			const jsonBuffer = Buffer.from(JSON.stringify(metadata, null, 2));

			// We save both a timestamped version (implicit by prefix) and a 'latest.json'
			await Promise.all([
				uploadImageBufferToBlob(jsonBuffer, {
					contentType: "application/json",
					prefix: `vision/metadata/${imageHash}`,
				}),
				uploadImageBufferToBlob(jsonBuffer, {
					contentType: "application/json",
					prefix: `vision/metadata/${imageHash}`,
					filename: "latest.json",
				}),
			]);
		});

		// 2. Ensure a source snapshot exists
		await step.run("archive-source-image", async () => {
			await resolveOrCreateSourceSnapshot(imageHash, imageUrl, {
				timeoutMs: {
					blobListMs: 10000,
					fetchMs: 30000,
					uploadMs: 30000,
				},
			});
		});

		return { status: "completed", imageHash };
	},
);
