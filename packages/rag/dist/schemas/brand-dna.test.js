import { describe, expect, it } from "bun:test";
import { BrandDNASchema } from "./brand-dna";

describe("BrandDNASchema", () => {
	const validData = {
		coreIdentity: {
			colors: ["#FFFFFF", "#000000"],
			fonts: [{ family: "Inter", usage: "Body" }],
			logos: ["logo_url"],
			slogans: ["Just do it"],
		},
		visualStyle: {
			layoutPrinciples: ["Grid-based"],
			imageryStyle: ["Minimalist"],
			photographyGuidelines: ["High contrast"],
			vibe: "Modern and clean",
		},
		semanticDNA: {
			toneOfVoice: "Professional",
			copywritingGuidelines: ["Be concise"],
		},
	};
	it("should validate a complete and valid BrandDNA object", () => {
		const result = BrandDNASchema.safeParse(validData);
		expect(result.success).toBe(true);
	});
	it("should reject an empty object", () => {
		const result = BrandDNASchema.safeParse({});
		expect(result.success).toBe(false);
	});
	it("should reject missing sections", () => {
		const { coreIdentity, ...rest } = validData;
		const result = BrandDNASchema.safeParse(rest);
		expect(result.success).toBe(false);
	});
	it("should enforce non-empty strings for critical fields", () => {
		const invalidData = {
			...validData,
			semanticDNA: {
				...validData.semanticDNA,
				toneOfVoice: "", // Empty string should be invalid
			},
		};
		const result = BrandDNASchema.safeParse(invalidData);
		expect(result.success).toBe(false);
	});
	it("should enforce at least one color", () => {
		const invalidData = {
			...validData,
			coreIdentity: {
				...validData.coreIdentity,
				colors: [], // Empty array should be invalid
			},
		};
		const result = BrandDNASchema.safeParse(invalidData);
		expect(result.success).toBe(false);
	});
});
