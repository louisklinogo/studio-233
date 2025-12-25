import { searchBrandKnowledge } from "@studio233/db/vector-search";
import { Settings } from "llamaindex";
import { z } from "zod";
import { initLlamaIndex } from "../utils/llama-index";
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
		initLlamaIndex();

		// 1. Generate embedding for the query
		const embedModel = new GeminiEmbedding({
			model: "gemini-embedding-001",
		});
		const embedding = await embedModel.getTextEmbedding(context.query);

		// 2. Search DB
		const results = await searchBrandKnowledge(context.workspaceId, embedding);

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
