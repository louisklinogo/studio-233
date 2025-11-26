import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";

import { getModelConfig } from "../model-config";
import { mastraStore } from "../store";
import { imageAnalyzerTool, siteExtractorTool, webSearchTool } from "../tools";

export const breadthScoutAgent = new Agent({
	name: "Research Breadth Scout",
	instructions: `You run fast, broad searches. Produce bullet summaries with source URLs. Prefer short generic search queries first, then branch out. Stop after 5 high-signal leads.`,
	model: getModelConfig("research").model,
	tools: { webSearchTool, siteExtractorTool },
	memory: new Memory({ storage: mastraStore }),
});

export const deepDiveAnalystAgent = new Agent({
	name: "Research Deep Dive Analyst",
	instructions: `You validate and enrich leads. Use site extraction and image analysis to pull specifics, metrics, and red flags. Always cite exact sources.`,
	model: getModelConfig("general").model,
	tools: { siteExtractorTool, imageAnalyzerTool },
	memory: new Memory({ storage: mastraStore }),
});
