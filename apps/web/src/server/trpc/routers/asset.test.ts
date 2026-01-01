import { mock } from "bun:test";

// Set environment variables
process.env.DATABASE_URL = "postgresql://localhost:5432/test";
process.env.RESEND_API_KEY = "re_test_123";
process.env.BETTER_AUTH_SECRET = "test_secret";
process.env.BETTER_AUTH_URL = "http://localhost:3001";

// Mock the modules before importing it or anything that uses it
mock.module("@studio233/db", () => ({
	prisma: {
		workspace: {
			findUnique: mock(() =>
				Promise.resolve({ id: "ws_123", userId: "user_123" }),
			),
		},
		asset: {
			create: mock((data) => Promise.resolve({ id: "ast_123", ...data.data })),
		},
		brandKnowledge: {
			deleteMany: mock(() => Promise.resolve({ count: 0 })),
		},
	},
	AssetType: {
		IMAGE: "IMAGE",
		VIDEO: "VIDEO",
		AUDIO: "AUDIO",
		DOCUMENT: "DOCUMENT",
		OTHER: "OTHER",
	},
}));

mock.module("@studio233/inngest", () => ({
	inngest: {
		send: mock(() => Promise.resolve()),
	},
}));

mock.module("@studio233/auth/lib/session", () => ({
	getSessionWithRetry: mock(() =>
		Promise.resolve({ user: { id: "user_123" } }),
	),
}));

mock.module("@studio233/auth", () => ({
	auth: {
		api: {
			getSession: mock(() => Promise.resolve({ user: { id: "user_123" } })),
		},
	},
}));

// Mock rate limiting to avoid Upstash connection issues
mock.module("@/lib/ratelimit", () => ({
	createRateLimiter: mock(() => ({})),
	shouldLimitRequest: mock(() =>
		Promise.resolve({ shouldLimitRequest: false }),
	),
}));

// Now we can safely import everything else
import { describe, expect, it } from "bun:test";
import { assetRouter } from "./asset";

describe("assetRouter", () => {
	it("should register an asset with CORE_BRAND_MARK classification", async () => {
		const caller = assetRouter.createCaller({
			req: { headers: new Headers() } as any,
			res: {} as any,
			prisma: {} as any,
		} as any);

		const result = await caller.register({
			name: "logo.png",
			url: "https://example.com/logo.png",
			size: 1024,
			mimeType: "image/png",
			workspaceId: "ws_123",
			isBrandAsset: true,
			classification: "CORE_BRAND_MARK",
		});

		expect(result.id).toBe("ast_123");
	});

	it("should register an asset with INDEX_AS_INSPIRATION classification", async () => {
		const caller = assetRouter.createCaller({
			req: { headers: new Headers() } as any,
			res: {} as any,
			prisma: {} as any,
		} as any);

		const result = await caller.register({
			name: "inspire.png",
			url: "https://example.com/inspire.png",
			size: 1024,
			mimeType: "image/png",
			workspaceId: "ws_123",
			isBrandAsset: true,
			classification: "INDEX_AS_INSPIRATION",
		});

		expect(result.id).toBe("ast_123");
	});
});
