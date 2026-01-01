import { GEMINI_PRO_MODEL } from "@studio233/ai/model-config";
import { createGoogleProvider } from "@studio233/ai/utils/model";
import { Prisma, prisma } from "@studio233/db";
import { generateObject } from "ai";
import { z } from "zod";
import { inngest } from "../client";
import { brandIntelligenceSyncEvent } from "../events";

const brandSummarySchema = z.object({
	manifesto: z
		.string()
		.describe(
			"A high-level, poetic yet technical description of the brand identity.",
		),
	voice: z.array(z.string()).describe("3-5 keywords defining the verbal tone."),
	visual_dna: z
		.array(z.string())
		.describe("3-5 keywords defining the visual aesthetic."),
	principles: z
		.array(
			z.object({
				title: z.string(),
				description: z.string(),
			}),
		)
		.describe("Core design or operational principles deduced from the assets."),
});

export const brandIntelligenceSynthesize = inngest.createFunction(
	{
		id: "brand-intelligence-synthesize",
		name: "Brand Intelligence Synthesis",
		concurrency: 1,
	},
	{ event: brandIntelligenceSyncEvent },
	async ({ event, step }) => {
		const { workspaceId } = event.data;

		// 1. Gather all knowledge for this workspace
		const knowledge = await step.run("fetch-knowledge", async () => {
			return await prisma.brandKnowledge.findMany({
				where: { workspace_id: workspaceId },
				select: { text: true },
				take: 50,
			});
		});

		if (knowledge.length === 0) {
			await step.run("clear-brand-summary", async () => {
				await prisma.workspace.update({
					where: { id: workspaceId },
					data: { brandSummary: Prisma.DbNull },
				});
			});
			return { status: "cleared" };
		}

		// 2. Synthesize using LLM
		const synthesis = await step.run("synthesize-dna", async () => {
			const google = createGoogleProvider({
				apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
			});

			const prompt = `
				You are a world-class Brand Strategist and Swiss Design Expert.
				Below is a collection of "DNA fragments" extracted from various brand assets (logos, guidelines, designs).
				
				Your task is to synthesize these fragments into a cohesive, authoritative "Brand Manifesto".
				Do not be literal (e.g., don't just say "there is a chess piece").
				Instead, deduce the abstract values, design era, and emotional resonance.
				
				KNOWLEDGE_FRAGMENTS:
				${knowledge.map((k) => "- " + k.text).join("\n")}
			`;

			const { object } = await generateObject({
				model: google(GEMINI_PRO_MODEL),
				schema: brandSummarySchema,
				prompt,
			});

			return object;
		});

		// 3. Update Workspace
		await step.run("update-workspace-summary", async () => {
			await prisma.workspace.update({
				where: { id: workspaceId },
				data: { brandSummary: synthesis as any },
			});
		});

		return { status: "synthesized", workspaceId };
	},
);
