import { expect, mock, test } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import React from "react";
import { useWorkflowTimeline } from "./useWorkflowTimeline";

// Mock GSAP to avoid actual animation logic in unit tests
mock.module("gsap", () => ({
	default: {
		context: (fn: any) => {
			fn();
			return { revert: () => {} };
		},
		timeline: () => ({
			set: () => {},
			to: () => {},
			fromTo: () => {},
			restart: () => {},
			pause: () => {},
			progress: () => 0,
		}),
	},
}));

test("useWorkflowTimeline is a function", () => {
	expect(typeof useWorkflowTimeline).toBe("function");
});
