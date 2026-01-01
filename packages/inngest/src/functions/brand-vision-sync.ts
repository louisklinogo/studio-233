import { runVisionAnalysisWorkflow } from "@studio233/ai/workflows/vision-analysis";
import { prisma } from "@studio233/db";
import { brandTextIngestionService, initLlamaIndex } from "@studio233/rag";
import { inngest } from "../client";

export const brandVisionSync = inngest.createFunction(
	{
		id: "brand-vision-sync",
		name: "Brand Visual DNA Extraction",
		throttle: {
			limit: 1,
			period: "1m",
			key: "event.data.workspaceId",
		},
	},
	{ event: "brand.asset.vision_sync" },
	async ({ event, step }) => {
		const { url, workspaceId, filename, assetId } = event.data;

		// 1. Run Vision Analysis (No DB Connection Held)
		const analysis = await step.run("extract-visual-dna", async () => {
			return await runVisionAnalysisWorkflow(
				{
					imageUrl: url,
					mode: "full",
				},
				{
					onResult: async (result, imageHash) => {
						await inngest.send({
							name: "vision.archive.requested",
							data: {
								imageUrl: url,
								imageHash,
								metadata: result as any,
							},
						});
					},
				},
			);
		});

		// 2. Index Visual Insights into RAG (Short DB Interaction)
		await step.run("index-visual-knowledge", async () => {
			const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
			const dbUrl = process.env.DATABASE_URL;
			if (!googleApiKey || !dbUrl) throw new Error("Missing AI/DB Config");

			initLlamaIndex(googleApiKey);

			// Construct a "Visual Rule" document
			const visualRule = `
				BRAND_VISUAL_MARK: ${filename}
				ICONOGRAPHY_STYLE: ${analysis.global_context.scene_description}
				DOMINANT_COLORS: ${analysis.color_palette.dominant_hex_estimates.join(", ")}
				DETECTED_ELEMENTS: ${analysis.objects.map((o) => o.label).join(", ")}
				DESIGN_AESTHETIC: This brand mark follows a ${analysis.global_context.scene_description.toLowerCase()} aesthetic.
			`;

			// Manually store this knowledge chunk (with Embeddings)
			return await brandTextIngestionService({
				text: visualRule,
				workspaceId,
				assetId,
				filename,
				dbUrl,
				metadata: {
					source: "Vision_Analysis",
					type: "visual_dna",
				},
			});
		});

		// 3. Auto-Sync Palette (Short DB Interaction)
		await step.run("sync-core-palette", async () => {
			const workspace = await prisma.workspace.findUnique({
				where: { id: workspaceId },
				select: { id: true, brandProfile: true },
			});

			const profile = (workspace?.brandProfile as any) || {};
			const isDefault =
				!profile.primaryColor || profile.primaryColor === "#111111";

			if (
				isDefault &&
				analysis.color_palette.dominant_hex_estimates.length > 0
			) {
				const primary = analysis.color_palette.dominant_hex_estimates[0];
				const accent =
					analysis.color_palette.dominant_hex_estimates[1] || primary;

				await prisma.workspace.update({
					where: { id: workspaceId },
					data: {
						brandProfile: {
							...profile,
							primaryColor: primary,
							accentColor: accent,
						},
					},
				});
			}
		});

		return { status: "synchronized", assetId };
	},
);
