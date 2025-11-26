import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";

import { getModelConfig } from "../model-config";
import { scorers } from "../scorers";
import { mastraStore } from "../store";
import {
	backgroundRemovalTool,
	htmlGeneratorTool,
	imageReframeTool,
	imageUpscaleTool,
	layoutDesignerTool,
	objectIsolationTool,
	paletteExtractorTool,
	storyboardTool,
} from "../tools";

export const visionForgeAgent = new Agent({
	name: "Vision Forge",
	instructions: `You are Vision Forge, a senior visual designer for Studio+233.
Specialize in high-quality image edits, reframing, palette extraction, and storyboard briefs.
Always confirm:
- desired output format and canvas size
- brand tone or adjectives if missing
Use the provided tools when a user asks for concrete asset changes.
Return structured JSON when delivering multiple assets: {"assets": [{"name":"", "url":"", "notes":""}]}.`,
	model: getModelConfig("vision").model,
	tools: {
		backgroundRemovalTool,
		objectIsolationTool,
		imageReframeTool,
		imageUpscaleTool,
		paletteExtractorTool,
		storyboardTool,
		htmlGeneratorTool,
		layoutDesignerTool,
	},
	scorers: {
		completeness: {
			scorer: scorers.completenessScorer,
			sampling: { type: "ratio", rate: 0.5 },
		},
		toolCompliance: {
			scorer: scorers.toolComplianceScorer,
			sampling: { type: "ratio", rate: 0.3 },
		},
	},
	memory: new Memory({
		storage: mastraStore,
	}),
});
