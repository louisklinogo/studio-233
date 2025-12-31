import { runVisionAnalysisWorkflow } from "@studio233/ai/workflows/vision-analysis";
import { prisma } from "@studio233/db";
import { brandIngestionService, initLlamaIndex } from "@studio233/rag";
import { inngest } from "../client";

export const brandVisionSync = inngest.createFunction(
	{ id: "brand-vision-sync", name: "Brand Visual DNA Extraction" },
	{ event: "brand.asset.vision_sync" },
	async ({ event, step }) => {
		const { url, workspaceId, filename, assetId } = event.data;

		// 1. Run Vision Analysis
		const analysis = await step.run("extract-visual-dna", async () => {
			return await runVisionAnalysisWorkflow({
				imageUrl: url,
				mode: "full",
			});
		});

		// 2. Index Visual Insights into RAG
		await step.run("index-visual-knowledge", async () => {
			const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
			const dbUrl = process.env.DATABASE_URL;
			if (!googleApiKey || !dbUrl) throw new Error("Missing AI/DB Config");

			initLlamaIndex(googleApiKey);

			// Construct a "Visual Rule" document
			const visualRule = `
				BRAND_VISUAL_MARK: ${filename}
				ICONOGRAPHY_STYLE: ${analysis.scene_description}
				DOMINANT_COLORS: ${analysis.palette.map((p) => p.hex).join(", ")}
				DETECTED_ELEMENTS: ${analysis.objects.map((o) => o.label).join(", ")}
				DESIGN_AESTHETIC: This brand mark follows a ${analysis.scene_description.toLowerCase()} aesthetic.
			`;

			// We use a dummy URL for the memory node
			const blob = new Blob([visualRule], { type: "text/plain" });
			const memoryUrl = `memory://visual-dna/${assetId}`;

			// Manually store this knowledge chunk
			await prisma.brandKnowledge.create({
				data: {
					text: visualRule,
					workspace_id: workspaceId,
					metadata: {
						source: "Vision_Analysis",
						assetId,
						filename,
						type: "visual_dna",
					},
				},
			});
		});

		// 3. Auto-Sync Palette if workspace is uninitialized
		await step.run("sync-core-palette", async () => {
			const workspace = await prisma.workspace.findUnique({
				where: { id: workspaceId },
			});

			const profile = (workspace?.brandProfile as any) || {};
			const isDefault =
				!profile.primaryColor || profile.primaryColor === "#111111";

			if (isDefault && analysis.palette.length > 0) {
				const primary = analysis.palette[0].hex;
				const accent = analysis.palette[1]?.hex || primary;

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
