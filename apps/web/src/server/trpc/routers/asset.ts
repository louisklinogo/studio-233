import { getSessionWithRetry } from "@studio233/auth/lib/session";
import { prisma } from "@studio233/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { inngest } from "@/inngest/client";
import { publicProcedure, router } from "../init";

export const assetRouter = router({
	/**
	 * Register a new asset (e.g. after uploading to FAL)
	 */
	register: publicProcedure
		.input(
			z.object({
				name: z.string(),
				url: z.string().url(),
				size: z.number(),
				mimeType: z.string(),
				workspaceId: z.string(),
				isBrandAsset: z.boolean().default(false),
				metadata: z.record(z.any()).optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
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
					message: "Workspace not found or unauthorized",
				});
			}

			const asset = await prisma.asset.create({
				data: {
					name: input.name,
					url: input.url,
					size: input.size,
					mimeType: input.mimeType,
					workspaceId: input.workspaceId,
					isBrandAsset: input.isBrandAsset,
					metadata: input.metadata,
				},
			});

			// If it's a PDF brand asset, trigger ingestion
			if (input.isBrandAsset && input.mimeType === "application/pdf") {
				await inngest.send({
					name: "brand.knowledge.ingested",
					data: {
						workspaceId: input.workspaceId,
						assetId: asset.id,
						url: input.url,
						filename: input.name,
					},
				});
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

			return await prisma.asset.delete({
				where: { id: input.id },
			});
		}),
});
