export type CanvasCommand =
	| {
			type: "add-image";
			url: string;
			width: number;
			height: number;
			originalImageId?: string;
			meta?: {
				prompt?: string;
				modelId?: string;
				loraUrl?: string;
				provider?: "fal" | "gemini";
			};
	  }
	| {
			type: "update-image";
			id: string;
			url: string;
			meta?: {
				operation?: string;
				provider?: string;
				[key: string]: any;
			};
	  }
	| {
			type: "add-video";
			url: string;
			width: number;
			height: number;
			duration: number;
			meta?: {
				prompt?: string;
				modelId?: string;
				provider?: string;
				[key: string]: any;
			};
	  };
