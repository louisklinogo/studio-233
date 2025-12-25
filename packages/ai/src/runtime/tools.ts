import { tool as createAiTool, type ToolExecutionOptions } from "ai";
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
import { askForAspectRatioTool } from "../tools/ui";
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
	visionAnalysisRefTool,
	visionAnalysisTool,
} from "../tools/vision";
import { logger } from "../utils/logger";

const TOOL_DEFINITIONS = {
	delegateToAgent: delegateToAgentTool,
	canvasTextToImage: canvasTextToImageTool,
	askForAspectRatio: askForAspectRatioTool,
	visionAnalysis: visionAnalysisTool,
	visionAnalysisRef: visionAnalysisRefTool,
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

// Re-export TOOL_DEFINITIONS for use in buildToolset
export { TOOL_DEFINITIONS };
export type ToolId = keyof typeof TOOL_DEFINITIONS;

function wrapTool(
	def: ToolDefinition<z.ZodTypeAny, z.ZodTypeAny>,
	injectedContext?: any,
): ReturnType<typeof createAiTool> {
	const factory = createAiTool as any;

	const toolOptions: any = {
		description: def.description,
		parameters: def.inputSchema as unknown as z.ZodTypeAny,
	};

	if (def.execute) {
		toolOptions.execute = async (
			parameters: z.infer<typeof def.inputSchema>,
			toolCallOptions?: ToolExecutionOptions,
		) => {
			const startedAt = Date.now();
			// Ensure parameters is at least an empty object for safeParse
			const params = parameters ?? {};
			const parsed = def.inputSchema.safeParse(params);
			if (!parsed.success) {
				const issues = parsed.error.issues
					.map((issue) => issue.message)
					.join("; ");
				const errorMsg = `Invalid tool input: ${issues}`;

				logger.error(`tool.${def.id}.validation_failed`, {
					durationMs: Date.now() - startedAt,
					message: errorMsg,
					receivedParameters: params,
					issues: parsed.error.issues,
				});

				throw new Error(errorMsg);
			}

			try {
				const ctx = toolCallOptions?.experimental_context;
				const flattenedContext =
					ctx && typeof ctx === "object"
						? (ctx as Record<string, unknown>)
						: {};

				// Pass the request context (experimental_context) + injected utilities
				return await def.execute!({
					context: parsed.data,
					runtimeContext: {
						...flattenedContext,
						toolCallId: toolCallOptions?.toolCallId,
						messages: toolCallOptions?.messages,
						abortSignal: toolCallOptions?.abortSignal,
						...injectedContext,
					},
				});
			} catch (error) {
				logger.error(`tool.${def.id}.failed`, {
					durationMs: Date.now() - startedAt,
					message: error instanceof Error ? error.message : String(error),
					parameterKeys: Object.keys(parameters ?? {}),
				});
				throw error;
			}
		};
	}

	return factory(toolOptions) as ReturnType<typeof createAiTool>;
}

// Legacy static toolkit (without context)
const toolkitEntries: Array<[ToolId, ReturnType<typeof createAiTool>]> =
	Object.entries(TOOL_DEFINITIONS).map(([key, def]) => [
		key as ToolId,
		wrapTool(def as ToolDefinition<z.ZodTypeAny, z.ZodTypeAny>),
	]);
export const TOOLKIT = Object.fromEntries(toolkitEntries) as Record<
	ToolId,
	ReturnType<typeof createAiTool>
>;

// Dynamic toolset builder with context injection
export function buildToolset(ids: ToolId[], runtimeContext?: any) {
	return ids.reduce<Record<string, ReturnType<typeof createAiTool>>>(
		(acc, id) => {
			const def = TOOL_DEFINITIONS[id];
			if (def) {
				acc[id] = wrapTool(
					def as ToolDefinition<z.ZodTypeAny, z.ZodTypeAny>,
					runtimeContext,
				);
			}
			return acc;
		},
		{},
	);
}

export function getToolDefinition(id: ToolId) {
	return TOOL_DEFINITIONS[id];
}
