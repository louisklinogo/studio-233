import { GeminiEmbedding } from "@llamaindex/google";
import { Settings } from "llamaindex";
import { getEnv } from "../config";

const env = getEnv();

/**
 * Initializes LlamaIndex with Gemini settings
 */
export function initLlamaIndex() {
	if (!env.googleApiKey) {
		throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is required for LlamaIndex");
	}

	Settings.embedModel = new GeminiEmbedding({
		model: "gemini-embedding-001",
		apiKey: env.googleApiKey,
	});
}
