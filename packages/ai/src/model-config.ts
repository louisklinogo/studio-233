export const MODEL_CONFIG = {
	orchestrator: {
		model: "gemini-3-pro-preview",
		temperature: 0.4,
	},
	vision: {
		model: "gemini-3-pro-preview",
		temperature: 0.6,
	},
	motion: {
		model: "gemini-2.5-pro",
		temperature: 0.3,
	},
	research: {
		model: "gemini-2.5-pro",
		temperature: 0.2,
	},
	batch: {
		model: "gemini-2.5-flash",
		temperature: 0.2,
	},
	storyboard: {
		model: "gemini-3-pro-preview",
		temperature: 0.75,
	},
	general: {
		model: "gemini-3-pro-preview",
		temperature: 0.7,
	},
} as const;

// Gemini model constants for workflows
export const GEMINI_IMAGE_MODEL = "gemini-3-pro-image-preview";
export const GEMINI_TEXT_MODEL = "gemini-3-pro-preview";
export const GEMINI_PRO_MODEL = "gemini-2.5-pro";
export const GEMINI_FLASH_MODEL = "gemini-2.5-flash";

// Legacy alias for backward compatibility
export const IMAGE_GEN_MODEL = GEMINI_IMAGE_MODEL;

export type AgentType = keyof typeof MODEL_CONFIG;

export function getModelConfig(agentType: AgentType) {
	return MODEL_CONFIG[agentType];
}
