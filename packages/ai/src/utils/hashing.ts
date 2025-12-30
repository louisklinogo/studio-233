/**
 * Efficient SHA-256 hashing using the standard Web Crypto API (supported by Bun and Node.js).
 * Supports string, Buffer, Uint8Array, and ReadableStream.
 */
export async function computeSHA256(
	input: string | Buffer | Uint8Array | ReadableStream<Uint8Array>,
): Promise<string> {
	let data: Uint8Array;

	if (input instanceof ReadableStream) {
		const reader = input.getReader();
		const chunks: Uint8Array[] = [];
		let totalLength = 0;
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			if (value) {
				chunks.push(value);
				totalLength += value.length;
			}
		}
		data = new Uint8Array(totalLength);
		let offset = 0;
		for (const chunk of chunks) {
			data.set(chunk, offset);
			offset += chunk.length;
		}
	} else if (typeof input === "string") {
		data = new TextEncoder().encode(input);
	} else {
		data = new Uint8Array(input);
	}

	const hashBuffer = await crypto.subtle.digest(
		"SHA-256",
		data.slice().buffer as ArrayBuffer,
	);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
