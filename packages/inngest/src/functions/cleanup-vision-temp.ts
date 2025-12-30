import { unlink } from "node:fs/promises";
import { logger } from "@studio233/ai/utils/logger";
import { inngest } from "../client";
import { visionCleanupRequestedEvent } from "../events";

export const cleanupVisionTemp = inngest.createFunction(
	{ id: "cleanup-vision-temp", name: "Cleanup Vision Temp Files" },
	{ event: visionCleanupRequestedEvent },
	async ({ event, step }) => {
		const { path } = event.data;

		// 1. Wait for 5 minutes (safety window)
		await step.sleep("wait-for-safety-window", "5m");

		// 2. Prune the file
		await step.run("prune-file", async () => {
			try {
				await unlink(path);
				logger.info("vision_cleanup.success", { path });
			} catch (error) {
				// We don't want to throw if the file is already gone
				logger.warn("vision_cleanup.failed_or_missing", {
					path,
					error: error instanceof Error ? error.message : String(error),
				});
			}
		});

		return { status: "completed", path };
	},
);
