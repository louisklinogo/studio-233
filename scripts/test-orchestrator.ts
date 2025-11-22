import { mastra } from "../src/mastra";

async function testOrchestrator() {
	const agent = mastra.getAgent("Studio Orchestrator");

	const testCases = [
		"Remove the background from this image",
		"Make this photo look like a Van Gogh painting",
		"Apply this style to all 50 images",
		"What should I do with this empty canvas?",
	];

	console.log("Starting Orchestrator Tests...\n");

	for (const prompt of testCases) {
		console.log(`Input: "${prompt}"`);
		try {
			const result = await agent.generate(prompt);
			console.log("Output:", result.text);
			console.log("---\n");
		} catch (error) {
			console.error("Error:", error);
		}
	}
}

testOrchestrator();
