export const MODEL_CONFIG = {
	orchestrator: {
		model: "google/gemini-2.5-flash",
		temperature: 0.5,
	},
	creative: {
		model: "google/gemini-3-pro-preview",
		temperature: 0.8,
	},
	transform: {
		model: "google/gemini-3-pro-preview",
		temperature: 0.2,
	},
	batch: {
		model: "google/gemini-3-pro-preview",
		temperature: 0.1,
	},
	canvas: {
		model: "google/gemini-3-pro-preview",
		temperature: 0.4,
	},
	general: {
		model: "google/gemini-3-pro-preview",
		temperature: 0.7,
	},
} as const;

export type AgentType = keyof typeof MODEL_CONFIG;

export function getModelConfig(agentType: AgentType) {
	return MODEL_CONFIG[agentType];
}
