export type CanvasCommand = {
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
};
