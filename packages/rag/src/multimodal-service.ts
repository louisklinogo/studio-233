import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { LlamaParseReader } from "@llamaindex/cloud";
import { MODEL_CONFIG } from "@studio233/ai";
import { generateText } from "ai";
import * as fs from "fs/promises";
import { Document } from "llamaindex";
import * as os from "os";
import * as path from "path";
import { pdf } from "pdf-to-img";
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

async function downloadFile(url: string, filename: string): Promise<string> {
	const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "brand-ingest-v-"));
	const filePath = path.join(tempDir, filename);

	const response = await fetch(url);
	if (!response.ok)
		throw new Error(`Failed to fetch file: ${response.statusText}`);

	const buffer = Buffer.from(await response.arrayBuffer());
	await fs.writeFile(filePath, buffer);

	return filePath;
}

export async function pdfToImages(
	filePath: string,
	maxPages = 5,
): Promise<Buffer[]> {
	const images: Buffer[] = [];
	try {
		const document = await pdf(filePath, { scale: 2 });
		let counter = 0;
		for await (const image of document) {
			if (counter >= maxPages) break;
			images.push(Buffer.from(image));
			counter++;
		}
	} catch (error) {
		console.error("[rag] pdf-to-img error:", error);
	}
	return images;
}

async function processWithLlamaParse(
	options: MultimodalIngestionOptions,
): Promise<MultimodalIngestionResult | null> {
	if (!options.llamaParseApiKey) return null;

	const reader = new LlamaParseReader({
		apiKey: options.llamaParseApiKey,
		resultType: "json",
		useVendorMultimodalModel: true,
		vendorMultimodalModelName: options.visionModel || MODEL_CONFIG.vision.model,
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
            Return as a structured JSON object matching this schema:
            {
                "coreIdentity": { "colors": ["#hex"], "fonts": [{"family": "", "usage": ""}], "logos": [""], "slogans": [""] },
                "visualStyle": { "layoutPrinciples": [""], "imageryStyle": [""], "photographyGuidelines": [""], "vibe": "" },
                "semanticDNA": { "toneOfVoice": "", "copywritingGuidelines": [""] }
            }
        `,
	});

	try {
		const jsonResults = await reader.loadJson(options.url);
		if (!jsonResults || jsonResults.length === 0) return null;

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
			score: 0.9,
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

async function processWithGeminiVision(
	options: MultimodalIngestionOptions,
): Promise<MultimodalIngestionResult | null> {
	const apiKey =
		options.googleApiKey ||
		process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
		process.env.GEMINI_API_KEY;
	if (!apiKey) return null;

	let filePath: string | null = null;
	try {
		filePath = await downloadFile(options.url, options.filename);
		const images = await pdfToImages(filePath);

		if (images.length === 0) return null;

		const google = createGoogleGenerativeAI({ apiKey });
		const model = google(options.visionModel || MODEL_CONFIG.vision.model);

		const result = await generateText({
			model,
			temperature: MODEL_CONFIG.vision.temperature,
			messages: [
				{
					role: "user",
					content: [
						{
							type: "text",
							text: `
                                Analyze these pages from a brand document and extract the Brand DNA.
                                Focus on:
                                - Colors (hex codes)
                                - Fonts (family and usage)
                                - Logos and slogans
                                - Visual style (layout principles, imagery style, photography guidelines, vibe)
                                - Semantic DNA (tone of voice, copywriting guidelines)
                                Return ONLY a valid JSON object matching this schema:
                                {
                                    "coreIdentity": { "colors": ["#hex"], "fonts": [{"family": "", "usage": ""}], "logos": [""], "slogans": [""] },
                                    "visualStyle": { "layoutPrinciples": [""], "imageryStyle": [""], "photographyGuidelines": [""], "vibe": "" },
                                    "semanticDNA": { "toneOfVoice": "", "copywritingGuidelines": [""] }
                                }
                            `,
						},
						...images.map((img) => ({
							type: "image" as const,
							image: img,
						})),
					],
				},
			],
		});

		const cleanedText = result.text.replace(/```json\n?|\n?```/g, "").trim();
		const rawDna = JSON.parse(cleanedText);
		const parsed = BrandDNASchema.safeParse(rawDna);

		if (!parsed.success) {
			console.warn(
				"[rag] Gemini Vision returned invalid BrandDNA schema",
				parsed.error,
			);
			return null;
		}

		return {
			brandDNA: parsed.data,
			score: 0.75, // Good but potentially less structural than LlamaParse
			path: "gemini-vision",
			metadata: {
				pageCount: images.length,
			},
		};
	} catch (error) {
		console.error("[rag] Gemini Vision fallback error:", error);
		return null;
	} finally {
		if (filePath) {
			try {
				const dir = path.dirname(filePath);
				await fs.unlink(filePath);
				await fs.rm(dir, { recursive: true, force: true });
			} catch (e) {
				console.error("[rag] Failed to cleanup temp files:", e);
			}
		}
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

	// Step 2: Visual Fallback (Gemini Vision)
	const geminiResult = await processWithGeminiVision(options);
	if (geminiResult) {
		return geminiResult;
	}

	throw new Error(
		"Multimodal ingestion failed: Both paths yielded no results.",
	);
}
