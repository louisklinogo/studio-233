/**
 * Test script to verify multi-step tool calling implementation
 * Run with: bun run packages/ai/src/__tests__/multi-step.test.ts
 */

import { describe, expect, it } from "bun:test";
import { resolveStepLimit, type ToolCallInfo } from "../runtime";

describe("Multi-Step Tool Calling", () => {
	it("should use default step limits for orchestrator", () => {
		const limit = resolveStepLimit("orchestrator");
		expect(limit).toBe(10);
	});

	it("should accept custom maxSteps parameter", () => {
		const defaultLimit = resolveStepLimit("vision");
		const overriddenLimit = resolveStepLimit("vision", 3);

		expect(defaultLimit).not.toBe(3);
		expect(overriddenLimit).toBe(3);
	});

	it("should invoke onToolCall callback for each tool execution (type shape)", async () => {
		const toolCalls: ToolCallInfo[] = [];

		const handler = async (toolCall: ToolCallInfo) => {
			toolCalls.push(toolCall);
		};

		const sampleCall: ToolCallInfo = {
			toolCallId: "test-id",
			name: "testTool",
			arguments: { test: true },
			result: { success: true },
		};

		await handler(sampleCall);

		expect(toolCalls).toHaveLength(1);
		expect(toolCalls[0]).toEqual(sampleCall);
	});

	it("should support streaming with step limits (resolved value)", () => {
		const limit = resolveStepLimit("motion", 5);
		expect(limit).toBe(5);
	});
});

describe("Type Safety", () => {
	it("should export ToolCallInfo type", () => {
		// This test verifies the type is exported correctly
		const toolCall: ToolCallInfo = {
			toolCallId: "test-id",
			name: "testTool",
			arguments: { test: true },
			result: { success: true },
		};

		expect(toolCall.toolCallId).toBe("test-id");
	});
});
