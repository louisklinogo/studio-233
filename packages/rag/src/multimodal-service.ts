import { BrandDNA } from "./schemas/brand-dna";

export interface MultimodalIngestionOptions {
	url: string;
	workspaceId: string;
	assetId: string;
	filename: string;
	dbUrl: string;
	llamaParseApiKey?: string;
	visionModel?: string;
}

export interface MultimodalIngestionResult {
	brandDNA: BrandDNA;
	score: number;
	path: "llama-parse" | "gemini-vision";
	metadata?: Record<string, any>;
}

export async function multimodalIngestionService(
	options: MultimodalIngestionOptions,
): Promise<MultimodalIngestionResult> {
	throw new Error("Not implemented");
}
