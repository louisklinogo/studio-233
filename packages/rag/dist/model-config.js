export const MODEL_CONFIG = {
	orchestrator: {
		model: "gemini-3-flash-preview",
		temperature: 0.4,
	},
	vision: {
		model: "gemini-3-flash-preview",
		temperature: 0.6,
	},
	motion: {
		model: "gemini-3-flash-preview",
		temperature: 0.3,
	},
	research: {
		model: "gemini-3-flash-preview",
		temperature: 0.2,
	},
	batch: {
		model: "gemini-3-flash-preview",
		temperature: 0.2,
	},
	storyboard: {
		model: "gemini-3-flash-preview",
		temperature: 0.75,
	},
	general: {
		model: "gemini-3-flash-preview",
		temperature: 0.7,
	},
};
// Gemini model constants for workflows
export const GEMINI_IMAGE_MODEL = "gemini-3-pro-image-preview";
export const GEMINI_TEXT_MODEL = "gemini-3-pro-preview";
export const GEMINI_PRO_MODEL = "gemini-3-pro-preview";
export const GEMINI_FLASH_MODEL = "gemini-3-flash-preview";
// Legacy alias for backward compatibility
export const IMAGE_GEN_MODEL = GEMINI_IMAGE_MODEL;
export function getModelConfig(agentType) {
	return MODEL_CONFIG[agentType];
}
