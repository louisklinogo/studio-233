import { mastra } from "../packages/ai/src";

async function testOrchestratorTools() {
	const agent = mastra.getAgent("orchestratorAgent");

	// Test Case 1: Background Removal
	console.log("Test 1: Background Removal Request");
	try {
		const result = await agent.generate(
			"Remove the background from this image: https://example.com/image.jpg",
		);
		console.log("Result:", JSON.stringify(result.text, null, 2));
		console.log("Tool calls:", JSON.stringify(result.toolCalls, null, 2));
	} catch (error) {
		console.error("Error in Test 1:", error);
	}

	console.log("\n---\n");

	// Test Case 2: Object Isolation
	console.log("Test 2: Object Isolation Request");
	try {
		const result = await agent.generate(
			"Isolate the red car from this image: https://example.com/car.jpg",
		);
		console.log("Result:", JSON.stringify(result.text, null, 2));
		console.log("Tool calls:", JSON.stringify(result.toolCalls, null, 2));
	} catch (error) {
		console.error("Error in Test 2:", error);
	}
}

testOrchestratorTools();
