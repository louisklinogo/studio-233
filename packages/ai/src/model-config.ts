export const MODEL_CONFIG = {
	orchestrator: {
		model: "google/gemini-3-pro-preview",
		temperature: 0.4,
	},
	vision: {
		model: "google/gemini-3-pro-preview",
		temperature: 0.6,
	},
	motion: {
		model: "google/gemini-2.5-pro",
		temperature: 0.3,
	},
	research: {
		model: "google/gemini-2.5-pro",
		temperature: 0.2,
	},
	batch: {
		model: "google/gemini-2.5-flash",
		temperature: 0.2,
	},
	storyboard: {
		model: "google/gemini-3-pro-preview",
		temperature: 0.75,
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
