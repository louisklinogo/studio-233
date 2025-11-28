import { streamAgentResponse } from "@studio233/ai";

export async function POST(req: Request) {
	try {
		const { messages, canvas } = await req.json();

		const stream = streamAgentResponse("orchestrator", {
			messages,
			metadata: {
				context: { canvas },
			},
		});

		const enhanced = stream as unknown as {
			toAIStreamResponse?: () => Response;
		};
		return enhanced.toAIStreamResponse?.() ?? stream.toTextStreamResponse();
	} catch (error) {
		console.error("Chat API Error:", error);

		return new Response(JSON.stringify({ error: "Internal Server Error" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
