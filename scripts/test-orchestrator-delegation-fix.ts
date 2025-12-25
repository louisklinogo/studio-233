import { generateAgentResponse } from "../packages/ai/src";

async function testDelegationFix() {
	console.log("Test: 'Make this a woman' (Generative Edit/Variation)");
	try {
		// We simulate an image being attached by providing a URL in the prompt or context
		// The prompt "Make this a woman" implies context.
		// We'll be explicit: "Make this image a woman: <url>"
		const result = await generateAgentResponse("orchestrator", {
			prompt: "Make this image a woman",
			maxSteps: 1,
			metadata: {
				context: {
					latestImageUrl:
						"https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/1200px-Cat03.jpg",
					runAgent: async (agent: string, options: any) => {
						console.log(
							`MOCK: runAgent called for ${agent} with task: "${options.prompt}"`,
						);
						return {
							text: `Delegated to ${agent} successfully.`,
							toolCalls: [],
							toolResults: [],
						};
					},
				},
			},
		});

		console.log("Result Text:", result.text);
		console.log("Tool Calls:", JSON.stringify(result.toolCalls, null, 2));

		// Check if we have tool calls
		if (result.toolCalls && result.toolCalls.length > 0) {
			const toolNames = result.toolCalls.map((tc) => tc.toolName);
			console.log("Tools called:", toolNames);

			const delegateCall = result.toolCalls.find(
				(tc) => tc.toolName === "delegateToAgent",
			);
			if (delegateCall) {
				console.log("Delegate args:", delegateCall.args);
				if (!delegateCall.args.agent || !delegateCall.args.task) {
					console.error("FAIL: delegateToAgent called without required args!");
				} else {
					console.log("PASS: delegateToAgent called with args.");
				}
			} else {
				// If it didn't delegate, it might have called visionAnalysis or canvasTextToImage
				if (
					toolNames.includes("visionAnalysis") ||
					toolNames.includes("canvasTextToImage")
				) {
					console.log(
						"PASS: Orchestrator handled it directly (or started to).",
					);
				} else {
					console.log("NOTE: Orchestrator did something else.");
				}
			}
		} else {
			console.log(
				"No tool calls. The model might have just answered textually.",
			);
		}
	} catch (error) {
		console.error("Error in Test:", error);
	}
}

testDelegationFix();
