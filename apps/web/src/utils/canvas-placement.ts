import type { PlacedImage, PlacedVideo } from "@studio233/canvas";
import type { ViewportState } from "@/hooks/useViewportState";

export const MAX_AUTO_PLACEMENT_DIMENSION = 512;
const DEFAULT_DIMENSION = 512;
const DEFAULT_OFFSET = 48;

export interface PlacementRequest {
	viewport: ViewportState;
	canvasSize: { width: number; height: number };
	existingRects: Array<{ x: number; y: number; width: number; height: number }>;
	requestedWidth?: number;
	requestedHeight?: number;
	lastPlacement?: { x: number; y: number } | null;
	snapToGrid?: boolean;
	gridSize?: number;
}

export interface PlacementResult {
	width: number;
	height: number;
	x: number;
	y: number;
}

export function normalizeDimensions(
	width?: number,
	height?: number,
	maxDimension = MAX_AUTO_PLACEMENT_DIMENSION,
): { width: number; height: number } {
	let normalizedWidth = Number(width) || 0;
	let normalizedHeight = Number(height) || 0;

	if (normalizedWidth <= 0 && normalizedHeight <= 0) {
		return { width: DEFAULT_DIMENSION, height: DEFAULT_DIMENSION };
	}

	if (normalizedWidth <= 0) {
		normalizedWidth = normalizedHeight || DEFAULT_DIMENSION;
	}

	if (normalizedHeight <= 0) {
		normalizedHeight = normalizedWidth || DEFAULT_DIMENSION;
	}

	const maxEdge = Math.max(normalizedWidth, normalizedHeight);
	if (maxEdge > maxDimension) {
		const scale = maxDimension / maxEdge;
		return {
			width: Math.max(1, Math.round(normalizedWidth * scale)),
			height: Math.max(1, Math.round(normalizedHeight * scale)),
		};
	}

	return {
		width: Math.max(1, Math.round(normalizedWidth)),
		height: Math.max(1, Math.round(normalizedHeight)),
	};
}

const placementOffsets = [
	{ x: 0, y: 0 },
	{ x: DEFAULT_OFFSET, y: DEFAULT_OFFSET },
	{ x: -DEFAULT_OFFSET, y: DEFAULT_OFFSET },
	{ x: DEFAULT_OFFSET, y: -DEFAULT_OFFSET },
	{ x: -DEFAULT_OFFSET, y: -DEFAULT_OFFSET },
	{ x: DEFAULT_OFFSET * 2, y: DEFAULT_OFFSET },
	{ x: DEFAULT_OFFSET, y: DEFAULT_OFFSET * 2 },
	{ x: -DEFAULT_OFFSET * 2, y: DEFAULT_OFFSET },
	{ x: DEFAULT_OFFSET, y: -DEFAULT_OFFSET * 2 },
];

function intersects(
	candidate: { x: number; y: number; width: number; height: number },
	rect: { x: number; y: number; width: number; height: number },
): boolean {
	return !(
		candidate.x + candidate.width <= rect.x ||
		candidate.x >= rect.x + rect.width ||
		candidate.y + candidate.height <= rect.y ||
		candidate.y >= rect.y + rect.height
	);
}

function clamp(value: number, min: number, max: number) {
	return Math.max(min, Math.min(max, value));
}

function snap(value: number, gridSize: number) {
	if (gridSize <= 0) return value;
	return Math.round(value / gridSize) * gridSize;
}

export function calculatePlacement({
	viewport,
	canvasSize,
	existingRects,
	requestedWidth,
	requestedHeight,
	lastPlacement,
	snapToGrid,
	gridSize = DEFAULT_OFFSET,
}: PlacementRequest): PlacementResult {
	const { width, height } = normalizeDimensions(
		requestedWidth,
		requestedHeight,
	);

	const scale = viewport.scale || 1;
	const viewportCenterX = (canvasSize.width / 2 - viewport.x) / scale;
	const viewportCenterY = (canvasSize.height / 2 - viewport.y) / scale;

	const basePlacement = lastPlacement
		? {
				x: lastPlacement.x + DEFAULT_OFFSET,
				y: lastPlacement.y + DEFAULT_OFFSET,
			}
		: {
				x: viewportCenterX - width / 2,
				y: viewportCenterY - height / 2,
			};

	let candidate = { x: basePlacement.x, y: basePlacement.y, width, height };

	for (const offset of placementOffsets) {
		const offsetCandidate = {
			x: basePlacement.x + offset.x,
			y: basePlacement.y + offset.y,
			width,
			height,
		};

		const collides = existingRects.some((rect) =>
			intersects(offsetCandidate, rect),
		);

		if (!collides) {
			candidate = offsetCandidate;
			break;
		}
	}

	const maxX = canvasSize.width - width;
	const maxY = canvasSize.height - height;
	let x = clamp(candidate.x, 0, maxX);
	let y = clamp(candidate.y, 0, maxY);

	if (snapToGrid && gridSize > 0) {
		x = clamp(snap(x, gridSize), 0, maxX);
		y = clamp(snap(y, gridSize), 0, maxY);
	}

	return { width, height, x, y };
}

export function collectOccupiedRects(options: {
	images: PlacedImage[];
	videos: PlacedVideo[];
}): Array<{ x: number; y: number; width: number; height: number }> {
	const rects: Array<{ x: number; y: number; width: number; height: number }> =
		[];
	options.images.forEach((image) => {
		rects.push({
			x: image.x,
			y: image.y,
			width: image.width,
			height: image.height,
		});
	});
	options.videos.forEach((video) => {
		rects.push({
			x: video.x,
			y: video.y,
			width: video.width,
			height: video.height,
		});
	});
	return rects;
}
