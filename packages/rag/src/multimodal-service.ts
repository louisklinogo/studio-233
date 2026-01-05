import { LlamaParseReader } from "@llamaindex/cloud";
import { Document } from "llamaindex";
import { BrandDNA, BrandDNASchema } from "./schemas/brand-dna";

export interface MultimodalIngestionOptions {
	url: string;
	workspaceId: string;
	assetId: string;
	filename: string;
	dbUrl: string;
	llamaParseApiKey?: string;
	visionModel?: string;
	googleApiKey?: string;
}

export interface MultimodalIngestionResult {
	brandDNA: BrandDNA;
	score: number;
	path: "llama-parse" | "gemini-vision";
	metadata?: Record<string, any>;
}

async function processWithLlamaParse(
	options: MultimodalIngestionOptions,
): Promise<MultimodalIngestionResult | null> {
	if (!options.llamaParseApiKey) return null;

	const reader = new LlamaParseReader({
		apiKey: options.llamaParseApiKey,
		resultType: "json",
		useVendorMultimodalModel: true,
		vendorMultimodalModelName: options.visionModel || "gemini-3-flash-preview",
		vendorMultimodalApiKey: options.googleApiKey,
		preset: "agentic_plus",
		parsingInstruction: `
            Extract Brand DNA from this document. 
            Focus on:
            - Colors (hex codes)
            - Fonts (family and usage)
            - Logos and slogans
            - Visual style (layout principles, imagery style, photography guidelines, vibe)
            - Semantic DNA (tone of voice, copywriting guidelines)
            Return as a structured JSON object.
        `,
	});

	try {
		// loadJson returns Record<string, any>[]
		const jsonResults = await reader.loadJson(options.url);

		if (!jsonResults || jsonResults.length === 0) return null;

		// Aggregating findings from pages - this is a simplified version
		// In a real scenario, we might want to prompt a model to aggregate these JSON fragments.
		// For now, let's take the first non-empty finding or merge them.

		// Let's assume LlamaParse returns the structured output in the first result if parsingInstruction was followed.
		const rawDna = jsonResults[0]?.structured_output || jsonResults[0];

		const parsed = BrandDNASchema.safeParse(rawDna);

		if (!parsed.success) {
			console.warn(
				"[rag] LlamaParse returned invalid BrandDNA schema",
				parsed.error,
			);
			return null;
		}

		return {
			brandDNA: parsed.data,
			score: 0.9, // High fidelity for LlamaParse
			path: "llama-parse",
			metadata: {
				pageCount: jsonResults.length,
			},
		};
	} catch (error) {
		console.error("[rag] LlamaParse integration error:", error);
		return null;
	}
}

export async function multimodalIngestionService(
	options: MultimodalIngestionOptions,
): Promise<MultimodalIngestionResult> {
	// Step 1: Attempt LlamaParse (High Fidelity)
	const llamaResult = await processWithLlamaParse(options);
	if (llamaResult && llamaResult.score > 0.8) {
		return llamaResult;
	}

	// Step 2: Visual Fallback (Gemini Vision) - To be implemented
	throw new Error("Not implemented: Path B (Gemini Vision) fallback");
}
