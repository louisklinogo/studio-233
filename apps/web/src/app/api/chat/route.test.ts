import { describe, expect, mock, test } from "bun:test";

// Mock dependencies
mock.module("@studio233/auth/lib/session", () => ({
	getSessionWithRetry: mock(async () => {
		await new Promise((r) => setTimeout(r, 100));
		return { user: { id: "user1" } };
	}),
}));

mock.module("@studio233/db", () => ({
	prisma: {
		agentThread: {
			create: mock(() => Promise.resolve({ id: "thread1" })),
			findUnique: mock(async () => {
				await new Promise((r) => setTimeout(r, 100));
				return { id: "thread1", userId: "user1" };
			}),
			update: mock(() => Promise.resolve({})),
		},
		agentMessage: {
			create: mock(() => Promise.resolve({})),
		},
		agentToolCall: {
			upsert: mock(() => Promise.resolve({})),
			update: mock(() => Promise.resolve({})),
		},
	},
}));

mock.module("@studio233/ai/runtime", () => ({
	generateAgentResponse: mock(),
	streamAgentResponse: mock(() => ({
		toUIMessageStreamResponse: () => new Response("stream"),
	})),
}));

mock.module("@studio233/ai/runtime/titling", () => ({
	generateThreadTitle: mock(() => Promise.resolve("New Title")),
}));

mock.module("@studio233/ai/utils/blob-storage", () => ({
	uploadImageBufferToBlob: mock(() =>
		Promise.resolve("https://blob/image.png"),
	),
}));

// Mock Vercel Blob
mock.module("@vercel/blob", () => ({
	list: mock(() => Promise.resolve({ blobs: [] })),
}));

mock.module("ai", () => ({
	convertToModelMessages: mock((msgs) => Promise.resolve(msgs)),
}));

// Import the route
import { POST } from "./route";

describe("Chat API", () => {
	test("POST with threadId runs auth and db fetch in parallel", async () => {
		const req = new Request("http://localhost/api/chat", {
			method: "POST",
			body: JSON.stringify({
				messages: [{ role: "user", content: "hello" }],
				maxSteps: 5,
				threadId: "thread1",
			}),
		});

		const start = Date.now();
		const res = await POST(req);
		const duration = Date.now() - start;

		expect(res.status).toBe(200);
		// Expect parallel execution: approx 100ms (plus overhead), definitely < 180ms
		// Sequential would be > 200ms
		expect(duration).toBeLessThan(190);
	});
});
