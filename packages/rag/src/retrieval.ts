import { searchBrandKnowledge } from "@studio233/db/vector-search";
import { Settings } from "llamaindex";

export async function retrievalService(workspaceId: string, query: string) {
	let isInitialized = false;
	try {
		isInitialized = !!Settings.embedModel;
	} catch (e) {
		isInitialized = false;
	}

	if (!isInitialized) {
		throw new Error(
			"LlamaIndex embedModel not initialized. Call initLlamaIndex first.",
		);
	}

	// 1. Generate embedding for the query
	const embedding = await Settings.embedModel.getTextEmbedding(query);

	// 2. Search DB
	return await searchBrandKnowledge(workspaceId, embedding);
}
