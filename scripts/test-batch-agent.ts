import { generateAgentResponse } from "../packages/ai/src";

async function testBatchAgent() {
	console.log("Testing Batch Agent...");
	try {
		const result = await generateAgentResponse("batch", {
			prompt:
				"I want to remove the background from all these 50 product photos and save them as PNGs.",
		});
		console.log("Response:", result.text);
	} catch (error) {
		console.error("Error:", error);
	}
}

testBatchAgent();
