/**
 * Workflow File Manager
 * Handles file uploads to Vercel Blob and ZIP downloads
 * Reuses existing /api/upload endpoint and @vercel/blob/client
 */

import type { MediaFile } from "./plugins/types";

export interface UploadProgress {
	fileName: string;
	progress: number;
	status: "pending" | "uploading" | "completed" | "error";
	error?: string;
}

export interface UploadResult {
	success: boolean;
	files: MediaFile[];
	errors: Array<{ fileName: string; error: string }>;
}

/**
 * Upload multiple files to Vercel Blob storage
 */
export async function uploadFiles(
	files: File[],
	onProgress?: (progress: UploadProgress[]) => void,
): Promise<UploadResult> {
	const { upload } = await import("@vercel/blob/client");

	const progressMap = new Map<string, UploadProgress>();
	const uploadedFiles: MediaFile[] = [];
	const errors: Array<{ fileName: string; error: string }> = [];

	// Initialize progress
	files.forEach((file) => {
		progressMap.set(file.name, {
			fileName: file.name,
			progress: 0,
			status: "pending",
		});
	});
	onProgress?.(Array.from(progressMap.values()));

	// Upload files in parallel (batches of 5)
	const BATCH_SIZE = 5;
	for (let i = 0; i < files.length; i += BATCH_SIZE) {
		const batch = files.slice(i, i + BATCH_SIZE);

		await Promise.all(
			batch.map(async (file) => {
				try {
					progressMap.set(file.name, {
						fileName: file.name,
						progress: 10,
						status: "uploading",
					});
					onProgress?.(Array.from(progressMap.values()));

					// Upload to Vercel Blob
					const blob = await upload(file.name, file, {
						access: "public",
						handleUploadUrl: "/api/upload",
					});

					// Create MediaFile from blob result
					const mediaFile = await createMediaFileFromBlob(file, blob.url);
					uploadedFiles.push(mediaFile);

					progressMap.set(file.name, {
						fileName: file.name,
						progress: 100,
						status: "completed",
					});
					onProgress?.(Array.from(progressMap.values()));
				} catch (error) {
					const errorMessage =
						error instanceof Error ? error.message : "Upload failed";
					errors.push({ fileName: file.name, error: errorMessage });

					progressMap.set(file.name, {
						fileName: file.name,
						progress: 0,
						status: "error",
						error: errorMessage,
					});
					onProgress?.(Array.from(progressMap.values()));
				}
			}),
		);
	}

	return {
		success: errors.length === 0,
		files: uploadedFiles,
		errors,
	};
}

/**
 * Create MediaFile object from uploaded blob
 */
async function createMediaFileFromBlob(
	file: File,
	blobUrl: string,
): Promise<MediaFile> {
	const mediaFile: MediaFile = {
		id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
		url: blobUrl,
		name: file.name,
		type: getMediaType(file.type),
		format: getFileFormat(file.name),
		size: file.size,
		metadata: {
			originalName: file.name,
			mimeType: file.type,
			uploadedAt: new Date().toISOString(),
		},
	};

	// Get image dimensions if it's an image
	if (mediaFile.type === "image") {
		try {
			const dimensions = await getImageDimensions(blobUrl);
			mediaFile.width = dimensions.width;
			mediaFile.height = dimensions.height;
		} catch (error) {
			console.warn("Could not get image dimensions:", error);
		}
	}

	return mediaFile;
}

/**
 * Get media type from MIME type
 */
function getMediaType(mimeType: string): "image" | "video" | "audio" {
	if (mimeType.startsWith("image/")) return "image";
	if (mimeType.startsWith("video/")) return "video";
	if (mimeType.startsWith("audio/")) return "audio";
	return "image"; // Default to image
}

/**
 * Get file format from filename
 */
function getFileFormat(fileName: string): string {
	const ext = fileName.split(".").pop()?.toLowerCase() || "";
	return ext;
}

/**
 * Get image dimensions from URL
 */
function getImageDimensions(
	url: string,
): Promise<{ width: number; height: number }> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () =>
			resolve({ width: img.naturalWidth, height: img.naturalHeight });
		img.onerror = () => reject(new Error("Failed to load image"));
		img.src = url;
	});
}

/**
 * Download multiple files as a ZIP archive
 */
export async function downloadFilesAsZip(
	files: MediaFile[],
	zipFileName: string = "workflow-results.zip",
	onProgress?: (progress: number, status: string) => void,
): Promise<void> {
	if (files.length === 0) {
		throw new Error("No files to download");
	}

	onProgress?.(0, "Preparing download...");

	// Import JSZip dynamically
	const JSZip = (await import("jszip")).default;
	const zip = new JSZip();

	// Fetch and add each file to the ZIP
	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		const progress = ((i + 1) / files.length) * 80; // Reserve 20% for ZIP generation
		onProgress?.(progress, `Fetching ${file.name}...`);

		try {
			const response = await fetch(file.url);
			if (!response.ok) {
				throw new Error(`Failed to fetch ${file.name}`);
			}

			const blob = await response.blob();
			zip.file(file.name, blob);
		} catch (error) {
			console.error(`Failed to fetch file ${file.name}:`, error);
			// Continue with other files
		}
	}

	onProgress?.(85, "Creating ZIP archive...");

	// Generate the ZIP file
	const zipBlob = await zip.generateAsync({
		type: "blob",
		compression: "DEFLATE",
		compressionOptions: { level: 6 },
	});

	onProgress?.(95, "Starting download...");

	// Create download link and trigger download
	const url = URL.createObjectURL(zipBlob);
	const a = document.createElement("a");
	a.href = url;
	a.download = zipFileName;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);

	onProgress?.(100, "Download complete!");
}

/**
 * Download a single file
 */
export async function downloadFile(file: MediaFile): Promise<void> {
	try {
		const response = await fetch(file.url);
		if (!response.ok) {
			throw new Error(`Failed to fetch ${file.name}`);
		}

		const blob = await response.blob();
		const url = URL.createObjectURL(blob);

		const a = document.createElement("a");
		a.href = url;
		a.download = file.name;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	} catch (error) {
		console.error(`Failed to download file ${file.name}:`, error);
		throw error;
	}
}

/**
 * Create MediaFile from a URL (for files already uploaded)
 */
export async function createMediaFileFromUrl(
	url: string,
	name?: string,
): Promise<MediaFile> {
	const fileName = name || url.split("/").pop() || "file";
	const format = getFileFormat(fileName);

	// Try to determine type from URL/format
	let type: "image" | "video" | "audio" = "image";
	if (["mp4", "mov", "avi", "webm"].includes(format)) {
		type = "video";
	} else if (["mp3", "wav", "ogg"].includes(format)) {
		type = "audio";
	}

	const mediaFile: MediaFile = {
		id: `url-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
		url,
		name: fileName,
		type,
		format,
		size: 0, // Unknown until fetched
		metadata: {
			sourceUrl: url,
			createdAt: new Date().toISOString(),
		},
	};

	// Get image dimensions if it's an image
	if (type === "image") {
		try {
			const dimensions = await getImageDimensions(url);
			mediaFile.width = dimensions.width;
			mediaFile.height = dimensions.height;
		} catch (error) {
			console.warn("Could not get image dimensions:", error);
		}
	}

	return mediaFile;
}
