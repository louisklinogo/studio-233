import { prisma } from "./index";

export type BrandKnowledgeResult = {
	id: string;
	content: string;
	metadata: any;
	similarity: number;
};

/**
 * Performs a vector similarity search on BrandKnowledge
 */
export async function searchBrandKnowledge(
	workspaceId: string,
	embedding: number[],
	limit = 5,
): Promise<BrandKnowledgeResult[]> {
	// We use the <=> operator for cosine distance (smaller is better)
	// 1 - distance = similarity (larger is better)
	const results = await prisma.$queryRawUnsafe<any[]>(
		`SELECT id, text as content, metadata, 1 - (embedding <=> $1::vector) as similarity
     FROM brand_knowledge
     WHERE (metadata->>'workspaceId') = $2
     ORDER BY similarity DESC
     LIMIT $3`,
		`[${embedding.join(",")}]`,
		workspaceId,
		limit,
	);

	return results.map((r) => ({
		id: r.id,
		content: r.content,
		metadata: r.metadata,
		similarity: Number(r.similarity),
	}));
}
