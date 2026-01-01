import { getSessionWithRetry } from "@studio233/auth/lib/session";
import { prisma } from "@studio233/db";
import { inngest } from "@studio233/inngest";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../init";

const MAX_WORKSPACES_PER_USER = 10;

/**
 * Generates a URL-safe slug from a workspace name
 */
function generateSlug(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, 50);
}

export const workspaceRouter = router({
	/**
	 * Create a new workspace
	 * Enforces 10 workspace limit per user
	 */
	create: publicProcedure
		.input(
			z.object({
				name: z.string().min(1).max(100),
				description: z.string().max(500).optional(),
				brandProfile: z
					.object({
						primaryColor: z.string().optional(),
						accentColor: z.string().optional(),
						fontFamily: z.string().optional(),
					})
					.optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const headers = new Headers(ctx.req?.headers);
			const session = await getSessionWithRetry(headers);

			if (!session) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "You must be logged in to create a workspace",
				});
			}

			// Check workspace limit
			const existingCount = await prisma.workspace.count({
				where: { userId: session.user.id },
			});

			if (existingCount >= MAX_WORKSPACES_PER_USER) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: `You can only create up to ${MAX_WORKSPACES_PER_USER} workspaces`,
				});
			}

			// Generate unique slug
			const baseSlug = generateSlug(input.name);
			let slug = baseSlug;
			let counter = 1;

			while (
				await prisma.workspace.findUnique({
					where: { userId_slug: { userId: session.user.id, slug } },
				})
			) {
				slug = `${baseSlug}-${counter}`;
				counter++;
			}

			return await prisma.workspace.create({
				data: {
					name: input.name,
					description: input.description,
					brandProfile: input.brandProfile,
					slug,
					userId: session.user.id,
				},
			});
		}),

	/**
	 * List all workspaces for the current user
	 */
	list: publicProcedure.query(async ({ ctx }) => {
		const headers = new Headers(ctx.req?.headers);
		const session = await getSessionWithRetry(headers);

		if (!session) {
			return [];
		}

		return await prisma.workspace.findMany({
			where: { userId: session.user.id },
			orderBy: { updatedAt: "desc" },
			include: {
				_count: {
					select: { projects: true },
				},
			},
		});
	}),

	/**
	 * Get a single workspace by ID with its projects
	 */
	getById: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ input, ctx }) => {
			const headers = new Headers(ctx.req?.headers);
			const session = await getSessionWithRetry(headers);
			if (!session) {
				return null;
			}

			return await prisma.workspace.findFirst({
				where: {
					id: input.id,
					userId: session.user.id,
				},
				include: {
					projects: {
						orderBy: { updatedAt: "desc" },
						select: {
							id: true,
							name: true,
							description: true,
							thumbnail: true,
							type: true,
							updatedAt: true,
						},
					},
				},
			});
		}),

	/**
	 * Update workspace name or description
	 */
	update: publicProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().min(1).max(100).optional(),
				description: z.string().max(500).optional(),
				brandProfile: z
					.object({
						primaryColor: z.string().optional(),
						accentColor: z.string().optional(),
						fontFamily: z.string().optional(),
					})
					.optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const headers = new Headers(ctx.req?.headers);
			const session = await getSessionWithRetry(headers);

			if (!session) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "You must be logged in to update a workspace",
				});
			}

			// Verify ownership
			const workspace = await prisma.workspace.findUnique({
				where: { id: input.id },
			});

			if (!workspace || workspace.userId !== session.user.id) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Workspace not found or unauthorized",
				});
			}

			// Update slug if name changed
			let slug = workspace.slug;
			if (input.name && input.name !== workspace.name) {
				const baseSlug = generateSlug(input.name);
				slug = baseSlug;
				let counter = 1;

				while (
					await prisma.workspace.findFirst({
						where: {
							userId: session.user.id,
							slug,
							NOT: { id: input.id },
						},
					})
				) {
					slug = `${baseSlug}-${counter}`;
					counter++;
				}
			}

			return await prisma.workspace.update({
				where: { id: input.id },
				data: {
					name: input.name,
					description: input.description,
					brandProfile: input.brandProfile,
					slug,
				},
			});
		}),

	/**
	 * Delete a workspace and all its projects
	 */
	delete: publicProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const headers = new Headers(ctx.req?.headers);
			const session = await getSessionWithRetry(headers);

			if (!session) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "You must be logged in to delete a workspace",
				});
			}

			// Verify ownership
			const workspace = await prisma.workspace.findUnique({
				where: { id: input.id },
			});

			if (!workspace || workspace.userId !== session.user.id) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Workspace not found or unauthorized",
				});
			}

			// Cascade delete handled by Prisma schema
			return await prisma.workspace.delete({
				where: { id: input.id },
			});
		}),

	/**
	 * Get all brand assets for a workspace
	 */
	getBrandAssets: publicProcedure
		.input(z.object({ workspaceId: z.string() }))
		.query(async ({ input, ctx }) => {
			const headers = new Headers(ctx.req?.headers);
			const session = await getSessionWithRetry(headers);
			if (!session) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}

			return await prisma.asset.findMany({
				where: {
					workspaceId: input.workspaceId,
					isBrandAsset: true,
				},
				orderBy: { createdAt: "desc" },
			});
		}),

	/**
	 * Toggle the brand asset flag on an asset
	 */
	toggleBrandAsset: publicProcedure
		.input(
			z.object({
				assetId: z.string(),
				isBrandAsset: z.boolean(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const headers = new Headers(ctx.req?.headers);
			const session = await getSessionWithRetry(headers);
			if (!session) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}

			// Verify ownership via workspace
			const asset = await prisma.asset.findUnique({
				where: { id: input.assetId },
				include: { workspace: true },
			});

			if (!asset || asset.workspace?.userId !== session.user.id) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Asset not found or unauthorized",
				});
			}

			return await prisma.asset.update({
				where: { id: input.assetId },
				data: { isBrandAsset: input.isBrandAsset },
			});
		}),

	/**
	 * Get summarized intelligence readout from indexed brand knowledge
	 */
	getIntelligence: publicProcedure
		.input(z.object({ workspaceId: z.string() }))
		.query(async ({ input, ctx }) => {
			const headers = new Headers(ctx.req?.headers);
			const session = await getSessionWithRetry(headers);
			if (!session) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}

			// 1. Get raw knowledge nodes
			const knowledge = await prisma.brandKnowledge.findMany({
				where: { workspace_id: input.workspaceId },
				select: {
					id: true,
					metadata: true,
					text: true,
					createdAt: true,
				},
				orderBy: { createdAt: "desc" },
			});

			// 2. Aggregate sources and extract insights
			const sourceMap = new Map<string, { name: string; nodeCount: number }>();
			const deducedAttributes = new Set<string>();
			let deducedAesthetic = "";

			for (const node of knowledge) {
				const meta = (node.metadata as any) || {};
				const source = meta.filename || "System_Memory";

				// Track sources
				const existing = sourceMap.get(source) || {
					name: source,
					nodeCount: 0,
				};
				sourceMap.set(source, {
					...existing,
					nodeCount: existing.nodeCount + 1,
				});

				// Extract semantic insights from text or metadata
				// We now prioritize the specific markers we set in vision-sync
				if (node.text.includes("Aesthetic DNA:")) {
					const match = node.text.match(/Aesthetic DNA: (.*)/);
					if (match && !deducedAesthetic) deducedAesthetic = match[1];
				}

				if (node.text.includes("Form & Geometry:")) {
					const match = node.text.match(/Form & Geometry: (.*)/);
					if (match) {
						match[1].split(",").forEach((attr) => {
							const trimmed = attr.trim().toUpperCase();
							if (trimmed && deducedAttributes.size < 12) {
								deducedAttributes.add(trimmed);
							}
						});
					}
				}
			}

			// 3. Get synthesized summary from workspace
			const workspace = await prisma.workspace.findUnique({
				where: { id: input.workspaceId },
				select: { brandSummary: true },
			});

			return {
				totalNodes: knowledge.length,
				sources: Array.from(sourceMap.values()),
				deducedAttributes: Array.from(deducedAttributes),
				deducedAesthetic: deducedAesthetic || "Awaiting further analysis...",
				brandSummary: workspace?.brandSummary as any,
				lastIndexed: knowledge.length > 0 ? knowledge[0].createdAt : null,
				systemState: knowledge.length > 0 ? "STABLE" : "UNINITIALIZED",
			};
		}),

	/**
	 * Manually synchronize and repair the brand archive indexing state
	 */
	syncArchive: publicProcedure
		.input(z.object({ workspaceId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const headers = new Headers(ctx.req?.headers);
			const session = await getSessionWithRetry(headers);
			if (!session) throw new TRPCError({ code: "UNAUTHORIZED" });

			// 1. Get all brand assets
			const assets = await prisma.asset.findMany({
				where: {
					workspaceId: input.workspaceId,
					isBrandAsset: true,
				},
			});

			// 2. Get all indexed asset IDs from metadata
			const indexedAssetIds = await prisma.brandKnowledge.findMany({
				where: { workspace_id: input.workspaceId },
				select: { metadata: true },
			});

			const indexedIds = new Set(
				indexedAssetIds
					.map((k: any) => k.metadata?.assetId)
					.filter((id) => !!id),
			);

			// 3. Find missing assets and trigger sync
			const missingAssets = assets.filter((asset) => !indexedIds.has(asset.id));
			let triggeredCount = 0;

			for (const asset of missingAssets) {
				const classification =
					(asset.metadata as any)?.classification || "CORE_BRAND_MARK";

				if (asset.mimeType === "application/pdf") {
					await inngest.send({
						name: "brand.knowledge.ingested",
						data: {
							workspaceId: input.workspaceId,
							assetId: asset.id,
							url: asset.url,
							filename: asset.name,
							classification,
						},
					});
					triggeredCount++;
				} else if (asset.mimeType.startsWith("image/")) {
					await inngest.send({
						name: "brand.asset.vision_sync",
						data: {
							workspaceId: input.workspaceId,
							assetId: asset.id,
							url: asset.url,
							filename: asset.name,
							classification,
						},
					});
					triggeredCount++;
				}
			}

			// 4. ALWAYS trigger a fresh synthesis if we have assets
			if (assets.length > 0) {
				await inngest.send({
					name: "brand.intelligence.sync_requested",
					data: { workspaceId: input.workspaceId },
				});
			}

			return {
				totalChecked: assets.length,
				alreadyIndexed: indexedIds.size,
				triggeredSync: triggeredCount,
				status: triggeredCount > 0 ? "SYNCHRONIZING" : "STABLE",
			};
		}),
});
