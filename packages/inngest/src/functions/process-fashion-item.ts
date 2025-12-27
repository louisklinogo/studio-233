import { generateWithGemini } from "@studio233/ai";
import { batchStore } from "@studio233/db";
import { inngest } from "../client";
import { processFashionItemEvent } from "../events";
import { MANNEQUIN_TRANSFER_PROMPTS } from "./prompts";

export const processFashionItem = inngest.createFunction(
	{ id: "process-fashion-item", concurrency: 5 },
	{ event: processFashionItemEvent },
	async ({ event, step }) => {
		const { jobId, imageUrl, maxAttempts = 7 } = event.data;

		// Update status to processing
		await step.run("update-status-processing", async () => {
			if (jobId) await batchStore.updateStatus(jobId, "processing");
		});

		let attempt = 0;
		let isVerified = false;
		let finalResultUrl = "";
		let lastFeedback = "";

		// The Verification Loop
		while (attempt < maxAttempts && !isVerified) {
			attempt++;

			// Step 1: Generate Image
			const generationResult = await step.run(
				`generate-attempt-${attempt}`,
				async () => {
					// Construct prompt with feedback if this is a retry
					const prompt =
						attempt === 1
							? MANNEQUIN_TRANSFER_PROMPTS.PROCESSING
							: `${MANNEQUIN_TRANSFER_PROMPTS.PROCESSING}\n\nPREVIOUS ATTEMPT FAILED because: ${lastFeedback}\n\nPLEASE FIX THESE SPECIFIC ISSUES.`;

					console.log(
						`[Attempt ${attempt}] Generating image for ${imageUrl}...`,
					);

					// Call Gemini with Primary -> Fallback logic
					const result = await generateWithGemini({
						prompt,
						imageUrl: imageUrl, // Pass the original image
					});

					if (!result.imageUrl) {
						throw new Error("Gemini generated text but no image.");
					}

					return {
						url: result.imageUrl,
					};
				},
			);

			// Step 2: Verify Image
			const verificationResult = await step.run(
				`verify-attempt-${attempt}`,
				async () => {
					console.log(`[Attempt ${attempt}] Verifying result...`);

					// Update status to verifying for UI feedback
					if (jobId)
						await batchStore.updateStatus(jobId, "verifying", {
							attempts: attempt,
						});

					const prompt = MANNEQUIN_TRANSFER_PROMPTS.VERIFICATION;

					// For verification, we need to compare Generated vs Original.
					const result = await generateWithGemini({
						prompt,
						imageUrl: generationResult.url,
					});

					const text = result.text || "";
					const passed = text.includes("PASS");

					return {
						passed,
						feedback: text,
					};
				},
			);

			if (verificationResult.passed) {
				isVerified = true;
				finalResultUrl = generationResult.url;
			} else {
				lastFeedback = verificationResult.feedback;
			}
		}

		// Step 3: Finalize
		if (isVerified) {
			await step.run("save-success", async () => {
				console.log(`Successfully processed image after ${attempt} attempts`);
				if (jobId) {
					await batchStore.updateStatus(jobId, "completed", {
						resultUrl: finalResultUrl,
						attempts: attempt,
					});
				}
			});
			return { status: "success", url: finalResultUrl, attempts: attempt };
		} else {
			await step.run("mark-failed", async () => {
				console.error(`Failed to process image after ${maxAttempts} attempts`);
				if (jobId) {
					await batchStore.updateStatus(jobId, "failed", {
						error: lastFeedback,
						attempts: attempt,
					});
				}
			});
			return { status: "failed", attempts: attempt, reason: lastFeedback };
		}
	},
);
