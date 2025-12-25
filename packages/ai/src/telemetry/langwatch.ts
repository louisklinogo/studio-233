let isInitialized = false;

export async function initLangWatch() {
	if (isInitialized) return;

	// Only initialize if API key is present
	if (!process.env.LANGWATCH_API_KEY) {
		return;
	}

	// Only initialize in Node.js runtime
	if (typeof process !== "undefined" && process.env.NEXT_RUNTIME === "edge") {
		return;
	}

	try {
		const { setupObservability } = await import("langwatch/observability/node");
		setupObservability({
			serviceName: "studio-233-ai",
			langwatch: {
				apiKey: process.env.LANGWATCH_API_KEY,
			},
		});
		isInitialized = true;
		console.log("LangWatch observability initialized");
	} catch (error) {
		console.error("Failed to initialize LangWatch:", error);
	}
}
