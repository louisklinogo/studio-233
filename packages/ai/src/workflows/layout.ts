import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createStep, createWorkflow } from "@mastra/core/workflows";
import { generateText } from "ai";
import { z } from "zod";

import { getEnv } from "../config";

const env = getEnv();

const htmlGeneratorStep = createStep({
	id: "html-generator-step",
	inputSchema: z.object({
		brief: z.string().min(10),
		brandTone: z.string().default("modern, clean"),
		layout: z
			.enum(["single-column", "two-column", "grid", "hero+sections"])
			.default("hero+sections"),
		sections: z
			.array(z.string())
			.min(2)
			.max(8)
			.default(["Hero", "Body", "CTA"]),
		colorPalette: z.array(z.string()).min(2).max(6).optional(),
		detailLevel: z.enum(["minimal", "full"]).default("minimal"),
	}),
	outputSchema: z.object({
		html: z.string(),
		css: z.string(),
		components: z.array(z.string()),
		rationale: z.string(),
	}),
	execute: async ({ inputData }) => {
		const key = env.googleApiKey;
		if (!key) {
			throw new Error("Google API key required for HTML generation");
		}
		const google = createGoogleGenerativeAI({ apiKey: key });
		const prompt = `You are a senior UI engineer. Create semantic HTML and ${inputData.detailLevel === "full" ? "fully detailed" : "minimal"} CSS for the following layout.
Brief: ${inputData.brief}
Brand tone: ${inputData.brandTone}
Layout: ${inputData.layout}
Sections: ${inputData.sections.join(", ")}
Color palette: ${inputData.colorPalette?.join(", ") ?? "designer's choice"}
Return only JSON with keys html, css, rationale, components (component names).`;
		const result = await generateText({
			model: google("gemini-3-pro-preview"),
			prompt,
			responseFormat: {
				type: "json_schema",
				json_schema: {
					type: "object",
					properties: {
						html: { type: "string" },
						css: { type: "string" },
						rationale: { type: "string" },
						components: { type: "array", items: { type: "string" } },
					},
					required: ["html", "css", "rationale", "components"],
				},
			},
		});
		const parsed = JSON.parse(result.text ?? "{}");
		return {
			html: parsed.html ?? "",
			css: parsed.css ?? "",
			components: parsed.components ?? [],
			rationale: parsed.rationale ?? "",
		};
	},
});

export const htmlGeneratorWorkflow = createWorkflow({
	id: "html-generator",
	inputSchema: htmlGeneratorStep.inputSchema,
	outputSchema: htmlGeneratorStep.outputSchema,
})
	.then(htmlGeneratorStep)
	.commit();

const layoutSpecStep = createStep({
	id: "layout-spec-step",
	inputSchema: z.object({
		projectType: z.enum(["landing", "email", "presentation", "dashboard"]),
		goals: z.array(z.string()).min(1),
		targetAudience: z.string().default("general"),
		platforms: z.array(z.string()).default(["web"]),
	}),
	outputSchema: z.object({
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
	}),
	execute: async ({ inputData }) => {
		const key = env.googleApiKey;
		if (!key) throw new Error("Google API key required for layout design");
		const google = createGoogleGenerativeAI({ apiKey: key });
		const prompt = `Create a detailed layout plan for a ${inputData.projectType} targeting ${inputData.targetAudience}.
Goals: ${inputData.goals.join(", ")}
Platforms: ${inputData.platforms.join(", ")}
Respond as JSON with sections (name, purpose, contentGuidelines[3], keyMetrics[2]), layoutNotes, testingChecklist.`;
		const result = await generateText({
			model: google("gemini-2.5-pro"),
			prompt,
			responseFormat: {
				type: "json_schema",
				json_schema: {
					type: "object",
					properties: {
						sections: {
							type: "array",
							items: {
								type: "object",
								properties: {
									name: { type: "string" },
									purpose: { type: "string" },
									contentGuidelines: {
										type: "array",
										items: { type: "string" },
									},
									keyMetrics: { type: "array", items: { type: "string" } },
								},
								required: [
									"name",
									"purpose",
									"contentGuidelines",
									"keyMetrics",
								],
							},
						},
						layoutNotes: { type: "string" },
						testingChecklist: { type: "array", items: { type: "string" } },
					},
					required: ["sections", "layoutNotes", "testingChecklist"],
				},
			},
		});
		const parsed = JSON.parse(result.text ?? "{}");
		return {
			sections: parsed.sections ?? [],
			layoutNotes: parsed.layoutNotes ?? "",
			testingChecklist: parsed.testingChecklist ?? [],
		};
	},
});

export const layoutDesignerWorkflow = createWorkflow({
	id: "layout-designer",
	inputSchema: layoutSpecStep.inputSchema,
	outputSchema: layoutSpecStep.outputSchema,
})
	.then(layoutSpecStep)
	.commit();
