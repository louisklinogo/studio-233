import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { batchOpsAgent } from "./agents/batch-ops";
import { insightResearcherAgent } from "./agents/insight-researcher";
import { motionDirectorAgent } from "./agents/motion-director";
import { orchestratorAgent } from "./agents/orchestrator";
import { visionForgeAgent } from "./agents/vision-forge";
import { scorers } from "./scorers";
import { mastraStore } from "./store";
import { backgroundRemovalWorkflow } from "./workflows/background-removal";
import {
	htmlGeneratorWorkflow,
	layoutDesignerWorkflow,
} from "./workflows/layout";
import { objectIsolationWorkflow } from "./workflows/object-isolation";
import {
	imageAnalyzerWorkflow,
	moodboardWorkflow,
	siteExtractorWorkflow,
	webSearchWorkflow,
} from "./workflows/research";
import {
	captionOverlayWorkflow,
	textToVideoWorkflow,
	videoGifWorkflow,
	videoStitchWorkflow,
} from "./workflows/video";
import {
	imageReframeWorkflow,
	imageUpscaleWorkflow,
	paletteExtractionWorkflow,
	storyboardWorkflow,
} from "./workflows/vision-enhancements";

export const mastra = new Mastra({
	workflows: {
		backgroundRemovalWorkflow,
		objectIsolationWorkflow,
		imageReframeWorkflow,
		imageUpscaleWorkflow,
		paletteExtractionWorkflow,
		storyboardWorkflow,
		htmlGeneratorWorkflow,
		layoutDesignerWorkflow,
		textToVideoWorkflow,
		videoStitchWorkflow,
		videoGifWorkflow,
		captionOverlayWorkflow,
		webSearchWorkflow,
		siteExtractorWorkflow,
		imageAnalyzerWorkflow,
		moodboardWorkflow,
	},
	agents: {
		orchestratorAgent,
		visionForgeAgent,
		motionDirectorAgent,
		insightResearcherAgent,
		batchOpsAgent,
	},
	scorers,
	storage: mastraStore,
	logger: new PinoLogger({
		name: "Studio233-Mastra",
		level: "info",
	}),
	telemetry: {
		enabled: true,
	},
	observability: {
		default: { enabled: true },
	},
});

export { batchOpsAgent } from "./agents/batch-ops";
export { insightResearcherAgent } from "./agents/insight-researcher";
export { motionDirectorAgent } from "./agents/motion-director";
export { orchestratorAgent } from "./agents/orchestrator";
export {
	breadthScoutAgent,
	deepDiveAnalystAgent,
} from "./agents/research-subagents";
export { visionForgeAgent } from "./agents/vision-forge";
export { getModelConfig } from "./model-config";
export { scorers } from "./scorers";
export { mastraStore } from "./store";
export * from "./tools";
export * from "./workflows/background-removal";
export * from "./workflows/layout";
export * from "./workflows/object-isolation";
export * from "./workflows/research";
export * from "./workflows/video";
export * from "./workflows/vision-enhancements";
