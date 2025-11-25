import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { batchAgent } from "./agents/batch-agent";
import { creativeAgent } from "./agents/creative-agent";
import { orchestratorAgent } from "./agents/orchestrator-agent";
import { weatherAgent } from "./agents/weather-agent";
import {
	completenessScorer,
	toolCallAppropriatenessScorer,
	translationScorer,
} from "./scorers/weather-scorer";
import { backgroundRemovalWorkflow } from "./workflows/background-removal";
import { objectIsolationWorkflow } from "./workflows/object-isolation";
import { weatherWorkflow } from "./workflows/weather-workflow";
import { mastraStore } from "./store";

export const mastra = new Mastra({
	workflows: {
		weatherWorkflow,
		backgroundRemovalWorkflow,
		objectIsolationWorkflow,
	},
	agents: { weatherAgent, orchestratorAgent, creativeAgent, batchAgent },
	scorers: {
		toolCallAppropriatenessScorer,
		completenessScorer,
		translationScorer,
	},
	storage: mastraStore,
	logger: new PinoLogger({
		name: "Mastra",
		level: "info",
	}),
	telemetry: {
		// Telemetry is deprecated and will be removed in the Nov 4th release
		enabled: false,
	},
	observability: {
		// Enables DefaultExporter and CloudExporter for AI tracing
		default: { enabled: true },
	},
});
