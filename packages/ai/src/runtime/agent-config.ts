import type { AgentType } from "../model-config";
import {
	BATCH_OPS_PROMPT,
	BREADTH_SCOUT_PROMPT,
	DEEP_DIVE_ANALYST_PROMPT,
	INSIGHT_RESEARCHER_PROMPT,
	MOTION_DIRECTOR_PROMPT,
	ORCHESTRATOR_PROMPT,
	VISION_FORGE_PROMPT,
} from "../prompts";
import type { ToolId } from "./tools";

export type AgentKey =
	| "orchestrator"
	| "vision"
	| "motion"
	| "insight"
	| "batch"
	| "breadth-scout"
	| "deep-dive";

export type AgentDefinition = {
	key: AgentKey;
	name: string;
	prompt: string;
	model: AgentType;
	tools: ToolId[];
};

export const AGENT_DEFINITIONS: Record<AgentKey, AgentDefinition> = {
	orchestrator: {
		key: "orchestrator",
		name: "Studio Orchestrator",
		prompt: ORCHESTRATOR_PROMPT,
		model: "orchestrator",
		tools: [
			"delegateToAgent",
			"canvasTextToImage",
			"htmlToCanvas",
			"imageReframe",
			"imageUpscale",
			"paletteExtractor",
			"moodboard",
			"textToVideo",
			"captionOverlay",
			"htmlGenerator",
			"layoutDesigner",
		],
	},
	vision: {
		key: "vision",
		name: "Vision Forge",
		prompt: VISION_FORGE_PROMPT,
		model: "vision",
		tools: [
			"backgroundRemoval",
			"objectIsolation",
			"imageReframe",
			"imageUpscale",
			"paletteExtractor",
			"storyboard",
			"htmlToCanvas",
			"htmlGenerator",
			"layoutDesigner",
		],
	},
	motion: {
		key: "motion",
		name: "Motion Director",
		prompt: MOTION_DIRECTOR_PROMPT,
		model: "motion",
		tools: ["textToVideo", "videoStitch", "videoGif", "captionOverlay"],
	},
	insight: {
		key: "insight",
		name: "Insight Researcher",
		prompt: INSIGHT_RESEARCHER_PROMPT,
		model: "research",
		tools: ["webSearch", "siteExtractor", "imageAnalyzer", "moodboard"],
	},
	batch: {
		key: "batch",
		name: "Batch Ops",
		prompt: BATCH_OPS_PROMPT,
		model: "batch",
		tools: ["batchPlanner"],
	},
	"breadth-scout": {
		key: "breadth-scout",
		name: "Research Breadth Scout",
		prompt: BREADTH_SCOUT_PROMPT,
		model: "research",
		tools: ["webSearch", "siteExtractor"],
	},
	"deep-dive": {
		key: "deep-dive",
		name: "Research Deep Dive Analyst",
		prompt: DEEP_DIVE_ANALYST_PROMPT,
		model: "general",
		tools: ["siteExtractor", "imageAnalyzer"],
	},
};

export function resolveAgentKeyByName(name: string): AgentKey | undefined {
	return (
		Object.values(AGENT_DEFINITIONS).find((agent) => agent.name === name) ?? {}
	).key as AgentKey | undefined;
}

export function getAgentName(key: AgentKey) {
	return AGENT_DEFINITIONS[key]?.name;
}
