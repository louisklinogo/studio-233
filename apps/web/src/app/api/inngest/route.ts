import { serve } from "inngest/next";
import type { NextRequest } from "next/server";
import { inngest } from "@/inngest/client";

import { brandIngestion } from "@/inngest/functions/brand-ingestion";
import { processStudioWorkflow } from "@/inngest/functions/studio/process-workflow";

type RouteContext = { params: Promise<Record<string, string>> };
type AppRouteHandler = (
	request: NextRequest,
	context: RouteContext,
) => Response | Promise<Response>;

const handlers = serve({
	client: inngest,
	functions: [processStudioWorkflow, brandIngestion],
});

const adapt = <T extends keyof typeof handlers>(method: T) => {
	const handler = handlers[method] as (
		...args: any[]
	) => Promise<Response> | Response;
	return ((request, context) =>
		handler(request, context)) satisfies AppRouteHandler;
};

export const GET = adapt("GET");
export const POST = adapt("POST");
export const PUT = adapt("PUT");
