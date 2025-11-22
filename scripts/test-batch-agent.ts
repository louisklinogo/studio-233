import { mastra } from "../src/mastra";

async function testBatchAgent() {
	const agent = mastra.getAgent("batchAgent");

	console.log("Testing Batch Agent...");
	try {
		const result = await agent.generate(
			"I want to remove the background from all these 50 product photos and save them as PNGs.",
		);
		console.log("Response:", result.text);
	} catch (error) {
		console.error("Error:", error);
	}
}

testBatchAgent();
