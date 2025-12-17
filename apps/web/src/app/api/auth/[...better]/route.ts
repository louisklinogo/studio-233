import { auth } from "@studio233/auth";
import { toNextJsHandler } from "better-auth/next-js";
import {
	createRateLimiter,
	RATE_LIMIT_PERIOD_LABELS,
	type RateLimiter,
	shouldLimitRequest,
} from "@/lib/ratelimit";

const AUTH_BASE_PATH = "/api/auth";
const SENSITIVE_ENDPOINTS = new Set([
	"/request-password-reset",
	"/reset-password",
]);

const RETRY_AFTER_SECONDS = {
	perMinute: 60,
	perHour: 3_600,
	perDay: 86_400,
} as const;

const authRateLimiter: RateLimiter = {
	perMinute: createRateLimiter(5, "60 s"),
	perHour: createRateLimiter(20, "60 m"),
	perDay: createRateLimiter(60, "24 h"),
};

const handler = async (request: Request): Promise<Response> => {
	const url = new URL(request.url);
	const subPath = getAuthSubPath(url.pathname);
	if (subPath && SENSITIVE_ENDPOINTS.has(subPath)) {
		const ip = getClientIp(request);
		const limitResult = await shouldLimitRequest(
			authRateLimiter,
			ip,
			`better-auth${subPath}`,
		);
		if (limitResult.shouldLimitRequest && limitResult.period) {
			const period = limitResult.period;
			const retryAfter = RETRY_AFTER_SECONDS[period].toString();
			return new Response(
				JSON.stringify({
					error:
						"Too many password reset attempts. Please wait before trying again.",
					period: RATE_LIMIT_PERIOD_LABELS[period],
				}),
				{
					status: 429,
					headers: {
						"Content-Type": "application/json",
						"Retry-After": retryAfter,
					},
				},
			);
		}
	}

	return auth.handler(request);
};

function getAuthSubPath(pathname: string): string | null {
	if (!pathname.startsWith(AUTH_BASE_PATH)) return null;
	const sub = pathname.slice(AUTH_BASE_PATH.length);
	return sub.startsWith("/") ? sub : `/${sub}`;
}

function getClientIp(request: Request): string {
	const forwarded = request.headers.get("x-forwarded-for");
	if (forwarded) {
		const ip = forwarded.split(",")[0]?.trim();
		if (ip) return ip;
	}
	const realIp = request.headers.get("x-real-ip");
	if (realIp) return realIp;
	return "unknown";
}

const nextHandler = toNextJsHandler({ handler });

export const { GET, POST, PUT, PATCH, DELETE } = nextHandler;
