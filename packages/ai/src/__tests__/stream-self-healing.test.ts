import { describe, expect, it, mock } from "bun:test";
import { streamAgentResponse } from "../runtime";

// Mock the 'ai' module
mock.module("ai", () => ({
	streamText: mock(),
	stepCountIs: mock((n) => n),
}));

// Mock the google provider
mock.module("@ai-sdk/google", () => ({
	createGoogleGenerativeAI: () => () => ({}),
}));

// Mock environment
mock.module("../config", () => ({
	getEnv: () => ({ googleApiKey: "test-key" }),
}));

// Mock model config
mock.module("../model-config", () => ({
	getModelConfig: () => ({ model: "gemini-1.5-pro", temperature: 0.7 }),
}));

// Mock logger
mock.module("../utils/logger", () => ({
	logger: {
		info: mock(),
		warn: mock(),
		error: mock(),
	},
}));

describe("streamAgentResponse Self-Healing", () => {
	it("should retry when streamText throws a validation error immediately", async () => {
		const { streamText } = await import("ai");

		let callCount = 0;
		(streamText as any).mockImplementation(() => {
			callCount++;
			if (callCount === 1) {
				throw new Error("Invalid tool input: 'query' is required");
			}
			return {
				// Mock a StreamTextResult
				fullStream: (async function* () {
					yield { type: "text-delta", textDelta: "Fixed!" };
				})(),
			};
		});

		const result = await streamAgentResponse("orchestrator", {
			prompt: "test",
		});

		expect(callCount).toBe(2);
		expect(result).toBeDefined();
	});

	it("should fail after maximum retries", async () => {
		const { streamText } = await import("ai");

		let callCount = 0;
		(streamText as any).mockImplementation(() => {
			callCount++;
			throw new Error("Invalid tool input: persistent error");
		});

		try {
			await streamAgentResponse("orchestrator", {
				prompt: "test",
				maxValidationRetries: 1,
			});
			expect(true).toBe(false); // Should not reach here
		} catch (error) {
			expect(callCount).toBe(2); // Initial + 1 retry
			expect((error as Error).message).toContain(
				"Invalid tool input: persistent error",
			);
		}
	});

	it("should inject error context into messages on retry", async () => {
		const { streamText } = await import("ai");

		let caughtMessages: any[] = [];
		(streamText as any).mockImplementation(({ messages }: any) => {
			caughtMessages = messages;
			if (messages.length === 1) {
				// First attempt (User message only)
				throw new Error("Invalid tool input: failed");
			}
			return {
				fullStream: (async function* () {
					yield { type: "text-delta", textDelta: "Success" };
				})(),
			};
		});

		await streamAgentResponse("orchestrator", {
			prompt: "test",
		});

		// Expect 3 messages: User, Assistant (Attempting...), User (Error Feedback)
		expect(caughtMessages).toHaveLength(3);
		expect(caughtMessages[1].role).toBe("assistant");
		expect(caughtMessages[1].content).toContain("Attempting tool call");
		expect(caughtMessages[2].role).toBe("user");
		expect(caughtMessages[2].content).toContain(
			"Your last tool call failed validation",
		);
	});
});
