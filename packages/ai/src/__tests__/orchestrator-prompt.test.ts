import { describe, expect, it, mock } from "bun:test";

// Set dummy key for runtime initialization
if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.GEMINI_API_KEY) {
	process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";
}

let lastSystemPrompt = "";

mock.module("ai", () => {
	return {
		generateText: async (params: any) => {
			lastSystemPrompt = params.system;
			return {
				text: "Mock response",
				finishReason: "stop",
				toolCalls: [],
				toolResults: [],
				response: { messages: [] },
			};
		},
		generateObject: async (params: any) => ({ object: {} }),
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

describe("Orchestrator Prompt Logic", () => {
	it("should distinguish between technical and generative edits", async () => {
		await generateAgentResponse("orchestrator", {
			prompt: "Remove the background",
			metadata: { context: { latestImageUrl: "http://example.com/img.png" } },
		});

		expect(lastSystemPrompt.replace(/\s+/g, " ")).toContain(
			"Delegate to **Vision** for technical manipulations",
		);
		expect(lastSystemPrompt.replace(/\s+/g, " ")).toContain(
			"background removal",
		);
	});

	it("should handle generative variations directly", async () => {
		await generateAgentResponse("orchestrator", {
			prompt: "Make it a woman",
			metadata: { context: { latestImageUrl: "http://example.com/img.png" } },
		});

		expect(lastSystemPrompt.replace(/\s+/g, " ")).toContain(
			"Handling Generative Edits & Variations (CRITICAL)",
		);
		expect(lastSystemPrompt.replace(/\s+/g, " ")).toContain("handled by YOU");
	});

	it("should instruct to infer aspect ratio for variations", async () => {
		await generateAgentResponse("orchestrator", {
			prompt: "Make it a woman",
			metadata: { context: { latestImageUrl: "http://example.com/img.png" } },
		});

		expect(lastSystemPrompt.replace(/\s+/g, " ")).toContain(
			"you MAY assume the output should match the input's aspect ratio",
		);
	});
});

const { delegateToAgentTool } = require("../tools/orchestration");

describe("Tool Validation", () => {
	it("delegateToAgent should require agent and task", async () => {
		const schema = delegateToAgentTool.inputSchema;

		const result1 = schema.safeParse({ agent: "vision" });
		expect(result1.success).toBe(false);

		const result2 = schema.safeParse({ task: "something" });
		expect(result2.success).toBe(false);

		const result3 = schema.safeParse({ agent: "vision", task: "do something" });
		expect(result3.success).toBe(true);
	});
});
