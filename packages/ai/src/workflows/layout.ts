import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject, generateText } from "ai";
import { z } from "zod";

import { getEnv } from "../config";
import { GEMINI_PRO_MODEL, GEMINI_TEXT_MODEL } from "../model-config";
import {
	htmlGeneratorInputSchema,
	htmlGeneratorOutputSchema,
	layoutDesignerInputSchema,
	layoutDesignerOutputSchema,
} from "../schemas/layout";
import { logger } from "../utils/logger";
import { withDevTools } from "../utils/model";

const env = getEnv();

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

	const dimensionContext = input.dimensions
		? `Target dimensions: ${input.dimensions.width}x${input.dimensions.height} (Ratio: ${input.dimensions.aspectRatio ?? "N/A"})`
		: "";

	let formatSpecifics = "";
	if (input.format === "email-template") {
		formatSpecifics =
			"- Use table-based layout for maximum compatibility.\n- Only inline CSS.\n- Avoid complex CSS grids or flexbox.";
	} else if (input.format === "poster" || input.format === "flyer") {
		formatSpecifics =
			"- Focus on high-impact visual hierarchy.\n- Use absolute positioning if necessary for precise placement.\n- Prioritize large, bold typography.";
	}

	const prompt = `You are a senior designer and UI engineer. Create a ${input.format} based on the following:
Brief: ${input.brief}
Brand tone: ${input.brandTone}
Layout strategy: ${input.layout}
Sections: ${sections.join(", ")}
Color palette: ${colorPalette?.join(", ") ?? "designer's choice"}
${dimensionContext}

Technical Requirements:
${formatSpecifics || "- Use semantic HTML5 and modern CSS."}
- Ensure everything is self-contained.
- Return only a single JSON object with keys: html, css, rationale, components (list of logical units). Do not include markdown, code fences, or prose.`;

	const google = createGoogleFn({ apiKey: key });
	const model = withDevTools(google(GEMINI_TEXT_MODEL));

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

export type LayoutDesignerInput = z.infer<typeof layoutDesignerInputSchema>;
export type LayoutDesignerResult = z.infer<typeof layoutDesignerOutputSchema>;

export async function runLayoutDesignerWorkflow(
	input: LayoutDesignerInput,
): Promise<LayoutDesignerResult> {
	const key = env.googleApiKey;
	if (!key) throw new Error("Google API key required for layout design");

	const google = createGoogleGenerativeAI({ apiKey: key });
	const model = withDevTools(google(GEMINI_PRO_MODEL));

	const prompt = `You are a Lead Brand Strategist and Art Director. Create a high-level design strategy and hierarchical layout plan for a ${input.projectType}.

Goals: ${input.goals.join(", ")}
Target Audience: ${input.targetAudience}
${input.brandVoice ? `Brand Voice: ${input.brandVoice}` : ""}
Platforms: ${input.platforms.join(", ")}

Your task is to define the 'Composition' of this design. Break it down into logical elements (e.g., Headline, Hero Image, Call to Action, Secondary Info) and assign them a visual priority (primary, secondary, tertiary). For each element, provide specific content guidelines and suggested styling (typography, scale, or weight).

Respond with a strictly structured JSON object following the schema.`;

	const result = await generateObject({
		model,
		schema: layoutDesignerOutputSchema,
		prompt,
	});

	return layoutDesignerOutputSchema.parse(result.object);
}

export const layoutDesignerWorkflow = {
	id: "layout-designer",
	inputSchema: layoutDesignerInputSchema,
	outputSchema: layoutDesignerOutputSchema,
	run: runLayoutDesignerWorkflow,
};
