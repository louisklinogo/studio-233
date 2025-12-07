import assert from "node:assert/strict";
import test from "node:test";

const DUMMY_RESPONSE = {
	html: "<div>ok</div>",
	css: ".ok { color: red; }",
	components: ["Root"],
	rationale: "test rationale",
};

test("html generator applies defaults when sections are missing", async () => {
	process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-key";
	const prompts: string[] = [];
	const { runHtmlGeneratorWorkflow } = await import("../layout");

	const result = await runHtmlGeneratorWorkflow(
		{
			brief: "Swiss poster demo",
			brandTone: "minimal",
			layout: "grid",
			detailLevel: "minimal",
		} as any,
		{
			generateTextFn: async ({ prompt }: { prompt: string }) => {
				prompts.push(prompt);
				return { text: JSON.stringify(DUMMY_RESPONSE) } as any;
			},
			createGoogleFn: () => (modelName: string) => modelName as any,
		},
	);

	assert.equal(result.html, DUMMY_RESPONSE.html);
	assert.ok(prompts[0]?.includes("Hero, Body, CTA"));
});
