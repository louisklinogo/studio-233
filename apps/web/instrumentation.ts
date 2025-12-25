import { registerOTel } from "@vercel/otel";

export async function register() {
	if (process.env.NEXT_RUNTIME === "nodejs") {
		const { initLangWatch } = await import("@studio233/ai/telemetry");
		initLangWatch();
	}

	(globalThis as any).___MASTRA_TELEMETRY___ = true;

	registerOTel({
		serviceName: "studio-233-web",
	});
}
