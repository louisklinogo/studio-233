import { tool as createAiTool } from "ai";
import { z } from "zod";
import { batchJobPlannerTool } from "../tools/batch";
import { canvasTextToImageTool } from "../tools/canvas";
import type { ToolDefinition } from "../tools/factory";
import { delegateToAgentTool } from "../tools/orchestration";
import {
	imageAnalyzerTool,
	moodboardTool,
	siteExtractorTool,
	webSearchTool,
} from "../tools/research";
import {
	captionOverlayTool,
	textToVideoTool,
	videoGifTool,
	videoStitchTool,
} from "../tools/video";
import {
	backgroundRemovalTool,
	htmlGeneratorTool,
	htmlToCanvasTool,
	imageReframeTool,
	imageUpscaleTool,
	layoutDesignerTool,
	objectIsolationTool,
	paletteExtractorTool,
	storyboardTool,
} from "../tools/vision";
import { logger } from "../utils/logger";

const TOOL_DEFINITIONS = {
	delegateToAgent: delegateToAgentTool,
	canvasTextToImage: canvasTextToImageTool,
	backgroundRemoval: backgroundRemovalTool,
	objectIsolation: objectIsolationTool,
	imageReframe: imageReframeTool,
	imageUpscale: imageUpscaleTool,
	paletteExtractor: paletteExtractorTool,
	storyboard: storyboardTool,
	htmlToCanvas: htmlToCanvasTool,
	htmlGenerator: htmlGeneratorTool,
	layoutDesigner: layoutDesignerTool,
	textToVideo: textToVideoTool,
	videoStitch: videoStitchTool,
	videoGif: videoGifTool,
	captionOverlay: captionOverlayTool,
	webSearch: webSearchTool,
	siteExtractor: siteExtractorTool,
	imageAnalyzer: imageAnalyzerTool,
	moodboard: moodboardTool,
	batchPlanner: batchJobPlannerTool,
} as const;

export type ToolId = keyof typeof TOOL_DEFINITIONS;

function wrapTool<
	TInputSchema extends z.ZodTypeAny,
	TOutputSchema extends z.ZodTypeAny,
>(def: ToolDefinition<TInputSchema, TOutputSchema>) {
	const factory = createAiTool as any;
	return factory({
		description: def.description,
		parameters: def.inputSchema as unknown as z.ZodTypeAny,
		execute: async (
			parameters: z.infer<TInputSchema>,
			runtimeContext?: any,
		) => {
			const startedAt = Date.now();
			const parsed = def.inputSchema.safeParse(parameters);
			if (!parsed.success) {
				const issues = parsed.error.issues
					.map((issue) => issue.message)
					.join("; ");
				throw new Error(`Invalid tool input: ${issues}`);
			}

			try {
				return await def.execute({ context: parsed.data, runtimeContext });
			} catch (error) {
				logger.error(`tool.${def.id}.failed`, {
					durationMs: Date.now() - startedAt,
					message: error instanceof Error ? error.message : String(error),
					parameterKeys: Object.keys(parameters ?? {}),
				});
				throw error;
			}
		},
	}) as ReturnType<typeof createAiTool>;
}
const toolkitEntries: Array<[ToolId, ReturnType<typeof createAiTool>]> = [];

for (const [key, def] of Object.entries(TOOL_DEFINITIONS) as Array<
	[ToolId, ToolDefinition<z.ZodTypeAny, z.ZodTypeAny>]
>) {
	toolkitEntries.push([key, wrapTool(def)]);
}

export const TOOLKIT = Object.fromEntries(toolkitEntries) as Record<
	ToolId,
	ReturnType<typeof createAiTool>
>;

export function buildToolset(ids: ToolId[]) {
	return ids.reduce<Record<string, ReturnType<typeof createAiTool>>>(
		(acc, id) => {
			acc[id] = TOOLKIT[id];
			return acc;
		},
		{},
	);
}

export function getToolDefinition(id: ToolId) {
	return TOOL_DEFINITIONS[id];
}
