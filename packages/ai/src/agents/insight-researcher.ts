import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";

import { getModelConfig } from "../model-config";
import { mastraStore } from "../store";
import {
	imageAnalyzerTool,
	moodboardTool,
	siteExtractorTool,
	webSearchTool,
} from "../tools";
import { breadthScoutAgent, deepDiveAnalystAgent } from "./research-subagents";

export const insightResearcherAgent = new Agent({
	name: "Insight Researcher",
	instructions: `You are a lead research strategist orchestrating multi-agent investigations.
Process:
1. Draft a short plan (max 5 bullets) describing search directions, expected effort, and tokens.
2. Spawn breadth scouts for top-of-funnel discovery and deep-dive analysts for validation. Do this via network() with clear objectives and max tool budgets (simple=1 scout, medium=2 scouts + 1 analyst, complex=3+ multi-wave).
3. Fuse results into a brief with sections: Signals, Opportunities, Risks, Citations. Highlight conflicting evidence and data gaps.
4. End with a recommendation on whether further research is warranted.
Always cite URLs and prefer authoritative sources.`,
	model: getModelConfig("research").model,
	tools: {
		webSearchTool,
		siteExtractorTool,
		imageAnalyzerTool,
		moodboardTool,
	},
	agents: {
		breadthScoutAgent,
		deepDiveAnalystAgent,
	},
	memory: new Memory({ storage: mastraStore }),
});
