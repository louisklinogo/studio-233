import { retrievalService } from "@studio233/rag";
import { z } from "zod";
import { createTool } from "./factory";

export const consultBrandGuidelinesTool = createTool({
	id: "consult-brand-guidelines",
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
			.describe("The workspace ID to look up guidelines for"),
	}),
	execute: async ({ context }) => {
		// Search DB using RAG service
		const results = await retrievalService(context.workspaceId, context.query);

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
