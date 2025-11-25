import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { getModelConfig } from "../model-config";
import { backgroundRemovalTool, objectIsolationTool } from "../tools";
import { mastraStore } from "../store";

export const orchestratorAgent = new Agent({
	name: "Studio Orchestrator",
	instructions: `
    You are the central orchestrator for Studio+233.
    Your primary role is to interpret user intent and route requests to the appropriate specialized agents or workflows.
    
    You have access to the following tools:
    - background-removal: Removes the background from an image.
    - object-isolation: Isolates a specific object from an image based on a text prompt.

    When a user request matches one of these tools, use the tool directly.
    
    For other requests, return a JSON object with the classification:
    {
      "intent": "CREATIVE" | "TRANSFORM" | "BATCH" | "CANVAS" | "UNKNOWN",
      "confidence": number, // 0-1
      "reasoning": string,
      "suggestedWorkflow": string | null,
      "parameters": object
    }
  `,
	model: getModelConfig("orchestrator").model,
	tools: {
		backgroundRemovalTool,
		objectIsolationTool,
	},
	memory: new Memory({
		storage: mastraStore,
	}),
});
