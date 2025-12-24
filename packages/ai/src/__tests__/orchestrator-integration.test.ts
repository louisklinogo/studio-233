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
let mockToolCalls: any[] = [];

mock.module("ai", () => {
	return {
		generateText: async (params: any) => {
			lastGenerateTextParams = params;

			const lastMessage = params.messages[params.messages.length - 1];
			const prompt =
				typeof lastMessage.content === "string"
					? lastMessage.content
					: JSON.stringify(lastMessage.content);

			// Dynamic logic to simulate different model behaviors based on prompt
			if (prompt.includes("background")) {
				mockToolCalls = [
					{
						toolCallId: "call_delegate",
						toolName: "delegateToAgent",
						args: { agent: "vision", task: "Remove background from the image" },
						type: "tool-call",
					},
				];
			} else if (prompt.includes("woman")) {
				mockToolCalls = [
					{
						toolCallId: "call_gen",
						toolName: "canvasTextToImage",
						args: {
							prompt: "A photo of a woman...",
							referenceImageUrl: "https://example.com/cat.jpg",
						},
						type: "tool-call",
					},
				];
			}
			return {
				text: "Mocked assistant response",
				finishReason: "tool-calls",
				toolCalls: mockToolCalls,
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
	it("should handle generative variations directly with referenceImageUrl", async () => {
		const result = await generateAgentResponse("orchestrator", {
			prompt: "Make this image a woman",
			metadata: {
				context: {
					latestImageUrl: "https://example.com/cat.jpg",
				},
			},
		});

		expect(result.toolCalls).toHaveLength(1);
		expect(result.toolCalls[0].toolName).toBe("canvasTextToImage");
		expect(result.toolCalls[0].args.referenceImageUrl).toBe(
			"https://example.com/cat.jpg",
		);

		expect(lastGenerateTextParams.system).toContain(
			"[System Note]: A reference image is available",
		);
	});

	it("should delegate technical manipulations to Vision agent", async () => {
		const result = await generateAgentResponse("orchestrator", {
			prompt: "Remove the background",
			metadata: {
				context: {
					latestImageUrl: "https://example.com/cat.jpg",
				},
			},
		});

		expect(result.toolCalls).toHaveLength(1);
		expect(result.toolCalls[0].toolName).toBe("delegateToAgent");
		expect(result.toolCalls[0].args.agent).toBe("vision");
		expect(result.toolCalls[0].args.task).toBeDefined();
	});
});
