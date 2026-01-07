import { tool as createAiTool, type ToolExecutionOptions } from "ai";
import { z } from "zod";
import {
	consultBrandGuidelinesTool,
	updateBrandMemoryTool,
} from "../tools/brand";
import { canvasTextToImageTool } from "../tools/canvas";
import type { ToolDefinition } from "../tools/factory";
import { delegateToAgentTool } from "../tools/orchestration";
import { proposePlanTool } from "../tools/planning";
import { renderHtmlTool } from "../tools/render-html";
import {
	browserClickTool,
	browserNavigateTool,
	browserScrollTool,
	browserTypeTool,
	browserWaitTool,
	moodboardTool,
	pixelDataExtractorTool,
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
	objectIsolationTool,
	paletteExtractorTool,
	storyboardTool,
	visionAnalysisRefTool,
	visionAnalysisTool,
} from "../tools/vision";
import { logger } from "../utils/logger";

const TOOL_DEFINITIONS = {
	delegateToAgent: delegateToAgentTool,
	proposePlan: proposePlanTool,
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
	renderHtml: renderHtmlTool,
	htmlGenerator: htmlGeneratorTool,
	textToVideo: textToVideoTool,
	videoStitch: videoStitchTool,
	videoGif: videoGifTool,
	captionOverlay: captionOverlayTool,
	webSearch: webSearchTool,
	siteExtractor: siteExtractorTool,
	pixelDataExtractor: pixelDataExtractorTool,
	moodboard: moodboardTool,
	browserNavigate: browserNavigateTool,
	browserClick: browserClickTool,
	browserType: browserTypeTool,
	browserScroll: browserScrollTool,
	browserWait: browserWaitTool,
	consultBrandGuidelines: consultBrandGuidelinesTool,
	updateBrandMemory: updateBrandMemoryTool,
} as const;

// Re-export TOOL_DEFINITIONS for use in buildToolset
export { TOOL_DEFINITIONS };
export type ToolId = keyof typeof TOOL_DEFINITIONS;

function normalizeToolName(name: string): string {
	return name.replace(/[-_]([a-z])/g, (g) => g[1].toUpperCase());
}

function wrapTool(
	def: ToolDefinition<z.ZodTypeAny, z.ZodTypeAny>,
	injectedContext?: any,
): ReturnType<typeof createAiTool> {
	const factory = createAiTool as any;

	const toolOptions: any = {
		description: def.description,
		parameters: def.inputSchema as unknown as z.ZodTypeAny,
		requireApproval: def.requireApproval,
	};

	if (def.execute) {
		toolOptions.execute = async (
			parameters: z.infer<typeof def.inputSchema>,
			toolCallOptions?: ToolExecutionOptions,
		) => {
			const startedAt = Date.now();

			// Observability: Log raw input before any processing or validation
			logger.info(`tool.${def.id}.invoked`, {
				parameters,
				toolCallId: toolCallOptions?.toolCallId,
			});

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
						workspaceId:
							flattenedContext.workspaceId || injectedContext?.workspaceId,
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

// Dynamic toolset builder with context injection and legacy name support
export function buildToolset(ids: ToolId[], runtimeContext?: any) {
	const toolset: Record<string, ReturnType<typeof createAiTool>> = {};

	for (const id of ids) {
		const normalizedId = normalizeToolName(id) as ToolId;
		const def = TOOL_DEFINITIONS[normalizedId] || TOOL_DEFINITIONS[id];

		if (def) {
			const tool = wrapTool(
				def as ToolDefinition<z.ZodTypeAny, z.ZodTypeAny>,
				runtimeContext,
			);
			// Register canonical name
			toolset[normalizedId] = tool;
			// Register requested name if different
			if (id !== normalizedId) {
				toolset[id] = tool;
			}
			// Register legacy variants (kebab and snake)
			const kebab = normalizedId.replace(
				/[A-Z]/g,
				(g) => `-${g.toLowerCase()}`,
			);
			const snake = normalizedId.replace(
				/[A-Z]/g,
				(g) => `_${g.toLowerCase()}`,
			);
			toolset[kebab] = tool;
			toolset[snake] = tool;
		}
	}

	return toolset;
}

export function getToolDefinition(id: ToolId) {
	return TOOL_DEFINITIONS[id];
}
