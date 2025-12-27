import { GEMINI_EMBEDDING_MODEL, GeminiEmbedding } from "@llamaindex/google";
import { Settings } from "llamaindex";

/**
 * Initializes LlamaIndex with Gemini settings
 */
export function initLlamaIndex(apiKey: string) {
	if (!apiKey) {
		throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is required for LlamaIndex");
	}

	Settings.embedModel = new GeminiEmbedding({
		model: GEMINI_EMBEDDING_MODEL.EMBEDDING_001,
		apiKey: apiKey,
	});
}

export * from "./ingestion";
export * from "./retrieval";

export function ragHealthCheck() {
	return "RAG package is initialized and healthy.";
}
