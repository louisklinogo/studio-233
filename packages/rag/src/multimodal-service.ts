import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { prisma } from "@studio233/db";
import { generateText } from "ai";
import * as fs from "fs/promises";
import { Document } from "llamaindex";
import * as os from "os";
import * as path from "path";
import { brandTextIngestionService } from "./ingestion";
import { GEMINI_PRO_MODEL, MODEL_CONFIG } from "./model-config";
import { BrandDNA, BrandDNASchema } from "./schemas/brand-dna";
import { logger } from "./utils/logger";

export async function updateWorkspaceBrandDNA(
	workspaceId: string,
	dna: BrandDNA,
	assetId?: string,
	filename?: string,
) {
	// 1. Update the structured Profile
	await prisma.workspace.update({
		where: { id: workspaceId },
		data: {
			brandProfile: dna as any,
			brandSummary: dna.visualStyle.vibe as any,
			updatedAt: new Date(),
		},
	});

	// 2. BACKFILL: Create Semantic Anchors in Vector DB
	// This ensures the UI and RAG can "find" the brand soul
	const dbUrl = process.env.DATABASE_URL;
	if (dbUrl) {
		const anchorText = `
			ASSET_SOURCE: ${filename || "Brand_Document"}
			SEMANTIC_CLASS: SYNTHESIZED_DNA
			
			VISUAL_DEDUCTION:
			- Aesthetic DNA: ${dna.visualStyle.vibe}
			- Form & Geometry: ${dna.visualStyle.layoutPrinciples.join(", ")}
			- Signal Palette: ${dna.coreIdentity.colors.join(", ")}
			
			REASONING_FRAGMENT:
			The brand soul is defined by "${dna.visualStyle.vibe}". 
			The tone of voice is consistently ${dna.semanticDNA.toneOfVoice}.
			Key copywriting guidelines include: ${dna.semanticDNA.copywritingGuidelines.slice(0, 3).join("; ")}.
		`.trim();

		await brandTextIngestionService({
			text: anchorText,
			workspaceId,
			assetId: assetId || "synthesized_dna",
			filename: filename || "brand_dna_summary.txt",
			dbUrl,
			metadata: {
				source: "Deep_Scan_Synthesis",
				type: "visual_dna",
			},
		}).catch((err) => logger.error("rag.backfill_failed", { error: err }));
	}
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
	maxPages = 50,
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
            Extract Brand DNA from this document using a Deep Scan methodology. 
            Focus on:
            - Colors: ALL specific hex codes mentioned.
            - Fonts: Complete typography stack (Primary, Secondary, UI).
            - Visual Style: Deep layout principles (Grid, spacing), Imagery styles, and the core Aesthetic Vibe.
            - Semantic DNA: Detailed Tone of Voice and specific Copywriting guidelines.
            
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
			score: 0.95,
			path: "llama-parse",
			metadata: {
				pageCount: jsonResults.length,
				strategy: "deep-scan-llama",
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
		const images = await pdfToImages(filePath, 50);

		if (images.length === 0) return null;

		const google = createGoogleGenerativeAI({ apiKey });
		const model = google(options.visionModel || MODEL_CONFIG.vision.model);

		// DEEP SCAN: Perform targeted extraction across three domains
		const [identityRes, visualRes, semanticRes] = await Promise.all([
			// Pass 1: Core Identity (Colors, Fonts, Logos)
			generateText({
				model,
				messages: [
					{
						role: "user",
						content: [
							{
								type: "text",
								text: 'Extract Core Identity: Colors (hex), Fonts (family/usage), Logos, and Slogans. Return ONLY valid JSON: { "colors": [], "fonts": [], "logos": [], "slogans": [] }',
							},
							...images.map((img) => ({ type: "image" as const, image: img })),
						],
					},
				],
			}),
			// Pass 2: Visual Style (Layout, Vibe, Imagery)
			generateText({
				model,
				messages: [
					{
						role: "user",
						content: [
							{
								type: "text",
								text: 'Extract Visual Style: Layout principles, Imagery style, Photography guidelines, and the overall Vibe. Return ONLY valid JSON: { "layoutPrinciples": [], "imageryStyle": [], "photographyGuidelines": [], "vibe": "" }',
							},
							...images.map((img) => ({ type: "image" as const, image: img })),
						],
					},
				],
			}),
			// Pass 3: Semantic DNA (Tone, Voice)
			generateText({
				model,
				messages: [
					{
						role: "user",
						content: [
							{
								type: "text",
								text: 'Extract Semantic DNA: Tone of voice and Copywriting guidelines. Return ONLY valid JSON: { "toneOfVoice": "", "copywritingGuidelines": [] }',
							},
							...images.map((img) => ({ type: "image" as const, image: img })),
						],
					},
				],
			}),
		]);

		const clean = (txt: string) =>
			JSON.parse(txt.replace(/```json\n?|\n?```/g, "").trim());

		const combinedDNA: BrandDNA = {
			coreIdentity: clean(identityRes.text),
			visualStyle: clean(visualRes.text),
			semanticDNA: clean(semanticRes.text),
		};

		const parsed = BrandDNASchema.safeParse(combinedDNA);

		if (!parsed.success) {
			logger.warn("rag.gemini_vision_deep_scan_invalid", {
				error: parsed.error,
			});
			return null;
		}

		return {
			brandDNA: parsed.data,
			score: 0.95, // High confidence due to multi-pass depth
			path: "gemini-vision",
			metadata: { pageCount: images.length, strategy: "deep-scan-50" },
		};
	} catch (error) {
		logger.error("rag.gemini_vision_deep_scan_error", {
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
				// Cleanup error
			}
		}
	}
}

