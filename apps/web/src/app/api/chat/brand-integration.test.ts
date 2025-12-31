import { describe, expect, mock, test } from "bun:test";

// Mock dependencies
mock.module("@studio233/auth/lib/session", () => ({
	getSessionWithRetry: mock(() => Promise.resolve({ user: { id: "user1" } })),
}));

mock.module("@studio233/db", () => ({
	prisma: {
		agentThread: {
			findUnique: mock(() =>
				Promise.resolve({
					id: "thread1",
					userId: "user1",
					project: { workspaceId: "ws1" },
				}),
			),
			create: mock(() => Promise.resolve({ id: "thread1" })),
		},
		agentMessage: { create: mock(() => Promise.resolve({})) },
		agentToolCall: {
			upsert: mock(() => Promise.resolve({})),
			update: mock(() => Promise.resolve({})),
		},
	},
}));

mock.module("@studio233/brand", () => ({
	resolveBrandContext: mock(async () => {
		await new Promise((r) => setTimeout(r, 100)); // Simulate slow RAG
		return {
			identity: {
				primaryColor: "#FF4D00",
				accentColor: "#00FF00",
				fontFamily: "Satoshi",
			},
			knowledge: ["Brand Rule"],
			visualDna: [],
			assets: [],
		};
	}),
}));

mock.module("@studio233/ai/runtime", () => ({
	streamAgentResponse: mock((agent, options) => {
		// Capture brandContext for validation
		// @ts-ignore
		global.lastBrandContext = options.brandContext;
		return { toUIMessageStreamResponse: () => new Response("stream") };
	}),
}));

mock.module("@vercel/blob", () => ({
	list: mock(() => Promise.resolve({ blobs: [] })),
}));
mock.module("ai", () => ({
	convertToModelMessages: mock((msgs) => Promise.resolve(msgs)),
}));

import { POST } from "./route";

describe("Chat Brand Integration", () => {
	test("resolves brand context in parallel and passes to runtime", async () => {
		const req = new Request("http://localhost/api/chat", {
			method: "POST",
			body: JSON.stringify({
				messages: [{ role: "user", content: "hello" }],
				threadId: "thread1",
			}),
		});

		const start = Date.now();
		await POST(req);
		const duration = Date.now() - start;

		// @ts-ignore
		expect(global.lastBrandContext).toBeDefined();
		// @ts-ignore
		expect(global.lastBrandContext.identity.primaryColor).toBe("#FF4D00");

		// Parallelism check: simulate 100ms RAG, should finish around that time
		expect(duration).toBeLessThan(250);
	});
});
