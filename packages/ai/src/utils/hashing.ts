/**
 * Efficient SHA-256 hashing using Bun's native CryptoHasher.
 * Supports string, Buffer, Uint8Array, and ReadableStream.
 */
export async function computeSHA256(
	input: string | Buffer | Uint8Array | ReadableStream<Uint8Array>,
): Promise<string> {
	const hasher = new Bun.CryptoHasher("sha256");

	if (input instanceof ReadableStream) {
		const reader = input.getReader();
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			if (value) hasher.update(value);
		}
	} else {
		hasher.update(input);
	}

	return hasher.digest("hex");
}
