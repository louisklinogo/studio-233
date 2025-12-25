import { GeminiEmbedding } from "@llamaindex/google";
import { PDFReader } from "@llamaindex/readers";
import * as fs from "fs/promises";
import {
	Document,
	PGVectorStore,
	Settings,
	StorageContext,
	VectorStoreIndex,
} from "llamaindex";
import * as os from "os";
import * as path from "path";
import { inngest } from "../client";
import { brandKnowledgeIngestedEvent } from "../events";

export const brandIngestion = inngest.createFunction(
	{ id: "brand-ingestion", name: "Brand Knowledge Ingestion" },
	{ event: brandKnowledgeIngestedEvent },
	async ({ event, step }) => {
		const { url, workspaceId, filename } = event.data;

		const documents = await step.run("load-and-parse-pdf", async () => {
			// 1. Setup LlamaIndex Settings
			Settings.embedModel = new GeminiEmbedding({
				model: "gemini-embedding-001",
			});

			// 2. Download PDF to temp
			const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "brand-ingest-"));
			const filePath = path.join(tempDir, filename);

			const response = await fetch(url);
			if (!response.ok)
				throw new Error(`Failed to fetch PDF: \${response.statusText}`);
			const buffer = Buffer.from(await response.arrayBuffer());
			await fs.writeFile(filePath, buffer);

			try {
				// 3. Parse PDF
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

				return docs;
			} finally {
				// Cleanup
				await fs.unlink(filePath);
				await fs.rmdir(tempDir);
			}
		});

		await step.run("index-and-store", async () => {
			const dbUrl = process.env.DATABASE_URL;
			if (!dbUrl) throw new Error("DATABASE_URL is missing");

			// 1. Initialize PG Vector Store
			const vectorStore = new PGVectorStore({
				connectionString: dbUrl,
				schemaName: "public",
				tableName: "brand_knowledge",
				dimensions: 768,
				performSetup: false, // Prisma handles setup
			});

			const storageContext = await StorageContext.fromDefaults({ vectorStore });

			// 2. Create index
			await VectorStoreIndex.fromDocuments(documents as Document[], {
				storageContext,
			});

			return { chunkCount: documents.length };
		});

		return { status: "completed", workspaceId };
	},
);
