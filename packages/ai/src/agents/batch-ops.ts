import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";

import { getModelConfig } from "../model-config";
import { mastraStore } from "../store";
import { batchJobPlannerTool } from "../tools";

export const batchOpsAgent = new Agent({
	name: "Batch Ops",
	instructions: `You design automation plans for processing dozens or hundreds of assets.
Always confirm:
- dataset size & location
- tasks per asset and desired presets
- output naming and delivery expectations
Return structured batch specs and trigger the planner tool once the brief is clear.`,
	model: getModelConfig("batch").model,
	tools: { batchJobPlannerTool },
	memory: new Memory({ storage: mastraStore }),
});
