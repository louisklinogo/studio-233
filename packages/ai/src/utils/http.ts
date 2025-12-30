import { logger } from "./logger";

export type RobustFetchOptions = {
	maxRetries?: number;
	retryDelay?: number;
	timeoutMs?: number;
	abortSignal?: AbortSignal;
};

/**
 * A resilient fetcher specifically tuned for the Bun runtime.
 * Implements exponential backoff and retries for transient network errors.
 */
export async function robustFetch(
	url: string | URL,
	options: RobustFetchOptions = {},
): Promise<Response> {
	const {
		maxRetries = 3,
		retryDelay = 500,
		timeoutMs = 20_000,
		abortSignal,
	} = options;

	let lastError: Error | undefined;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

		// Link parent abort signal if provided
		if (abortSignal) {
			if (abortSignal.aborted) {
				clearTimeout(timeoutId);
				throw abortSignal.reason;
			}
			abortSignal.addEventListener("abort", () => controller.abort(), {
				once: true,
			});
		}

		try {
			if (attempt > 0) {
				const delay = retryDelay * Math.pow(2, attempt - 1);
				logger.info("robust_fetch.retry", { url: String(url), attempt, delay });
				await new Promise((resolve) => setTimeout(resolve, delay));
			}

			const response = await fetch(url, {
				signal: controller.signal,
			});

			if (response.ok) {
				return response;
			}

			// Retry on 5xx server errors
			if (response.status >= 500) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			// Don't retry on 4xx (Client errors)
			return response;
		} catch (error) {
			lastError = error as Error;

			// Don't retry if the operation was explicitly aborted by the user
			if (abortSignal?.aborted) {
				throw error;
			}

			logger.warn("robust_fetch.attempt_failed", {
				url: String(url),
				attempt,
				message: lastError.message,
			});
		} finally {
			clearTimeout(timeoutId);
		}
	}

	throw (
		lastError ?? new Error(`Failed to fetch ${url} after ${maxRetries} retries`)
	);
}
