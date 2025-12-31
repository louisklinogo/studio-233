import { describe, expect, it, mock } from "bun:test";

// Set dummy keys for runtime initialization
if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.GEMINI_API_KEY) {
	process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";
}
if (!process.env.DATABASE_URL) {
	process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/db";
}

let lastSystemPrompt = "";

mock.module("ai", () => {
	return {
		generateText: async (params: any) => {
			lastSystemPrompt = params.system;
			const lastMessage = params.messages[params.messages.length - 1];
			const prompt =
				typeof lastMessage.content === "string"
					? lastMessage.content
					: JSON.stringify(lastMessage.content);

			let toolCalls: any[] = [];

			// Logic to simulate agent tool selection based on the new architecture
			if (prompt.includes("Render this code") || prompt.includes("<html>")) {
				toolCalls = [
					{
						toolCallId: "call_render",
						toolName: "renderHtml",
						args: {
							html: "<html><body><h1>Hello</h1></body></html>",
							css: "h1 { color: red; }",
						},
						type: "tool-call",
					},
				];
			} else if (prompt.includes("Design a poster")) {
				toolCalls = [
					{
						toolCallId: "call_design",
						toolName: "htmlToCanvas",
						args: {
							brief: "A poster for a futuristic coffee shop",
						},
						type: "tool-call",
					},
				];
			} else if (prompt.includes("photo of a sunset")) {
				toolCalls = [
					{
						toolCallId: "call_artist",
						toolName: "canvasTextToImage",
						args: {
							prompt: "A beautiful cinematic photo of a sunset over the ocean",
						},
						type: "tool-call",
					},
				];
			}

			return {
				text: "Mocked response",
				finishReason: "tool-calls",
				toolCalls,
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

describe("Vision Tooling Architecture Integration", () => {
	it("should select 'renderHtml' when provided with raw code", async () => {
		const result = await generateAgentResponse("orchestrator", {
			prompt:
				"Render this code: <html><body><h1>Hello</h1></body></html> and css h1 { color: red; }",
		});

		expect(result.toolCalls[0].toolName).toBe("renderHtml");
		expect(result.toolCalls[0].args).toHaveProperty("html");
		expect(result.toolCalls[0].args).toHaveProperty("css");
		expect(lastSystemPrompt).toContain("HTML & Rendering Architecture");
		expect(lastSystemPrompt).toContain("renderHtml");
	});

	it("should select 'htmlToCanvas' when given a design brief", async () => {
		const result = await generateAgentResponse("orchestrator", {
			prompt: "Design a poster for a futuristic coffee shop",
		});

		expect(result.toolCalls[0].toolName).toBe("htmlToCanvas");
		expect(result.toolCalls[0].args).toHaveProperty("brief");
		// Ensure it DOES NOT try to pass html/css
		expect(result.toolCalls[0].args.html).toBeUndefined();
	});

	it("should select 'canvasTextToImage' for pixel/photo requests", async () => {
		const result = await generateAgentResponse("orchestrator", {
			prompt: "Make a photo of a sunset",
		});

		expect(result.toolCalls[0].toolName).toBe("canvasTextToImage");
		expect(result.toolCalls[0].args).toHaveProperty("prompt");
	});
});
