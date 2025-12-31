import { describe, expect, test } from "bun:test";
// We'll implement this soon
// @ts-ignore
import { injectBrandContext } from "../runtime/index";

describe("Brand Injection Engine", () => {
	test("generates industrial technical envelope", () => {
		const basePrompt = "You are an assistant.";
		const context = {
			identity: {
				primaryColor: "#FF4D00",
				accentColor: "#00FF00",
				fontFamily: "Satoshi",
			},
			knowledge: ["Rule 1", "Rule 2"],
			visualDna: ["Geometric logo"],
			assets: [{ name: "Logo", url: "https://logo.png", type: "IMAGE" }],
		};

		// @ts-ignore
		const prompt = injectBrandContext(basePrompt, context);

		expect(prompt).toContain("<IDENTITY_PROTOCOL>");
		expect(prompt).toContain("PRIMARY: #FF4D00");
		expect(prompt).toContain("Rule 1");
		expect(prompt).toContain("Geometric logo");
		expect(prompt).toContain("</IDENTITY_PROTOCOL>");
	});
});
