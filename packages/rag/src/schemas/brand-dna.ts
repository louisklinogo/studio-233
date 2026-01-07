import { z } from "zod";

export const BrandDNASchema = z.object({
	coreIdentity: z.object({
		colors: z
			.array(z.string())
			.default([])
			.describe("Hex codes or color names"),
		fonts: z
			.array(
				z.object({
					family: z.string(),
					usage: z.string().describe("e.g., Header, Body, Accent"),
				}),
			)
			.default([]),
		logos: z
			.array(z.string())
			.default([])
			.describe("Descriptions or URLs of logos"),
		slogans: z
			.array(z.string())
			.default([])
			.describe("Key brand slogans or taglines"),
	}),
	visualStyle: z.object({
		layoutPrinciples: z
			.array(z.string())
			.default([])
			.describe("Rules governing layout and spacing"),
		imageryStyle: z
			.array(z.string())
			.default([])
			.describe("Description of imagery style"),
		photographyGuidelines: z
			.array(z.string())
			.default([])
			.describe("Guidelines for photography"),
		vibe: z
			.string()
			.default("")
			.describe("Overall aesthetic and emotional vibe"),
	}),
	semanticDNA: z.object({
		toneOfVoice: z
			.string()
			.default("")
			.describe("Brand's tone of voice description"),
		copywritingGuidelines: z
			.array(z.string())
			.default([])
			.describe("Rules for writing copy"),
	}),
});

export type BrandDNA = z.infer<typeof BrandDNASchema>;
