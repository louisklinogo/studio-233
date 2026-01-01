import { getSessionWithRetry } from "@studio233/auth/lib/session";
import { AssetType, Prisma, prisma } from "@studio233/db";
import { inngest } from "@studio233/inngest";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../init";

export const assetRouter = router({
	/**
	 * Register a new asset (e.g. after uploading to Vercel Blob)
	 */
	register: publicProcedure
		.input(
			z.object({
				name: z.string(),
				url: z.string(),
				size: z.number(),
				mimeType: z.string(),
				workspaceId: z.string(),
				isBrandAsset: z.boolean().default(false),
				classification: z
					.enum(["CORE_BRAND_MARK", "INDEX_AS_INSPIRATION"])
					.optional(),
				metadata: z.record(z.string(), z.any()).optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			console.log("[AssetRouter] Registering asset starting:", input.name);
			const headers = new Headers(ctx.req?.headers);
			const session = await getSessionWithRetry(headers);

			if (!session) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}

			// Verify workspace ownership
			const workspace = await prisma.workspace.findUnique({
				where: { id: input.workspaceId },
			});

			if (!workspace || workspace.userId !== session.user.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Workspace access denied",
				});
			}

			// Infer AssetType from mimeType using strict Enum
			let assetType: AssetType = AssetType.OTHER;
			if (input.mimeType.startsWith("image/")) assetType = AssetType.IMAGE;
			else if (input.mimeType.startsWith("video/")) assetType = AssetType.VIDEO;
			else if (input.mimeType.startsWith("audio/")) assetType = AssetType.AUDIO;
			else if (input.mimeType === "application/pdf")
				assetType = AssetType.DOCUMENT;

			console.log(`[AssetRouter] Intent: ${assetType} (${input.mimeType})`);

			// Proceed with raw creation - let Prisma handle validation errors naturally
			const asset = await prisma.asset.create({
				data: {
					name: input.name,
					url: input.url,
					size: input.size,
					mimeType: input.mimeType,
					type: assetType,
					workspaceId: input.workspaceId,
					isBrandAsset: input.isBrandAsset,
					metadata: (input.metadata as Prisma.InputJsonValue) ?? {
						classification: input.classification,
					},
				},
			});

			console.log("[AssetRouter] Asset persisted successfully:", asset.id);

			// Background Ingestion (Async)
			if (input.isBrandAsset) {
				const classification = input.classification || "CORE_BRAND_MARK";
				if (input.mimeType === "application/pdf") {
					await inngest.send({
						name: "brand.knowledge.ingested",
						data: {
							workspaceId: input.workspaceId,
							assetId: asset.id,
							url: input.url,
							filename: input.name,
							classification,
						},
					});
				} else if (input.mimeType.startsWith("image/")) {
					await inngest.send({
						name: "brand.asset.vision_sync",
						data: {
							workspaceId: input.workspaceId,
							assetId: asset.id,
							url: input.url,
							filename: input.name,
							classification,
						},
					});
				}
			}

			return asset;
		}),

	/**
	 * Delete an asset
	 */
	delete: publicProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const headers = new Headers(ctx.req?.headers);
			const session = await getSessionWithRetry(headers);

			if (!session) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}

			const asset = await prisma.asset.findUnique({
				where: { id: input.id },
				include: { workspace: true },
			});

			if (!asset || asset.workspace?.userId !== session.user.id) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			// Purge RAG memory associated with this asset before deleting the asset itself
			// Note: metadata is a JSONB field, we use a raw filter or a specific prisma query if possible
			// Since we store assetId in metadata, we'll use a specific deletion
			await prisma.brandKnowledge.deleteMany({
				where: {
					workspace_id: asset.workspaceId,
					metadata: {
						path: ["assetId"],
						equals: input.id,
					},
				},
			});

			const result = await prisma.asset.delete({
				where: { id: input.id },
			});

			// Trigger re-synthesis of the brand manifesto since knowledge base changed
			await inngest.send({
				name: "brand.intelligence.sync_requested",
				data: { workspaceId: asset.workspaceId! },
			});

			return result;
		}),

	/**
	 * Bulk delete assets
	 */
	bulkDelete: publicProcedure
		.input(z.object({ ids: z.array(z.string()) }))
		.mutation(async ({ input, ctx }) => {
			const headers = new Headers(ctx.req?.headers);
			const session = await getSessionWithRetry(headers);

			if (!session) {
				throw new TRPCError({ code: "UNAUTHORIZED" });
			}

			// 1. Verify ownership for all assets and get workspaceId
			const assets = await prisma.asset.findMany({
				where: { id: { in: input.ids } },
				include: { workspace: true },
			});

			if (assets.length === 0) return { count: 0 };

			const workspaceId = assets[0].workspaceId;
			const unauthorized = assets.some(
				(a) => a.workspace?.userId !== session.user.id,
			);

			if (unauthorized) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Unauthorized access to one or more assets",
				});
			}

			// 2. Purge RAG memory for all these assets
			await prisma.brandKnowledge.deleteMany({
				where: {
					workspace_id: workspaceId,
					OR: input.ids.map((id) => ({
						metadata: {
							path: ["assetId"],
							equals: id,
						},
					})),
				},
			});

			// 3. Delete the assets
			const result = await prisma.asset.deleteMany({
				where: { id: { in: input.ids } },
			});

			// 4. Trigger single re-synthesis
			if (workspaceId) {
				await inngest.send({
					name: "brand.intelligence.sync_requested",
					data: { workspaceId },
				});
			}

			return result;
		}),
});
