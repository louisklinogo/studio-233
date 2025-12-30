import { AssetFetchError, BlobStorageError } from "../packages/ai/src/errors";
import { runVisionAnalysisWorkflow } from "../packages/ai/src/workflows/vision-analysis";

async function main() {
	console.log("--- Starting Phase 2 Manual Verification ---");

	// 1. Verify Exports
	if (typeof runVisionAnalysisWorkflow === "function") {
		console.log("✅ Workflow Export: PASS");
	} else {
		console.error("❌ Workflow Export: FAIL");
	}

	if (AssetFetchError && new AssetFetchError("test") instanceof Error) {
		console.log("✅ AssetFetchError Export: PASS");
	} else {
		console.error("❌ AssetFetchError Export: FAIL");
	}

	if (BlobStorageError && new BlobStorageError("test") instanceof Error) {
		console.log("✅ BlobStorageError Export: PASS");
	} else {
		console.error("❌ BlobStorageError Export: FAIL");
	}

	console.log("--- Verification Complete ---");
}

main();
