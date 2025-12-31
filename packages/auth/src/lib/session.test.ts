import { beforeEach, describe, expect, mock, test } from "bun:test";

// Mock the auth object BEFORE importing getSessionWithRetry
mock.module("../index", () => ({
	auth: {
		api: {
			getSession: mock(),
		},
	},
}));

import { auth } from "../index";
import { getSessionWithRetry } from "./session";

describe("getSessionWithRetry", () => {
	beforeEach(() => {
		// Reset mocks before each test
		(auth.api.getSession as any).mockReset();
	});

	test("retries on transient network errors", async () => {
		const error = new Error("ETIMEDOUT");
		(error as any).code = "ETIMEDOUT";

		(auth.api.getSession as any)
			.mockRejectedValueOnce(error)
			.mockResolvedValueOnce({ user: { id: "1" }, session: { id: "1" } });

		const session = await getSessionWithRetry(null, { delayMs: 1 });

		expect(session).not.toBeNull();
		expect(auth.api.getSession).toHaveBeenCalledTimes(2);
	});

	test("fails immediately on non-transient errors", async () => {
		const error = new Error("Invalid Credentials");

		(auth.api.getSession as any).mockRejectedValueOnce(error);

		const session = await getSessionWithRetry(null, { delayMs: 1 });

		expect(session).toBeNull();
		expect(auth.api.getSession).toHaveBeenCalledTimes(1);
	});

	test("retries on 'Connection terminated' error", async () => {
		const error = new Error("Connection terminated due to connection timeout");

		(auth.api.getSession as any)
			.mockRejectedValueOnce(error)
			.mockResolvedValueOnce({ user: { id: "1" }, session: { id: "1" } });

		const session = await getSessionWithRetry(null, { delayMs: 1, retries: 1 });

		expect(session).not.toBeNull();
		expect(auth.api.getSession).toHaveBeenCalledTimes(2);
	});
});
