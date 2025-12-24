import { describe, expect, it, mock } from "bun:test";

// Set dummy key for runtime initialization
if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.GEMINI_API_KEY) {
	process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";
}

const MOCK_TOOL_CALL = {
	toolCallId: "call_1",
	toolName: "canvasTextToImage",
	args: {
		prompt:
			"A high-fashion studio portrait of a woman, studio lighting, beige background",
		aspectRatio: "1:1",
		referenceImageUrl: "https://example.com/cat.jpg",
	},
	type: "tool-call",
};

let lastGenerateTextParams: any = null;

mock.module("ai", () => {
	return {
		generateText: async (params: any) => {
			lastGenerateTextParams = params;
			return {
				text: "I'll help you with that.",
				finishReason: "stop",
				toolCalls: [MOCK_TOOL_CALL],
				toolResults: [],
				response: { messages: [] },
			};
		},
		generateObject: async (params: any) => {
			return { object: {} };
		},
		stepCountIs: () => true,
		streamText: async () => ({}),
		createGoogleGenerativeAI: () => () => ({}),
		convertToCoreMessages: (m: any) => m,
		tool: (t: any) => t,
		zodSchema: (s: any) => s,
	};
});

// Import after setting env and mocks using require to avoid hoisting
const { generateAgentResponse } = require("../runtime");

describe("Orchestrator Integration", () => {
	it("should include referenceImageUrl in context and prompt", async () => {
		const result = await generateAgentResponse("orchestrator", {
			prompt: "Make this image a woman",
			metadata: {
				context: {
					latestImageUrl: "https://example.com/cat.jpg",
				},
			},
		});

		// Verify the result contains our mock tool call
		expect(result.toolCalls).toHaveLength(1);
		expect(result.toolCalls[0].toolName).toBe("canvasTextToImage");
		expect(result.toolCalls[0].args.referenceImageUrl).toBe(
			"https://example.com/cat.jpg",
		);

		// Verify the system prompt was enhanced with the reference image note and constraints
		expect(lastGenerateTextParams.system).toContain(
			"[System Note]: A reference image is available",
		);
		expect(lastGenerateTextParams.system).toContain(
			"Formatting Constraints (STRICT)",
		);
		expect(lastGenerateTextParams.system).toContain(
			"Handling Generative Edits & Variations (CRITICAL)",
		);
	});
});
