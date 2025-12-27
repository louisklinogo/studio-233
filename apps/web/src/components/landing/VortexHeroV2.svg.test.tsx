import { expect, test } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
// @ts-ignore - Bun/happy-dom setup might be needed
import { render, screen } from "@testing-library/react";
import React from "react";
import { VortexHeroV2 } from "./VortexHeroV2";

// Initialize happy-dom for DOM simulation
GlobalRegistrator.register();

test("VortexHeroV2 renders a geometric SVG for the plus symbol", () => {
	const { container } = render(<VortexHeroV2 />);

	// We expect the text-based "+" to be GONE
	// Note: Use queryByText to avoid throwing, so we can assert toBeNull
	// The current code has <span>+</span>, so this assertion will FAIL currently.
	const plusText = screen.queryByText((content, element) => {
		return element?.tagName.toLowerCase() === "span" && content === "+";
	});
	expect(plusText).toBeNull();

	// We expect our new SVG to be PRESENT
	const svgPlus = container.querySelector('svg[data-testid="hero-plus-svg"]');
	expect(svgPlus).not.toBeNull();
	expect(svgPlus?.getAttribute("viewBox")).toBe("0 0 100 100");
});
