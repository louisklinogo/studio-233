import { generateAgentResponse } from "../packages/ai/src";

async function testCreativeAgent() {
	console.log("Testing Creative Agent...");
	try {
		const result = await generateAgentResponse("vision", {
			prompt:
				"Give me a cyberpunk color palette for a futuristic city interface.",
		});
		console.log("Response:", result.text);
	} catch (error) {
		console.error("Error:", error);
	}
}

testCreativeAgent();
