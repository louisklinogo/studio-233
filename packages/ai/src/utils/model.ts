import { devToolsMiddleware } from "@ai-sdk/devtools";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { wrapLanguageModel } from "ai";

/**
 * Creates a Google Generative AI provider instance.
 */
export function createGoogleProvider(
	options: Parameters<typeof createGoogleGenerativeAI>[0],
) {
	return createGoogleGenerativeAI(options);
}

/**
 * Wraps a language model with DevTools middleware if in development mode.
 */
export function withDevTools<
	T extends Parameters<typeof wrapLanguageModel>[0]["model"],
>(model: T): T {
	if (process.env.NODE_ENV === "development") {
		return wrapLanguageModel({
			model,
			middleware: devToolsMiddleware(),
		}) as unknown as T;
	}
	return model;
}
