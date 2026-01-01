import { brandIngestionService, initLlamaIndex } from "@studio233/rag";
import { inngest } from "../client";
import { brandKnowledgeIngestedEvent } from "../events";

export const brandIngestion = inngest.createFunction(
	{
		id: "brand-ingestion",
		name: "Brand Knowledge Ingestion",
		throttle: {
			limit: 1,
			period: "1m",
			key: "event.data.workspaceId",
		},
	},
	{ event: brandKnowledgeIngestedEvent },
	async ({ event, step }) => {
		const { url, workspaceId, filename, assetId, classification } = event.data;

		await step.run("index-and-store", async () => {
			const dbUrl = process.env.DATABASE_URL;
			const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

			if (!dbUrl) throw new Error("DATABASE_URL is missing");
			if (!googleApiKey)
				throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is missing");

			// 1. Initialize LlamaIndex Settings
			initLlamaIndex(googleApiKey);

			// 2. Delegate to RAG service
			return await brandIngestionService({
				url,
				workspaceId,
				assetId,
				filename,
				dbUrl,
			});
		});

		// 3. Trigger Global Synthesis Sync
		await step.run("trigger-synthesis", async () => {
			await inngest.send({
				name: "brand.intelligence.sync_requested",
				data: { workspaceId },
			});
		});

		return { status: "completed", workspaceId };
	},
);
