import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject, generateText } from "ai";
import { z } from "zod";

import { getEnv } from "../config";
import { GEMINI_PRO_MODEL, GEMINI_TEXT_MODEL } from "../model-config";
import { logger } from "../utils/logger";

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

type HtmlGeneratorDeps = {
	generateObjectFn?: typeof generateObject;
	generateTextFn?: typeof generateText;
	createGoogleFn?: typeof createGoogleGenerativeAI;
};

function extractJsonObject(responseText: string) {
	const trimmed = responseText.trim();
	const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
	const withoutFences = fenceMatch ? fenceMatch[1] : trimmed;
	const start = withoutFences.indexOf("{");
	const end = withoutFences.lastIndexOf("}");
	const candidate =
		start !== -1 && end !== -1 && end > start
			? withoutFences.slice(start, end + 1)
			: withoutFences;

	return JSON.parse(candidate);
}

function coerceHtmlGeneratorResult(value: unknown): HtmlGeneratorResult {
	const data = value as Record<string, unknown>;

	return {
		html: typeof data.html === "string" ? data.html : "",
		css: typeof data.css === "string" ? data.css : "",
		components: Array.isArray(data.components)
			? data.components.filter((c) => typeof c === "string")
			: [],
		rationale: typeof data.rationale === "string" ? data.rationale : "",
	};
}

export async function runHtmlGeneratorWorkflow(
	input: HtmlGeneratorInput,
	deps: HtmlGeneratorDeps = {},
): Promise<HtmlGeneratorResult> {
	const key = env.googleApiKey;
	if (!key) {
		throw new Error("Google API key required for HTML generation");
	}

	const generateObjectFn = deps.generateObjectFn ?? generateObject;
	const generateTextFn = deps.generateTextFn ?? generateText;
	const createGoogleFn = deps.createGoogleFn ?? createGoogleGenerativeAI;

	const sections =
		Array.isArray(input.sections) && input.sections.length > 0
			? input.sections
			: ["Hero", "Body", "CTA"];

	const colorPalette =
		Array.isArray(input.colorPalette) && input.colorPalette.length > 0
			? input.colorPalette
			: undefined;

	const prompt = `You are a senior UI engineer. Create semantic HTML and ${input.detailLevel === "full" ? "fully detailed" : "minimal"} CSS for the following layout.
Brief: ${input.brief}
Brand tone: ${input.brandTone}
Layout: ${input.layout}
Sections: ${sections.join(", ")}
Color palette: ${colorPalette?.join(", ") ?? "designer's choice"}
Return only a single JSON object with keys html, css, rationale, components (component names). Do not include markdown, code fences, or prose.`;

	const google = createGoogleFn({ apiKey: key });
	const model = google(GEMINI_TEXT_MODEL);

	try {
		const result = await generateObjectFn({
			model,
			schema: htmlGeneratorOutputSchema,
			prompt,
		});

		return htmlGeneratorOutputSchema.parse(result.object);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		logger.warn("html-generator.object-fallback", { message });
	}

	let responseText = "{}";
	try {
		const result = await generateTextFn({
			model,
			prompt,
		});
		responseText = result.text ?? "{}";
	} catch (error) {
		const message =
			error instanceof Error
				? error.message
				: "Unknown error from generateText";
		throw new Error(`html-generator: model request failed: ${message}`);
	}

	try {
		const parsed = extractJsonObject(responseText);
		return coerceHtmlGeneratorResult(parsed);
	} catch (error) {
		logger.error("html-generator: failed-to-parse", {
			snippet: responseText.slice(0, 2000),
			message: error instanceof Error ? error.message : String(error),
		});
		throw new Error("html-generator: failed to parse model response as JSON");
	}
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
