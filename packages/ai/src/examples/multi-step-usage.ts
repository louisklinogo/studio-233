/**
 * Example usage of the new multi-step tool calling features
 */

import type { ToolCallInfo } from "@studio233/ai";
import { generateAgentResponse, streamAgentResponse } from "@studio233/ai";

// Example 1: Basic multi-step with default limits
async function example1() {
	const result = await generateAgentResponse("orchestrator", {
		prompt: "Search for swiss design and create a moodboard",
		// Uses default limit of 10 steps for orchestrator
	});

	console.log("Result:", result.text);
	console.log("Steps taken:", result.steps?.length);
}

// Example 2: Custom step limit
async function example2() {
	const result = await generateAgentResponse("insight", {
		prompt: "Find information about minimalism",
		maxSteps: 3, // Override default of 8
	});

	console.log("Result:", result.text);
}

// Example 3: Tool call tracking
async function example3() {
	const toolCalls: ToolCallInfo[] = [];

	const result = await generateAgentResponse("vision", {
		prompt: "Process this image",
		onToolCall: async (toolCall) => {
			toolCalls.push(toolCall);
			console.log(`Tool called: ${toolCall.name}`);
			console.log(`Arguments:`, toolCall.arguments);
			console.log(`Result:`, toolCall.result);
		},
	});

	console.log(`Total tools called: ${toolCalls.length}`);
}

// Example 4: Streaming with step limits
async function example4() {
	const stream = streamAgentResponse("motion", {
		prompt: "Create a video from this description",
		maxSteps: 5,
		onToolCall: async (toolCall) => {
			// Log tool calls in real-time during streaming
			console.log(`[Stream] Tool: ${toolCall.name}`);
		},
	});

	for await (const chunk of stream.textStream) {
		process.stdout.write(chunk);
	}
}

// Example 5: Database persistence (future enhancement)
async function example5WithPersistence() {
	// This would be implemented in the API route
	const result = await generateAgentResponse("orchestrator", {
		prompt: "Complex multi-step task",
		onToolCall: async (toolCall) => {
			// Persist to database
			// await db.agentToolCall.create({
			//   data: {
			//     threadId: "thread-123",
			//     name: toolCall.name,
			//     arguments: toolCall.arguments,
			//     result: toolCall.result,
			//     status: "SUCCEEDED",
			//   },
			// });
		},
	});
}
