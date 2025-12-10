import type {
	PluginExecutionContext,
	ProcessingProgress,
} from "./plugins/types";

export type TrpcClient = {
	removeBackground?: { mutate: (input: any) => Promise<unknown> };
	generateTextToImage?: { mutate: (input: any) => Promise<unknown> };
	isolateObject?: { mutate: (input: any) => Promise<unknown> };
	[key: string]: unknown;
};

/**
 * Creates a real execution context for plugins with TRPC integration
 */
export function createPluginExecutionContext(
	workflowId: string,
	stepId: string,
	userId: string,
	projectId: string,
	trpcClient?: TrpcClient,
	onProgress?: (progress: ProcessingProgress) => void,
	onLog?: (message: string, level?: "info" | "warn" | "error") => void,
	signal?: AbortSignal,
): PluginExecutionContext {
	// Base context object
	const baseContext: PluginExecutionContext = {
		workflowId,
		stepId,
		userId,
		projectId,
		onProgress,
		onLog,
		signal,
	};

	// Extended context with helper methods
	const extendedContext = {
		...baseContext,

		// TRPC client reference
		trpc: trpcClient,

		// Helper methods for common operations
		async removeBackground(imageUrl: string, apiKey?: string) {
			try {
				onLog?.(`Starting background removal for image: ${imageUrl}`);

				const mutate = trpcClient?.removeBackground?.mutate;
				if (!mutate || typeof mutate !== "function") {
					throw new Error("removeBackground endpoint is unavailable");
				}

				const result = await mutate({ imageUrl, apiKey });

				onLog?.(`Background removal completed successfully`);
				return result;
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "Background removal failed";
				onLog?.(errorMessage, "error");
				throw error;
			}
		},

		async generateTextToImage(
			prompt: string,
			options?: {
				modelId?: string;
				loraUrl?: string;
				seed?: number;
				imageSize?: string;
				apiKey?: string;
			},
		) {
			try {
				onLog?.(`Starting text-to-image generation: ${prompt}`);

				const mutate = trpcClient?.generateTextToImage?.mutate;
				if (!mutate || typeof mutate !== "function") {
					throw new Error("text-to-image endpoint is unavailable");
				}

				const result = await mutate({ prompt, ...options });

				onLog?.(`Text-to-image generation completed successfully`);
				return result;
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: "Text-to-image generation failed";
				onLog?.(errorMessage, "error");
				throw error;
			}
		},

		async isolateObject(imageUrl: string, textInput: string, apiKey?: string) {
			try {
				onLog?.(`Starting object isolation: ${textInput}`);

				const mutate = trpcClient?.isolateObject?.mutate;
				if (!mutate || typeof mutate !== "function") {
					throw new Error("isolateObject endpoint is unavailable");
				}

				const result = await mutate({ imageUrl, textInput, apiKey });

				onLog?.(`Object isolation completed successfully`);
				return result;
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "Object isolation failed";
				onLog?.(errorMessage, "error");
				throw error;
			}
		},

		// File upload helper
		async uploadFile(file: File): Promise<string> {
			try {
				onLog?.(`Uploading file: ${file.name}`);

				// Create form data
				const formData = new FormData();
				formData.append("file", file);

				// Upload to the existing upload endpoint
				const response = await fetch("/api/upload", {
					method: "POST",
					body: formData,
				});

				if (!response.ok) {
					throw new Error(`Upload failed: ${response.statusText}`);
				}

				const result = await response.json();
				const url = result.url || result.fileUrl;

				if (!url) {
					throw new Error("No URL returned from upload");
				}

				onLog?.(`File uploaded successfully: ${url}`);
				return url;
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "File upload failed";
				onLog?.(errorMessage, "error");
				throw error;
			}
		},

		// Progress tracking helpers
		updateProgress(progress: number, status: string, currentFile?: string) {
			onProgress?.({
				progress: Math.max(0, Math.min(100, progress)),
				status,
				currentFile,
				completedFiles: 0, // Will be updated by the calling plugin
				totalFiles: 0, // Will be updated by the calling plugin
			});
		},

		// Logging helpers
		logInfo(message: string) {
			onLog?.(message, "info");
		},

		logWarning(message: string) {
			onLog?.(message, "warn");
		},

		logError(message: string) {
			onLog?.(message, "error");
		},

		// Cancellation check
		checkCancellation() {
			if (signal?.aborted) {
				throw new Error("Operation was cancelled");
			}
		},
	};

	return extendedContext;
}

/**
 * Extended execution context interface with helper methods
 */
export interface ExtendedPluginExecutionContext extends PluginExecutionContext {
	trpc?: TrpcClient;
	removeBackground: (imageUrl: string, apiKey?: string) => Promise<any>;
	generateTextToImage: (prompt: string, options?: any) => Promise<any>;
	isolateObject: (
		imageUrl: string,
		textInput: string,
		apiKey?: string,
	) => Promise<any>;
	uploadFile: (file: File) => Promise<string>;
	updateProgress: (
		progress: number,
		status: string,
		currentFile?: string,
	) => void;
	logInfo: (message: string) => void;
	logWarning: (message: string) => void;
	logError: (message: string) => void;
	checkCancellation: () => void;
}
