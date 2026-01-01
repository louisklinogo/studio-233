import { PGVectorStore } from "@llamaindex/postgres";
import { PDFReader } from "@llamaindex/readers/pdf";
import * as fs from "fs/promises";
import {
	Document,
	storageContextFromDefaults,
	VectorStoreIndex,
} from "llamaindex";
import * as os from "os";
import * as path from "path";

export async function brandTextIngestionService({
	text,
	workspaceId,
	assetId,
	filename,
	dbUrl,
	metadata = {},
}: {
	text: string;
	workspaceId: string;
	assetId: string;
	filename: string;
	dbUrl: string;
	metadata?: Record<string, any>;
}) {
	// 1. Create a Document from the text
	const doc = new Document({
		text,
		metadata: {
			...metadata,
			workspaceId,
			assetId,
			filename,
		},
	});

	// 2. Initialize PG Vector Store
	const vectorStore = new PGVectorStore({
		clientConfig: {
			connectionString: dbUrl,
		},
		schemaName: "public",
		tableName: "brand_knowledge",
		dimensions: 768,
		performSetup: false,
	});

	const storageContext = await storageContextFromDefaults({ vectorStore });

	// 3. Create index (Generates Embeddings)
	await VectorStoreIndex.fromDocuments([doc], {
		storageContext,
	});

	return { status: "indexed" };
}

export async function brandIngestionService({
	url,
	workspaceId,
	assetId,
	filename,
	dbUrl,
}: {
	url: string;
	workspaceId: string;
	assetId: string;
	filename: string;
	dbUrl: string;
}) {
	// 1. Download PDF to temp
	const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "brand-ingest-"));
	const filePath = path.join(tempDir, filename);

	let response: Response | null = null;
	let lastError: any = null;
	const maxRetries = 3;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			if (attempt > 0) {
				await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
			}
			// Use a longer timeout for the fetch
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

			response = await fetch(url, { signal: controller.signal });
			clearTimeout(timeoutId);

			if (response.ok) break;

			if (response.status >= 500) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}
			// For 4xx, don't retry
			break;
		} catch (error) {
			lastError = error;
			console.warn(
				`[rag] Fetch attempt ${attempt} failed for ${filename}:`,
				error instanceof Error ? error.message : String(error),
			);
			if (attempt === maxRetries) throw error;
		}
	}

	if (!response || !response.ok)
		throw new Error(
			`Failed to fetch PDF after ${maxRetries} retries: ${response?.statusText || lastError?.message}`,
		);

	const buffer = Buffer.from(await response.arrayBuffer());
	await fs.writeFile(filePath, buffer);

	try {
		// 2. Parse PDF
		const reader = new PDFReader();
		const docs = await reader.loadData(filePath);

		// Add workspace metadata to all documents
		for (const doc of docs) {
			doc.metadata = {
				...doc.metadata,
				workspaceId,
				assetId,
				sourceUrl: url,
				filename,
			};
		}

		// 3. Initialize PG Vector Store
		const vectorStore = new PGVectorStore({
			clientConfig: {
				connectionString: dbUrl,
			},
			schemaName: "public",
			tableName: "brand_knowledge",
			dimensions: 768,
			performSetup: false, // Prisma handles setup
		});

		const storageContext = await storageContextFromDefaults({ vectorStore });

		// 4. Create index
		await VectorStoreIndex.fromDocuments(docs, {
			storageContext,
		});

		return { chunkCount: docs.length };
	} finally {
		// Cleanup
		try {
			await fs.unlink(filePath);
			await fs.rm(tempDir, { recursive: true, force: true });
		} catch (e) {
			console.error("Failed to cleanup temp files", e);
		}
	}
}
