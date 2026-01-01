import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

// Mock modules BEFORE importing anything that uses them
mock.module("@studio233/db", () => ({
	prisma: {
		workspace: {
			findUnique: mock(() =>
				Promise.resolve({
					brandProfile: {
						primaryColor: "#FF4D00",
						accentColor: "#00FF00",
						fontFamily: "Satoshi",
					},
				}),
			),
		},
		brandKnowledge: {
			findMany: mock(() =>
				Promise.resolve([
					{ text: "DNA 1", metadata: { type: "visual_dna" } },
					{ text: "DNA 2", metadata: { type: "visual_dna" } },
				]),
			),
		},
	},
}));

mock.module("@vercel/kv", () => ({
	kv: {
		get: mock(() => Promise.resolve(null)),
		set: mock(() => Promise.resolve("OK")),
	},
}));

mock.module("@studio233/rag", () => ({
	retrievalService: mock(() =>
		Promise.resolve([
			{ content: "Rule 1", similarity: 0.9 },
			{ content: "Rule 2", similarity: 0.8 },
			{ content: "Rule 3", similarity: 0.7 },
			{ content: "Rule 4", similarity: 0.6 },
		]),
	),
	initLlamaIndex: mock(() => {}),
}));

import { prisma } from "@studio233/db";
import { kv } from "@vercel/kv";
// Now import the resolver which uses the mocked modules
// @ts-ignore
import {
	resolveIdentity,
	resolveKnowledge,
	resolveVisualDna,
} from "./resolver";

describe("Identity Resolver", () => {
	beforeEach(() => {
		// @ts-ignore
		prisma.workspace.findUnique.mockClear();
		// @ts-ignore
		kv.get.mockClear();
		// @ts-ignore
		kv.set.mockClear();
	});

	test("fetches workspace identity from prisma when cache is empty", async () => {
		const workspaceId = "test-ws";
		// @ts-ignore
		kv.get = mock(() => Promise.resolve(null));
		const identity = await resolveIdentity(workspaceId);
		expect(identity.primaryColor).toBe("#FF4D00");
	});

	test("returns cached identity if available", async () => {
		const workspaceId = "cached-ws";
		const cachedIdentity = {
			primaryColor: "#000000",
			accentColor: "#FFFFFF",
			fontFamily: "Inter",
		};
		// @ts-ignore
		kv.get = mock(() => Promise.resolve(cachedIdentity));
		const identity = await resolveIdentity(workspaceId);
		expect(identity.primaryColor).toBe("#000000");
	});

	test("handles malformed brandProfile by returning defaults", async () => {
		const workspaceId = "malformed-ws";
		// @ts-ignore
		prisma.workspace.findUnique.mockImplementationOnce(() =>
			Promise.resolve({
				brandProfile: {
					notAColor: "garbage",
				},
			}),
		);
		// @ts-ignore
		kv.get = mock(() => Promise.resolve(null));

		const identity = await resolveIdentity(workspaceId);
		expect(identity.primaryColor).toBe("#111111"); // Default
		expect(identity.fontFamily).toBe("Cabinet Grotesk"); // Default
	});
});
describe("Knowledge Resolver", () => {
	test("retrieves top 3 snippets from RAG", async () => {
		const workspaceId = "test-ws";
		const query = "What are my brand colors?";

		const knowledge = await resolveKnowledge(workspaceId, query);

		expect(knowledge).toHaveLength(3);
		expect(knowledge[0]).toBe("Rule 1");
		expect(knowledge).not.toContain("Rule 4");
	});
});

describe("Visual DNA Resolver", () => {
	test("fetches visual dna summaries", async () => {
		const workspaceId = "test-ws";
		const dna = await resolveVisualDna(workspaceId);

		expect(dna).toHaveLength(2);
		expect(dna[0]).toBe("DNA 1");
	});
});
