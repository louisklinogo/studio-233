export class AssetFetchError extends Error {
	constructor(
		message: string,
		public statusCode?: number,
		public url?: string,
	) {
		super(message);
		this.name = "AssetFetchError";
	}
}

export class BlobStorageError extends Error {
	constructor(
		message: string,
		public operation?: string,
	) {
		super(message);
		this.name = "BlobStorageError";
	}
}
