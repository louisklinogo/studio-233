import { mastra } from "../packages/ai/src";

async function testCreativeAgent() {
	const agent = mastra.getAgent("creativeAgent");

	console.log("Testing Creative Agent...");
	try {
		const result = await agent.generate(
			"Give me a cyberpunk color palette for a futuristic city interface.",
		);
		console.log("Response:", result.text);
	} catch (error) {
		console.error("Error:", error);
	}
}

testCreativeAgent();
