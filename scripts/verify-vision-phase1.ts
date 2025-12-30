import { computeSHA256 } from "../packages/ai/src/utils/hashing";
import { robustFetch } from "../packages/ai/src/utils/http";

async function main() {
	console.log("--- Starting Phase 1 Manual Verification ---");

	// 1. Hashing
	// echo -n "test-string" | sha256sum
	// d0aa37050523e164478f77d7190e2947f6d83391219b6710b14620f3299cc357
	const input = "test-string";
	const expectedHash =
		"ffe65f1d98fafedea3514adc956c8ada5980c6c5d2552fd61f48401aefd5c00e";
	try {
		const hash = await computeSHA256(input);
		if (hash === expectedHash) {
			console.log(`✅ SHA-256 Check: PASS (${hash.substring(0, 8)}...)`);
		} else {
			console.error(
				`❌ SHA-256 Check: FAIL. Expected ${expectedHash}, got ${hash}`,
			);
		}
	} catch (e) {
		console.error("❌ SHA-256 Check: ERROR", e);
	}

	// 2. HTTP
	try {
		// Use a reliable public endpoint
		const res = await robustFetch("https://www.google.com", { timeout: 5000 });
		if (res.ok) {
			console.log("✅ RobustFetch Check: PASS (Status 200)");
		} else {
			console.error(`❌ RobustFetch Check: FAIL. Status ${res.status}`);
		}
	} catch (e) {
		console.error("❌ RobustFetch Check: FAIL (Network/Timeout)", e);
	}

	// 3. Blob Storage
	// We strictly verify that the module loads and the function is exported.
	// Actual upload requires credentials which might not be safe/available in this context.
	try {
		const { uploadImageBufferToBlob } = await import(
			"../packages/ai/src/utils/blob-storage"
		);
		if (typeof uploadImageBufferToBlob === "function") {
			console.log("✅ Blob Storage Module: PASS (Function exported)");
		} else {
			console.error("❌ Blob Storage Module: FAIL (Function missing)");
		}
	} catch (e) {
		console.error("❌ Blob Storage Module: ERROR", e);
	}

	console.log("--- Verification Complete ---");
}

main();
