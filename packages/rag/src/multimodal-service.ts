import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { prisma } from "@studio233/db";
import { generateText } from "ai";
import * as fs from "fs/promises";
import { Document } from "llamaindex";
import * as os from "os";
import * as path from "path";

import { MODEL_CONFIG } from "./model-config";
import { BrandDNA, BrandDNASchema } from "./schemas/brand-dna";
import { logger } from "./utils/logger";

export async function updateWorkspaceBrandDNA(
	workspaceId: string,
	dna: BrandDNA,
) {
	await prisma.workspace.update({
		where: { id: workspaceId },
		data: {
			brandProfile: dna as any,
			brandSummary: dna.visualStyle.vibe as any,
			updatedAt: new Date(), // Fix: Explicitly set updatedAt
		},
	});
}

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
	if (!url || !filename) {
		throw new Error("Missing URL or filename for download.");
	}

	const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "brand-ingest-v-"));
	const filePath = path.join(tempDir, filename);

	let response: Response | null = null;
	let lastError: any = null;
	const maxRetries = 3;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			if (attempt > 0) {
				await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
			}

			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

			response = await fetch(url, { signal: controller.signal });
			clearTimeout(timeoutId);

			if (response.ok) break;
			if (response.status >= 500) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}
			break;
		} catch (error) {
			lastError = error;
			if (attempt === maxRetries) throw error;
		}
	}

	if (!response || !response.ok) {
		throw new Error(
			`Failed to fetch file after ${maxRetries} retries: ${response?.statusText || lastError?.message}`,
		);
	}

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
		const { pdf } = await import("pdf-to-img");
		const document = await pdf(filePath, { scale: 2 });
		let counter = 0;
		for await (const image of document) {
			if (counter >= maxPages) break;
			images.push(Buffer.from(image));
			counter++;
		}
	} catch (error) {
		logger.error("rag.pdf_to_img_error", {
			error: error instanceof Error ? error.message : String(error),
			filePath,
		});
	}
	return images;
}

async function processWithLlamaParse(
	options: MultimodalIngestionOptions,
): Promise<MultimodalIngestionResult | null> {
	if (!options.llamaParseApiKey || !options.url) return null;

	const { LlamaParseReader } = await import("llama-cloud-services");
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
		const jsonResults = (await reader.loadJson(options.url)) as Record<
			string,
			any
		>[];
		if (!jsonResults || jsonResults.length === 0) return null;

		const rawDna = jsonResults[0]?.structured_output || jsonResults[0];
		const parsed = BrandDNASchema.safeParse(rawDna);

		if (!parsed.success) {
			logger.warn("rag.llamaparse_invalid_schema", {
				error: parsed.error,
				rawDna,
			});
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
			logger.warn("rag.gemini_vision_invalid_schema", {
				error: parsed.error,
				rawDna,
			});
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
		logger.error("rag.gemini_vision_fallback_error", {
			error: error instanceof Error ? error.message : String(error),
			url: options.url,
		});
		return null;
	} finally {
		if (filePath) {
			try {
				const dir = path.dirname(filePath);
				await fs.unlink(filePath);
				await fs.rm(dir, { recursive: true, force: true });
			} catch (e) {
				logger.error("rag.cleanup_temp_files_failed", {
					error: e instanceof Error ? e.message : String(e),
					filePath,
				});
			}
		}
	}
}

export function calculateQualityScore(dna: BrandDNA): number {
	let score = 0;
	let totalFields = 0;

	// Helper to check array/string content
	const hasContent = (val: any) => {
		if (Array.isArray(val)) return val.length > 0;
		if (typeof val === "string") return val.length > 5; // Min 5 chars to be "meaningful"
		return false;
	};

	// Core Identity (Weight: 0.4)
	if (hasContent(dna.coreIdentity.colors)) score += 0.1;
	if (hasContent(dna.coreIdentity.fonts)) score += 0.1;
	if (hasContent(dna.coreIdentity.logos)) score += 0.1;
	if (hasContent(dna.coreIdentity.slogans)) score += 0.1;

	// Visual Style (Weight: 0.3)
	if (hasContent(dna.visualStyle.layoutPrinciples)) score += 0.075;
	if (hasContent(dna.visualStyle.imageryStyle)) score += 0.075;
	if (hasContent(dna.visualStyle.photographyGuidelines)) score += 0.075;
	if (hasContent(dna.visualStyle.vibe)) score += 0.075;

	// Semantic DNA (Weight: 0.3)
	if (hasContent(dna.semanticDNA.toneOfVoice)) score += 0.15;
	if (hasContent(dna.semanticDNA.copywritingGuidelines)) score += 0.15;

	return Math.min(score, 1);
}

export async function multimodalIngestionService(
	options: MultimodalIngestionOptions,
): Promise<MultimodalIngestionResult> {
	// Step 1: Attempt LlamaParse (High Fidelity)
	const llamaResult = await processWithLlamaParse(options);
	if (llamaResult) {
		const qualityScore = calculateQualityScore(llamaResult.brandDNA);
		// Update score with calculated quality
		llamaResult.score = qualityScore;

		if (qualityScore > 0.5) {
			// Threshold for "good enough" from Path A
			return llamaResult;
		}
		logger.info("rag.llamaparse_quality_low", {
			score: qualityScore,
			url: options.url,
		});
	}

	// Step 2: Visual Fallback (Gemini Vision)
	const geminiResult = await processWithGeminiVision(options);
	if (geminiResult) {
		const qualityScore = calculateQualityScore(geminiResult.brandDNA);
		geminiResult.score = qualityScore;

		if (qualityScore > 0.2) {
			// Lower threshold for fallback, better than nothing
			return geminiResult;
		}
	}

	throw new Error(
		"Multimodal ingestion failed: Unable to extract sufficient Brand DNA.",
	);
}
