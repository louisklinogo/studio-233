export class TimeoutError extends Error {
	readonly timeoutMs: number;
	readonly label: string;

	constructor(label: string, timeoutMs: number) {
		super(`${label} timed out after ${timeoutMs}ms`);
		this.name = "TimeoutError";
		this.label = label;
		this.timeoutMs = timeoutMs;
	}
}

function createAbortError(signal: AbortSignal) {
	return signal.reason instanceof Error
		? signal.reason
		: new Error(signal.reason ? String(signal.reason) : "Aborted");
}

function abortPromise(signal: AbortSignal): Promise<never> {
	return new Promise((_, reject) => {
		if (signal.aborted) {
			reject(createAbortError(signal));
			return;
		}
		signal.addEventListener(
			"abort",
			() => {
				reject(createAbortError(signal));
			},
			{ once: true },
		);
	});
}

function createOperationSignal(
	label: string,
	timeoutMs: number,
	parentSignal?: AbortSignal,
): { signal: AbortSignal; cleanup: () => void } {
	const controller = new AbortController();

	const onParentAbort = () => {
		controller.abort(parentSignal?.reason);
	};

	if (parentSignal) {
		if (parentSignal.aborted) {
			onParentAbort();
		} else {
			parentSignal.addEventListener("abort", onParentAbort, { once: true });
		}
	}

	const timer = setTimeout(() => {
		controller.abort(new TimeoutError(label, timeoutMs));
	}, timeoutMs);

	const cleanup = () => {
		clearTimeout(timer);
		if (parentSignal && !parentSignal.aborted) {
			parentSignal.removeEventListener("abort", onParentAbort);
		}
	};

	return { signal: controller.signal, cleanup };
}

/**
 * Run an async operation with a hard timeout and optional abort propagation.
 * The `fn` should respect the provided signal for best cancellation behavior.
 */
export async function withTimeout<T>(
	label: string,
	timeoutMs: number,
	fn: (signal: AbortSignal) => Promise<T>,
	parentSignal?: AbortSignal,
): Promise<T> {
	if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
		// No timeout configured; still allow parent abort if provided.
		const signal = parentSignal ?? new AbortController().signal;
		return await Promise.race([fn(signal), abortPromise(signal)]);
	}

	const { signal, cleanup } = createOperationSignal(
		label,
		timeoutMs,
		parentSignal,
	);
	try {
		const p = fn(signal);
		// If we time out, this prevents unhandled rejections from the underlying task.
		p.catch(() => undefined);
		return (await Promise.race([p, abortPromise(signal)])) as T;
	} finally {
		cleanup();
	}
}
