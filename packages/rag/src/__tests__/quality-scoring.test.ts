import { describe, expect, it } from "bun:test";
import { calculateQualityScore } from "../multimodal-service";

describe("calculateQualityScore", () => {
	it("should return low score for empty or minimal content", () => {
		const dna = {
			coreIdentity: { colors: [], fonts: [], logos: [], slogans: [] },
			visualStyle: {
				layoutPrinciples: [],
				imageryStyle: [],
				photographyGuidelines: [],
				vibe: "",
			},
			semanticDNA: { toneOfVoice: "", copywritingGuidelines: [] },
		};
		expect(calculateQualityScore(dna)).toBeLessThan(0.5);
	});

	it("should return high score for fully populated content", () => {
		const dna = {
			coreIdentity: {
				colors: ["#000000"],
				fonts: [{ family: "Inter", usage: "Main" }],
				logos: ["logo.png"],
				slogans: ["Just do it"],
			},
			visualStyle: {
				layoutPrinciples: ["Grid"],
				imageryStyle: ["Minimal"],
				photographyGuidelines: ["High contrast"],
				vibe: "Modern",
			},
			semanticDNA: {
				toneOfVoice: "Professional",
				copywritingGuidelines: ["Be concise"],
			},
		};
		expect(calculateQualityScore(dna)).toBeGreaterThan(0.8);
	});
});
