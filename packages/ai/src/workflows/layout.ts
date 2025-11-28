import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { z } from "zod";

import { getEnv } from "../config";
import { GEMINI_PRO_MODEL, GEMINI_TEXT_MODEL } from "../model-config";

const env = getEnv();

export const htmlGeneratorInputSchema = z.object({
	brief: z.string().min(10),
	brandTone: z.string().default("modern, clean"),
	layout: z
		.enum(["single-column", "two-column", "grid", "hero+sections"])
		.default("hero+sections"),
	sections: z.array(z.string()).min(2).max(8).default(["Hero", "Body", "CTA"]),
	colorPalette: z.array(z.string()).min(2).max(6).optional(),
	detailLevel: z.enum(["minimal", "full"]).default("minimal"),
});

export const htmlGeneratorOutputSchema = z.object({
	html: z.string(),
	css: z.string(),
	components: z.array(z.string()),
	rationale: z.string(),
});

export type HtmlGeneratorInput = z.infer<typeof htmlGeneratorInputSchema>;
export type HtmlGeneratorResult = z.infer<typeof htmlGeneratorOutputSchema>;

export async function runHtmlGeneratorWorkflow(
	input: HtmlGeneratorInput,
): Promise<HtmlGeneratorResult> {
	const key = env.googleApiKey;
	if (!key) {
		throw new Error("Google API key required for HTML generation");
	}
	const google = createGoogleGenerativeAI({ apiKey: key });
	const prompt = `You are a senior UI engineer. Create semantic HTML and ${input.detailLevel === "full" ? "fully detailed" : "minimal"} CSS for the following layout.
Brief: ${input.brief}
Brand tone: ${input.brandTone}
Layout: ${input.layout}
Sections: ${input.sections.join(", ")}
Color palette: ${input.colorPalette?.join(", ") ?? "designer's choice"}
Return only JSON with keys html, css, rationale, components (component names).`;
	const result = await generateText({
		model: google(GEMINI_TEXT_MODEL),
		prompt,
	});
	const parsed = JSON.parse(result.text ?? "{}");
	return {
		html: parsed.html ?? "",
		css: parsed.css ?? "",
		components: parsed.components ?? [],
		rationale: parsed.rationale ?? "",
	};
}

export const htmlGeneratorWorkflow = {
	id: "html-generator",
	inputSchema: htmlGeneratorInputSchema,
	outputSchema: htmlGeneratorOutputSchema,
	run: runHtmlGeneratorWorkflow,
};

export const layoutDesignerInputSchema = z.object({
	projectType: z.enum(["landing", "email", "presentation", "dashboard"]),
	goals: z.array(z.string()).min(1),
	targetAudience: z.string().default("general"),
	platforms: z.array(z.string()).default(["web"]),
});

export const layoutDesignerOutputSchema = z.object({
	sections: z.array(
		z.object({
			name: z.string(),
			purpose: z.string(),
			contentGuidelines: z.array(z.string()),
			keyMetrics: z.array(z.string()),
		}),
	),
	layoutNotes: z.string(),
	testingChecklist: z.array(z.string()),
});

export type LayoutDesignerInput = z.infer<typeof layoutDesignerInputSchema>;
export type LayoutDesignerResult = z.infer<typeof layoutDesignerOutputSchema>;

export async function runLayoutDesignerWorkflow(
	input: LayoutDesignerInput,
): Promise<LayoutDesignerResult> {
	const key = env.googleApiKey;
	if (!key) throw new Error("Google API key required for layout design");
	const google = createGoogleGenerativeAI({ apiKey: key });
	const prompt = `Create a detailed layout plan for a ${input.projectType} targeting ${input.targetAudience}.
Goals: ${input.goals.join(", ")}
Platforms: ${input.platforms.join(", ")}
Respond as JSON with sections (name, purpose, contentGuidelines[3], keyMetrics[2]), layoutNotes, testingChecklist.`;
	const result = await generateText({
		model: google(GEMINI_PRO_MODEL),
		prompt,
	});
	const parsed = JSON.parse(result.text ?? "{}");
	return {
		sections: parsed.sections ?? [],
		layoutNotes: parsed.layoutNotes ?? "",
		testingChecklist: parsed.testingChecklist ?? [],
	};
}

export const layoutDesignerWorkflow = {
	id: "layout-designer",
	inputSchema: layoutDesignerInputSchema,
	outputSchema: layoutDesignerOutputSchema,
	run: runLayoutDesignerWorkflow,
};
