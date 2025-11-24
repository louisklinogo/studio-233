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