async function processWithTextOnly(
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

		// Dynamic import to avoid strict dependency if not needed elsewhere
		const { PDFReader } = await import("@llamaindex/readers/pdf");
		const reader = new PDFReader();
		const docs = await reader.loadData(filePath);
		const fullText = docs.map((d) => d.text).join("\n\n");

		if (fullText.length < 50) return null; // Too little text

		const google = createGoogleGenerativeAI({ apiKey });
		const model = google(GEMINI_PRO_MODEL);

		const result = await generateText({
			model,
			messages: [
				{
					role: "system",
					content:
						"You are a Brand Strategist. Extract structured Brand DNA from the following text content of a brand document.",
				},
				{
					role: "user",
					content: `
                        DOCUMENT TEXT:
                        ${fullText.slice(0, 30000)} // Truncate to avoid context limits

                        Analyze the text and extract:
                        - Colors (look for hex codes or color names)
                        - Fonts (look for typography sections)
                        - Logos/Slogans
                        - Visual Style descriptions
                        - Tone of Voice

                        Return ONLY a valid JSON object matching this schema:
                        {
                            "coreIdentity": { "colors": ["#hex"], "fonts": [{"family": "", "usage": ""}], "logos": [""], "slogans": [""] },
                            "visualStyle": { "layoutPrinciples": [""], "imageryStyle": [""], "photographyGuidelines": [""], "vibe": "" },
                            "semanticDNA": { "toneOfVoice": "", "copywritingGuidelines": [""] }
                        }
                    `,
				},
			],
		});

		const cleanedText = result.text.replace(/```json\n?|\n?```/g, "").trim();
		const rawDna = JSON.parse(cleanedText);
		const parsed = BrandDNASchema.safeParse(rawDna);

		if (!parsed.success) {
			logger.warn("rag.text_fallback_invalid_schema", {
				error: parsed.error,
			});
			return null;
		}

		return {
			brandDNA: parsed.data,
			score: 0.6, // Text-only is decent but misses visual cues
			path: "text-only-fallback" as any, // Cast to satisfy type or update type
			metadata: {
				charCount: fullText.length,
			},
		};
	} catch (error) {
		logger.error("rag.text_fallback_error", {
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
				// Ignore cleanup errors
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
		if (typeof val === "string") return val.length > 2; // Relaxed: Min 2 chars (e.g. '3D', 'IT')
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
	let bestResult: MultimodalIngestionResult | null = null;

	// Step 1: Attempt LlamaParse (High Fidelity)
	if (options.llamaParseApiKey) {
		const llamaResult = await processWithLlamaParse(options);
		if (llamaResult) {
			const qualityScore = calculateQualityScore(llamaResult.brandDNA);
			llamaResult.score = qualityScore;
			bestResult = llamaResult;

			if (qualityScore >= 0.5) {
				return llamaResult;
			}
			logger.info("rag.llamaparse_quality_low", {
				score: qualityScore,
				url: options.url,
			});
		}
	} else {
		logger.info("rag.llamaparse_skipped_no_key");
	}

	// Step 2: Visual Fallback (Gemini Vision)
	// Only run if LlamaParse failed or wasn't excellent
	const geminiResult = await processWithGeminiVision(options);
	if (geminiResult) {
		const qualityScore = calculateQualityScore(geminiResult.brandDNA);
		geminiResult.score = qualityScore;

		if (!bestResult || qualityScore > bestResult.score) {
			bestResult = geminiResult;
		}

		if (qualityScore >= 0.3) {
			return geminiResult;
		}
	} else {
		logger.info("rag.gemini_vision_failed_or_skipped");
	}

	// Step 3: Text Fallback (Pure PDF Parsing)
	// Run if everything else failed
	if (!bestResult || bestResult.score < 0.2) {
		const textResult = await processWithTextOnly(options);
		if (textResult) {
			const qualityScore = calculateQualityScore(textResult.brandDNA);
			textResult.score = qualityScore;

			if (!bestResult || qualityScore > bestResult.score) {
				bestResult = textResult;
			}
		}
	}

	// Step 4: Final fallback - return the best thing we found if it has ANY content
	if (bestResult && bestResult.score > 0) {
		logger.warn("rag.ingestion_returning_low_quality_result", {
			score: bestResult.score,
			path: bestResult.path,
		});
		return bestResult;
	}

	// Logging to help user debug why
	logger.error("rag.ingestion_failed_all_strategies", {
		url: options.url,
		hasLlamaKey: !!options.llamaParseApiKey,
		hasGoogleKey: !!options.googleApiKey,
	});

	throw new Error(
		"Multimodal ingestion failed: Unable to extract sufficient Brand DNA. Please check your API keys (LlamaCloud/Google) or ensure the document contains extractable brand text.",
	);
}
