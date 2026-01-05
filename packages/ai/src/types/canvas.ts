export type CanvasCommand =
	| {
			type: "add-image";
			url: string;
			width: number;
			height: number;
			mimeType?: string;
			originalImageId?: string;
			meta?: {
				prompt?: string;
				modelId?: string;
				loraUrl?: string;
				provider?: string;
				toolCallId?: string;
				status?: "pending" | "ready" | "error";
				[key: string]: unknown;
			};
	  }
	| {
			type: "update-image";
			id: string;
			url: string;
			meta?: {
				operation?: string;
				provider?: string;
				[key: string]: unknown;
			};
	  }
	| {
			type: "add-video";
			url: string;
			width: number;
			height: number;
			duration: number;
			mimeType?: string;
			meta?: {
				prompt?: string;
				modelId?: string;
				provider?: string;
				[key: string]: unknown;
			};
	  };
