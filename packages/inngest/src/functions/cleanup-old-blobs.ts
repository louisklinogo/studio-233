import { del, list } from "@vercel/blob";
import { inngest } from "../client";

export const cleanupOldBlobs = inngest.createFunction(
	{ id: "cleanup-old-blobs", name: "Scheduled Blob Cleanup" },
	{ cron: "0 4 * * 0" }, // Every Sunday at 04:00 UTC
	async ({ step }) => {
		const THRESHOLD_DAYS = 30;
		const now = new Date();
		const deletedCount = await step.run("purge-old-vision-blobs", async () => {
			let count = 0;
			let cursor: string | undefined;
			let hasMore = true;

			while (hasMore) {
				const result = await list({
					prefix: "vision/",
					cursor,
					limit: 1000,
				});

				const toDelete = result.blobs
					.filter((blob) => {
						const age =
							(now.getTime() - blob.uploadedAt.getTime()) /
							(1000 * 60 * 60 * 24);
						return age > THRESHOLD_DAYS;
					})
					.map((blob) => blob.url);

				if (toDelete.length > 0) {
					await del(toDelete);
					count += toDelete.length;
				}

				cursor = result.cursor;
				hasMore = result.hasMore;
			}

			return count;
		});

		return {
			status: "completed",
			purged: deletedCount,
			category: "vision_artifacts",
			threshold: `${THRESHOLD_DAYS}d`,
		};
	},
);
