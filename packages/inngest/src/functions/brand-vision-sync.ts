import type { VisionAnalysisResult } from "@studio233/ai/schemas/vision-analysis";
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
		const { url, workspaceId, filename, assetId, classification } = event.data;

		// 1. Run Vision Analysis (No DB Connection Held)
		const analysis = (await step.run("extract-visual-dna", async () => {
			return await runVisionAnalysisWorkflow(
				{
					imageUrl: url,
				},
				{
					mode: "full",
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
		})) as VisionAnalysisResult;

		// 2. Index Visual Insights into RAG (Short DB Interaction)
		await step.run("index-visual-knowledge", async () => {
			const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
			const dbUrl = process.env.DATABASE_URL;
			if (!googleApiKey || !dbUrl) throw new Error("Missing AI/DB Config");

			initLlamaIndex(googleApiKey);

			// Construct a "Visual DNA" document - moving from literal to semantic
			const visualRule = `
				ASSET_IDENTITY: ${filename}
				SEMANTIC_CLASS: ${classification}
				
				VISUAL_DEDUCTION:
				- Context: ${analysis.global_context.scene_description}
				- Aesthetic DNA: ${analysis.global_context.weather_atmosphere || "Industrial Minimalism"}
				- Form & Geometry: ${analysis.objects.map((o) => o.label).join(", ")}
				- Signal Palette: ${analysis.color_palette.dominant_hex_estimates.join(", ")}
				
				REASONING_FRAGMENT: 
				The visual presence of ${filename} suggests a brand identity centered on ${analysis.global_context.weather_atmosphere?.toLowerCase() || "functional clarity"}. 
				The composition utilizes ${analysis.composition.camera_angle} framing which projects a sense of ${analysis.composition.camera_angle === "eye-level" ? "stability and accessibility" : "authority"}.
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
					classification,
				},
			});
		});

		// 3. Auto-Sync Palette (Short DB Interaction)
		await step.run("sync-core-palette", async () => {
			// Only auto-sync palette for core brand marks
			if (classification !== "CORE_BRAND_MARK") return;

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

		// 4. Trigger Global Synthesis Sync
		await step.run("trigger-synthesis", async () => {
			await inngest.send({
				name: "brand.intelligence.sync_requested",
				data: { workspaceId },
			});
		});

		return { status: "synchronized", assetId };
	},
);
