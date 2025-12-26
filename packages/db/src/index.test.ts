import { describe, expect, test } from "bun:test";
import * as db from "./index";

describe("Database Singleton", () => {
	test("exports getDatabaseResources factory", () => {
		expect(db).toHaveProperty("getDatabaseResources");
		expect(typeof (db as any).getDatabaseResources).toBe("function");
	});

	test("getDatabaseResources returns singleton instances", async () => {
		// @ts-ignore
		if (typeof (db as any).getDatabaseResources === "function") {
			// @ts-ignore
			const r1 = await (db as any).getDatabaseResources();
			// @ts-ignore
			const r2 = await (db as any).getDatabaseResources();

			expect(r1).toBeDefined();
			expect(r1.pool).toBeDefined();
			expect(r1.client).toBeDefined();
			expect(r1.adapter).toBeDefined();

			expect(r1.pool).toBe(r2.pool);
			expect(r1.client).toBe(r2.client);
			expect(r1.adapter).toBe(r2.adapter);
		} else {
			// Fail explicitly if function is missing, though the first test catches this too
			expect(true).toBe(false);
		}
	});
});
