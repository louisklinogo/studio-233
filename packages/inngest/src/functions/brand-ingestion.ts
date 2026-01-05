import {
	brandIngestionService,
	initLlamaIndex,
	multimodalIngestionService,
	updateWorkspaceBrandDNA,
} from "@studio233/rag";
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

		const dbUrl = process.env.DATABASE_URL;
		const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
		const llamaParseApiKey = process.env.LLAMA_CLOUD_API_KEY;

		if (!dbUrl) throw new Error("DATABASE_URL is missing");
		if (!googleApiKey)
			throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is missing");

		await step.run("index-and-store", async () => {
			// 1. Initialize LlamaIndex Settings
			initLlamaIndex(googleApiKey);

			// 2. Delegate to RAG service for vector indexing
			return await brandIngestionService({
				url,
				workspaceId,
				assetId,
				filename,
				dbUrl,
			});
		});

		await step.run("extract-brand-dna", async () => {
			// 3. Extract high-fidelity Brand DNA using multimodal pipeline
			const result = await multimodalIngestionService({
				url,
				workspaceId,
				assetId,
				filename,
				dbUrl,
				googleApiKey,
				llamaParseApiKey,
			});

			// 4. Update Workspace Profile with extracted DNA
			await updateWorkspaceBrandDNA(workspaceId, result.brandDNA);

			return {
				path: result.path,
				score: result.score,
				fieldsExtracted: Object.keys(result.brandDNA).length,
			};
		});

		// 5. Trigger Global Synthesis Sync
		await step.run("trigger-synthesis", async () => {
			await inngest.send({
				name: "brand.intelligence.sync_requested",
				data: { workspaceId },
			});
		});

		return { status: "completed", workspaceId };
	},
);
