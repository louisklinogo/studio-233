import { retrievalService } from "@studio233/rag";
import { z } from "zod";
import { createTool } from "./factory";

export const consultBrandGuidelinesTool = createTool({
	id: "consultBrandGuidelines",
	description:
		"Consult the brand guidelines, tone of voice, or visual identity rules stored for this workspace. Use this to ensure generations are on-brand.",
	inputSchema: z.object({
		query: z
			.string()
			.describe(
				"The specific brand-related question or rule to look up (e.g., 'visual style for posters')",
			),
		workspaceId: z
			.string()
			.optional()
			.describe("The workspace ID to look up guidelines for (optional)"),
	}),
	execute: async ({ context, runtimeContext }) => {
		const workspaceId = context.workspaceId || runtimeContext?.workspaceId;
		if (!workspaceId) {
			throw new Error("No workspaceId provided or found in context");
		}

		// Search DB using RAG service
		const results = await retrievalService(workspaceId, context.query);

		if (results.length === 0) {
			return {
				message: "No specific brand guidelines found for this query.",
				data: [],
			};
		}

		return {
			message: `Found ${results.length} relevant guidelines.`,
			data: results.map((r) => ({
				content: r.content,
				similarity: r.similarity,
			})),
		};
	},
});

export const updateBrandMemoryTool = createTool({
	id: "updateBrandMemory",
	description:
		"Save a design preference, brand rule, or visual constraint learned during the session. Use this when the user expresses a preference they want the AI to remember (e.g., 'I always prefer minimalist layouts').",
	inputSchema: z.object({
		rule: z
			.string()
			.describe(
				"The specific rule or preference to remember (e.g., 'Never use rounded corners on buttons')",
			),
		category: z
			.enum(["typography", "color", "layout", "motion", "tone", "general"])
			.default("general")
			.describe("The category of the brand rule"),
		workspaceId: z
			.string()
			.optional()
			.describe("The workspace ID to save the guideline for (optional)"),
	}),
	execute: async ({ context, runtimeContext }) => {
		const workspaceId = context.workspaceId || runtimeContext?.workspaceId;
		if (!workspaceId) {
			throw new Error("No workspaceId provided or found in context");
		}

		const inngest = (runtimeContext as any)?.inngest;

		if (!inngest) {
			// Fallback: If Inngest is missing (e.g. testing), we can't background it safely without setup
			throw new Error("Inngest client not available in runtime context");
		}

		await inngest.send({
			name: "brand.knowledge.text_added",
			data: {
				workspaceId: workspaceId,
				text: context.rule,
				category: context.category,
			},
		});

		return {
			message: "Preference queued for brand memory indexing.",
			status: "success",
		};
	},
});
