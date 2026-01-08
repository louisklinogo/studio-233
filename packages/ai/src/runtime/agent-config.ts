import type { AgentType } from "../model-config";
import {
	INSIGHT_RESEARCHER_PROMPT,
	MOTION_DIRECTOR_PROMPT,
	ORCHESTRATOR_PROMPT,
	VISION_FORGE_PROMPT,
	VISUAL_SCOUT_PROMPT,
} from "../prompts";
import type { ToolId } from "./tools";

export type AgentKey =
	| "orchestrator"
	| "vision"
	| "motion"
	| "insight"
	| "visual-scout";

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
			"proposePlan",
			"canvasTextToImage",
			"askForAspectRatio",
			"visionAnalysis",
			"visionAnalysisRef",
			"htmlToCanvas",
			"renderHtml",
			"imageReframe",
			"imageUpscale",
			"paletteExtractor",
			"moodboard",
			"textToVideo",
			"captionOverlay",
			"htmlGenerator",
			"consultBrandGuidelines",
			"updateBrandMemory",
		],
	},
	vision: {
		key: "vision",
		name: "Vision Forge",
		prompt: VISION_FORGE_PROMPT,
		model: "vision",
		tools: [
			"visionAnalysis",
			"visionAnalysisRef",
			"canvasTextToImage",
			"backgroundRemoval",
			"objectIsolation",
			"imageReframe",
			"imageUpscale",
			"paletteExtractor",
			"storyboard",
			"htmlToCanvas",
			"renderHtml",
			"htmlGenerator",
			"consultBrandGuidelines",
			"updateBrandMemory",
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
		tools: [
			"delegateToAgent",
			"webSearch",
			"siteExtractor",
			"pixelDataExtractor",
			"computerNavigate",
			"computerClick",
			"computerScroll",
			"computerScreenshot",
			"moodboard",
			"updateBrandMemory",
		],
	},
	"visual-scout": {
		key: "visual-scout",
		name: "Visual Scout",
		prompt: VISUAL_SCOUT_PROMPT,
		model: "computer",
		tools: [
			"computerNavigate",
			"computerClick",
			"computerType",
			"computerScroll",
			"computerWait",
			"computerScreenshot",
			"pixelDataExtractor",
		],
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
