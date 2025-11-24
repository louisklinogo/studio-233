// Studio+ Type Definitions

/**
 * An uploaded asset in the asset library
 */
export interface UploadedAsset {
	id: string;
	blobUrl: string;
	filename: string;
	fileType: string;
	fileSize: number;
	uploadedAt: number;
	status: AssetStatus;
	tags?: string[];
	projectId?: string;
	thumbnailUrl?: string;
}

/**
 * Asset processing status
 */
export type AssetStatus =
	| "uploaded" // Ready for processing
	| "processing" // Job is running
	| "completed" // Processing complete
	| "failed"; // Processing failed

/**
 * Project for organizing assets
 */
export interface Project {
	id: string;
	name: string;
	createdAt: number;
	assetCount: number;
}

/**
 * View mode for asset display
 */
export type ViewMode = "grid" | "list";

/**
 * Current view state of the Studio page
 */
export type ViewState = "staging" | "library";
