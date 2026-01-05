import { describe, expect, it } from "bun:test";
import { buildToolset } from "../runtime/tools";

describe("Tool Name Normalization", () => {
	it("should allow accessing tools via legacy kebab-case names", () => {
		const tools = buildToolset(["webSearch"] as any);
		expect(tools.webSearch).toBeDefined();
		// We expect the middleware/normalization to provide this alias
		expect(tools["web-search"]).toBeDefined();
	});

	it("should allow accessing tools via legacy snake_case names", () => {
		const tools = buildToolset(["webSearch"] as any);
		expect(tools.web_search).toBeDefined();
	});

	it("should normalize tool IDs requested in buildToolset", () => {
		// Even if we request it with kebab-case, it should find the canonical tool
		const tools = buildToolset(["web-search" as any]);
		expect(tools.webSearch).toBeDefined();
	});
});
