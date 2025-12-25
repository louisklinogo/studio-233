import { z } from "zod";

export const htmlGeneratorInputSchema = z.object({
	brief: z.string().min(10),
	format: z
		.enum(["web-page", "email-template", "poster", "flyer", "social-post"])
		.default("web-page"),
	brandTone: z.string().default("modern, clean"),
	layout: z
		.enum([
			"single-column",
			"two-column",
			"grid",
			"hero+sections",
			"typographic-bold",
			"image-centric",
			"minimalist-centered",
		])
		.default("hero+sections"),
	dimensions: z
		.object({
			width: z.number().optional(),
			height: z.number().optional(),
			aspectRatio: z.string().optional(),
		})
		.optional(),
	sections: z.array(z.string()).min(1).max(12).default(["Hero", "Body", "CTA"]),
	colorPalette: z.array(z.string()).min(2).max(6).optional(),
	detailLevel: z.enum(["minimal", "full"]).default("minimal"),
});

export const htmlGeneratorOutputSchema = z.object({
	html: z.string(),
	css: z.string(),
	components: z.array(z.string()),
	rationale: z.string(),
});

export const layoutDesignerInputSchema = z.object({
	projectType: z.enum([
		"landing-page",
		"email-campaign",
		"presentation-deck",
		"poster-design",
		"flyer",
		"social-media-graphic",
		"dashboard-ui",
	]),
	goals: z.array(z.string()).min(1),
	targetAudience: z.string().default("general"),
	brandVoice: z.string().optional(),
	platforms: z.array(z.string()).default(["web"]),
});

export const layoutDesignerOutputSchema = z.object({
	composition: z.array(
		z.object({
			elementName: z
				.string()
				.describe("e.g., Headline, Hero Image, CTA, Disclaimer"),
			role: z.string().describe("The strategic purpose of this element"),
			visualPriority: z.enum(["primary", "secondary", "tertiary"]),
			contentGuidelines: z.array(z.string()),
			suggestedStyling: z
				.string()
				.describe("Typography or visual style recommendations"),
		}),
	),
	strategyRationale: z.string(),
	checklist: z.array(z.string()).describe("QA or design verification steps"),
});
