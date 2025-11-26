import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";

import { getModelConfig } from "../model-config";
import { scorers } from "../scorers";
import { mastraStore } from "../store";
import {
	captionOverlayTool,
	htmlGeneratorTool,
	imageReframeTool,
	imageUpscaleTool,
	layoutDesignerTool,
	moodboardTool,
	paletteExtractorTool,
	textToVideoTool,
} from "../tools";
import { batchOpsAgent } from "./batch-ops";
import { insightResearcherAgent } from "./insight-researcher";
import { motionDirectorAgent } from "./motion-director";
import { visionForgeAgent } from "./vision-forge";

export const orchestratorAgent = new Agent({
	name: "Studio Orchestrator",
	instructions: `You are the primary routing brain for Studio+233.
Steps:
1. Clarify missing inputs (asset type, count, format, deadlines).
2. Decide whether to delegate to Vision Forge, Motion Director, Insight Researcher, or Batch Ops.
3. When delegation makes sense, call that agent via network().
4. If the request is small (single-tool), you may call a tool directly.
Respond with JSON when providing classifications: {"intent":"VISION|MOTION|RESEARCH|BATCH","confidence":0-1,"reasoning":""}.`,
	model: getModelConfig("orchestrator").model,
	agents: {
		visionForgeAgent,
		motionDirectorAgent,
		insightResearcherAgent,
		batchOpsAgent,
	},
	tools: {
		imageReframeTool,
		imageUpscaleTool,
		paletteExtractorTool,
		moodboardTool,
		textToVideoTool,
		captionOverlayTool,
		htmlGeneratorTool,
		layoutDesignerTool,
	},
	scorers: {
		routing: {
			scorer: scorers.routingDecisionScorer,
			sampling: { type: "ratio", rate: 0.5 },
		},
	},
	memory: new Memory({ storage: mastraStore }),
});
