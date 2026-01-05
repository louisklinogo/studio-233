import { z } from "zod";

export const BrandDNASchema = z.object({
	coreIdentity: z.object({
		colors: z.array(z.string()).describe("Hex codes or color names"),
		fonts: z.array(
			z.object({
				family: z.string(),
				usage: z.string().describe("e.g., Header, Body, Accent"),
			}),
		),
		logos: z.array(z.string()).describe("Descriptions or URLs of logos"),
		slogans: z.array(z.string()).describe("Key brand slogans or taglines"),
	}),
	visualStyle: z.object({
		layoutPrinciples: z
			.array(z.string())
			.describe("Rules governing layout and spacing"),
		imageryStyle: z.array(z.string()).describe("Description of imagery style"),
		photographyGuidelines: z
			.array(z.string())
			.describe("Guidelines for photography"),
		vibe: z.string().describe("Overall aesthetic and emotional vibe"),
	}),
	semanticDNA: z.object({
		toneOfVoice: z.string().describe("Brand's tone of voice description"),
		copywritingGuidelines: z
			.array(z.string())
			.describe("Rules for writing copy"),
	}),
});

export type BrandDNA = z.infer<typeof BrandDNASchema>;
