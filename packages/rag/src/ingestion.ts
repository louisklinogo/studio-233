import { PGVectorStore } from "@llamaindex/postgres";
import { PDFReader } from "@llamaindex/readers/pdf";
import * as fs from "fs/promises";
import { storageContextFromDefaults, VectorStoreIndex } from "llamaindex";
import * as os from "os";
import * as path from "path";

export async function brandIngestionService({
	url,
	workspaceId,
	filename,
	dbUrl,
}: {
	url: string;
	workspaceId: string;
	filename: string;
	dbUrl: string;
}) {
	// 1. Download PDF to temp
	const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "brand-ingest-"));
	const filePath = path.join(tempDir, filename);

	const response = await fetch(url);
	if (!response.ok)
		throw new Error(`Failed to fetch PDF: ${response.statusText}`);
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
