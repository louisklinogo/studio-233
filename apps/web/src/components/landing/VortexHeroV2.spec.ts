import { expect, test } from "@playwright/test";

test.describe("VortexHeroV2 Component", () => {
	test("should render an SVG plus symbol instead of text", async ({ page }) => {
		await page.goto("http://localhost:3001");
		const svgPlus = page.locator('svg[data-testid="hero-plus-svg"]');
		await expect(svgPlus).toBeVisible({ timeout: 10000 });
	});
});
