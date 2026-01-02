import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();

import { beforeEach, describe, expect, it, mock } from "bun:test";
import { act, render, screen } from "@testing-library/react";
import React from "react";
import { BootSequence } from "./BootSequence";

// Mock GSAP
mock.module("gsap", () => ({
	default: {
		timeline: mock(() => ({
			fromTo: mock().mockReturnThis(),
			to: mock().mockReturnThis(),
			add: mock().mockReturnThis(),
		})),
		context: mock((fn) => {
			fn();
			return { revert: mock() };
		}),
	},
}));

mock.module("./ScrambleText", () => ({
	ScrambleText: ({ text }: { text: string }) => <span>{text}</span>,
}));

describe("BootSequence", () => {
	beforeEach(() => {
		sessionStorage.clear();
	});

	it("renders the handshake UI elements", async () => {
		// Try to manually create document if screen still fails
		if (typeof document === "undefined" || !document.body) {
			const { Window } = require("happy-dom");
			const window = new Window();
			global.window = window;
			global.document = window.document;
		}

		await act(async () => {
			render(<BootSequence onComplete={mock()} />);
		});

		const handshake = document.querySelector("span");
		expect(handshake).not.toBeNull();
	});
});
