import { prisma } from "@studio233/db";
import { initLlamaIndex, retrievalService } from "@studio233/rag";
import { kv } from "@vercel/kv";
import type { BrandContext, BrandIdentity } from "./types";

const IDENTITY_CACHE_TTL = 300; // 5 minutes

export async function resolveIdentity(
	workspaceId: string,
): Promise<BrandIdentity> {
	const cacheKey = `brand:identity:${workspaceId}`;

	// 1. Try Cache (Tier 1 - Fast)
	try {
		const cached = await kv.get<BrandIdentity>(cacheKey);
		if (cached) {
			return cached;
		}
	} catch (cacheError) {
		console.warn("[BrandResolver] Cache access fault:", cacheError);
	}

	// 2. Fetch from Database (Tier 2 - Source of Truth)
	const workspace = await prisma.workspace.findUnique({
		where: { id: workspaceId },
		select: { brandProfile: true },
	});

	const profile = (workspace?.brandProfile as any) || {};

	const identity: BrandIdentity = {
		primaryColor: profile.primaryColor || "#111111",
		accentColor: profile.accentColor || "#888888",
		fontFamily: profile.fontFamily || "Cabinet Grotesk",
	};

	// 3. Backfill Cache
	try {
		await kv.set(cacheKey, identity, { ex: IDENTITY_CACHE_TTL });
	} catch (cacheError) {
		console.warn("[BrandResolver] Failed to backfill cache:", cacheError);
	}

	return identity;
}

export async function resolveKnowledge(
	workspaceId: string,
	query: string,
): Promise<string[]> {
	try {
		const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
		if (!googleKey) return [];

		initLlamaIndex(googleKey);
		const results = await retrievalService(workspaceId, query);

		// Snippet Culling: Top 3 fragments
		return results.slice(0, 3).map((r) => r.content);
	} catch (error) {
		console.error("[BrandResolver] RAG retrieval failed:", error);
		return [];
	}
}

export async function resolveVisualDna(workspaceId: string): Promise<string[]> {
	try {
		const nodes = await prisma.brandKnowledge.findMany({
			where: {
				workspace_id: workspaceId,
				// Simplified for consistency
				metadata: { equals: { type: "visual_dna" } } as any,
			},
			take: 5,
		});

		return nodes.map((n) => n.text);
	} catch (error) {
		console.error("[BrandResolver] Visual DNA retrieval failed:", error);
		return [];
	}
}

export async function resolveBrandContext(
	workspaceId: string,
	query: string,
): Promise<BrandContext> {
	const [identity, knowledge, visualDna, brandAssets] = await Promise.all([
		resolveIdentity(workspaceId),
		resolveKnowledge(workspaceId, query),
		resolveVisualDna(workspaceId),
		prisma.asset.findMany({
			where: { workspaceId, isBrandAsset: true },
			select: { name: true, url: true, type: true },
		}),
	]);

	return {
		identity,
		knowledge,
		visualDna,
		assets: brandAssets.map((a) => ({
			name: a.name,
			url: a.url,
			type: a.type,
		})),
	};
}
