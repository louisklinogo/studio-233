import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { getEnv } from "../config";

const env = getEnv();
const google = createGoogleGenerativeAI({ apiKey: env.googleApiKey });

/**
 * Generates a concise, creative title for a chat thread based on the first message.
 * Optimized for Studio 233's Swiss Industrial aesthetic.
 */
export async function generateThreadTitle(
	firstMessage: string,
): Promise<string> {
	try {
		const { object } = await generateObject({
			model: google("gemini-3-flash-preview"), // Fast & reliable for summarization
			schema: z.object({
				title: z
					.string()
					.describe("A 3-5 word creative title for the conversation"),
			}),
			system: `You are Paco, the Swiss design lead for Studio 233. 
Your task is to provide a concise, professional, and slightly creative title for a new design session.
The title should be at most 5 words.
Avoid generic titles like "New Conversation" or "Image Request". 
Focus on the technical or artistic essence of the user's prompt.
Example inputs -> outputs:
"draw a red matte black car" -> "Matte Red Automotive Study"
"how do i use layers?" -> "System Navigation Inquiry"
"generate a minimal poster" -> "Minimalist Composition Session"`,
			prompt: firstMessage,
		});

		return object.title;
	} catch (error) {
		console.error("Failed to generate thread title:", error);
		return firstMessage.slice(0, 50); // Fallback to slice
	}
}
