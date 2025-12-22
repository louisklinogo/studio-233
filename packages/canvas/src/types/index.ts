// Canvas element types for Studio+233

export type ElementType = "image" | "video" | "text" | "shape" | "drawing";

export interface BaseElement {
	id: string;
	type: ElementType;
	x: number;
	y: number;
	rotation: number;
	width: number;
	height: number;
	opacity: number;
	isVisible: boolean;
	isLocked: boolean;
	zIndex: number;
}

export interface TextElement extends BaseElement {
	type: "text";
	content: string;
	fontFamily: string;
	fontSize: number;
	fill: string;
	align: "left" | "center" | "right";
	fontStyle?: "normal" | "italic" | "bold" | "bold italic";
	textDecoration?: "none" | "underline" | "line-through";
}

export interface ShapeElement extends BaseElement {
	type: "shape";
	shapeType:
		| "rect"
		| "circle"
		| "triangle"
		| "arrow"
		| "line"
		| "star"
		| "polygon";
	fill: string;
	stroke: string;
	strokeWidth: number;
	cornerRadius?: number;
	// For lines and arrows (Quadratic Bezier: [x1, y1, cx, cy, x2, y2])
	points?: number[];
}

export interface DrawingElement extends BaseElement {
	type: "drawing";
	points: number[]; // flattened [x1, y1, x2, y2, ...]
	stroke: string;
	strokeWidth: number;
	tension?: number;
	lineCap?: "butt" | "round" | "square";
	lineJoin?: "round" | "bevel" | "miter";
}

export type CanvasElement = TextElement | ShapeElement | DrawingElement;

// Placed media types
export interface PlacedImage {
	id: string;
	src: string;
	x: number;
	y: number;
	width: number;
	height: number;
	rotation: number;
	isGenerated?: boolean;
	parentGroupId?: string;
	cropX?: number;
	cropY?: number;
	cropWidth?: number;
	cropHeight?: number;
}

export interface PlacedVideo extends Omit<PlacedImage, "isGenerated"> {
	isVideo: true;
	duration: number;
	currentTime: number;
	isPlaying: boolean;
	volume: number;
	muted: boolean;
	isLooping?: boolean;
	isGenerating?: boolean;
	isLoaded?: boolean;
}

// Canvas state types
export interface HistoryState {
	images: PlacedImage[];
	videos?: PlacedVideo[];
	elements?: CanvasElement[];
	selectedIds: string[];
}

export interface SelectionBox {
	startX: number;
	startY: number;
	endX: number;
	endY: number;
	visible: boolean;
}

// Generation settings
export interface GenerationSettings {
	prompt: string;
	loraUrl: string;
	styleId?: string;
	modelId?: string;
	aspectRatio?:
		| "1:1"
		| "2:3"
		| "3:2"
		| "3:4"
		| "4:3"
		| "4:5"
		| "5:4"
		| "9:16"
		| "16:9"
		| "21:9";
}

export interface VideoGenerationSettings {
	prompt: string;
	duration?: number;
	styleId?: string;
	motion?: string;
	sourceUrl?: string;
	modelId?: string;
	resolution?: "480p" | "720p" | "1080p";
	cameraFixed?: boolean;
	seed?: number;
	isVideoToVideo?: boolean;
	isVideoExtension?: boolean;
	[key: string]: any;
}

export interface ActiveGeneration {
	imageUrl: string;
	prompt: string;
	loraUrl?: string;
}

export interface ActiveVideoGeneration {
	videoUrl?: string;
	imageUrl?: string;
	prompt: string;
	duration?: number;
	motion?: string;
	styleId?: string;
	modelId?: string;
	modelConfig?: any;
	resolution?: "480p" | "720p" | "1080p";
	cameraFixed?: boolean;
	seed?: number;
	sourceImageId?: string;
	sourceVideoId?: string;
	isVideoToVideo?: boolean;
	isVideoExtension?: boolean;
	toastId?: string;
	[key: string]: any;
}
