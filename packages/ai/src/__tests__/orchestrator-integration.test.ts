import { describe, expect, it, mock } from "bun:test";

// Set dummy key for runtime initialization
if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.GEMINI_API_KEY) {
	process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";
}

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

			if (prompt.includes("background")) {
				mockToolCalls = [
					{
						toolCallId: "call_delegate",
						toolName: "delegateToAgent",
						args: { agent: "vision", task: "Remove background" },
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
				text: "Mocked response",
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
		convertToModelMessages: (m: any) => m,
		tool: (t: any) => t,
		zodSchema: (s: any) => s,
		wrapLanguageModel: (p: any) => p.model,
	};
});

const { generateAgentResponse } = require("../runtime");

describe("Orchestrator Integration", () => {
	it("should handle generative variations with referenceImageUrl", async () => {
		const result = await generateAgentResponse("orchestrator", {
			prompt: "Make this image a woman",
			metadata: {
				context: {
					latestImageUrl: "https://example.com/cat.jpg",
				},
			},
		});

		expect(result.toolCalls[0].toolName).toBe("canvasTextToImage");
		expect(result.toolCalls[0].args.referenceImageUrl).toBe(
			"https://example.com/cat.jpg",
		);
		expect(lastGenerateTextParams.system).toContain(
			"[System Note]: The following reference images are available",
		);
	});
});
