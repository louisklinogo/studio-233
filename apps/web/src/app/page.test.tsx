import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();

import { describe, expect, it, mock } from "bun:test";
import { act, render, screen } from "@testing-library/react";
import React from "react";
import HomePage from "./page";

// Mock next/navigation
mock.module("next/navigation", () => ({
	useRouter: () => ({
		push: mock(),
		replace: mock(),
		prefetch: mock(),
	}),
	usePathname: () => "/",
	useSearchParams: () => new URLSearchParams(),
}));

// Mock the components used in the Vortex page
mock.module("@/components/landing/VortexHeroV2", () => ({
	VortexHeroV2: React.forwardRef((_props, ref) => {
		return <div data-testid="vortex-hero">Vortex Hero</div>;
	}),
}));

mock.module("@/components/landing/VortexContainer", () => ({
	VortexContainer: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="vortex-container">{children}</div>
	),
}));

mock.module("@/components/landing/ProductionEngine", () => ({
	ProductionEngine: () => (
		<div data-testid="production-engine">Production Engine</div>
	),
}));

mock.module("@/components/landing/InfiniteCanvas", () => ({
	InfiniteCanvas: React.forwardRef((_props, ref) => {
		return <div data-testid="infinite-canvas">Infinite Canvas</div>;
	}),
}));

mock.module("@/components/landing/KineticTrack", () => ({
	KineticTrack: React.forwardRef((_props, ref) => {
		return <div data-testid="kinetic-track">Kinetic Track</div>;
	}),
}));

mock.module("@/components/landing/VortexLenis", () => ({
	VortexLenis: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
}));

mock.module("@/components/landing/SystemCalibrationLoader", () => ({
	SystemCalibrationLoader: ({ onComplete }: { onComplete: () => void }) => {
		React.useEffect(() => {
			onComplete();
		}, [onComplete]);
		return <div data-testid="loader">Loading...</div>;
	},
}));

mock.module("@/components/ui/CustomCursor", () => ({
	CustomCursor: () => <div data-testid="custom-cursor" />,
}));

describe("HomePage (Vortex Migration)", () => {
	it("renders the Vortex components when loading is complete", async () => {
		// Try to manually create document if screen still fails
		if (typeof document === "undefined") {
			const { Window } = require("happy-dom");
			const window = new Window();
			global.window = window;
			global.document = window.document;
		}

		await act(async () => {
			render(<HomePage />);
		});

		// If screen.queryByTestId still fails, we'll know it's a happy-dom issue
		// But let's try to get it from the container
		const hero = document.querySelector('[data-testid="vortex-hero"]');
		expect(hero).not.toBeNull();
	});
});
