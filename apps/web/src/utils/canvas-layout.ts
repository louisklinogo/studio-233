export interface CanvasViewport {
	x: number;
	y: number;
	scale: number;
}

export interface CanvasDimensions {
	width: number;
	height: number;
}

export function centerInViewport(
	viewport: CanvasViewport,
	canvasSize: CanvasDimensions,
	elementWidth: number,
	elementHeight: number,
): { x: number; y: number } {
	const viewportCenterX = (canvasSize.width / 2 - viewport.x) / viewport.scale;
	const viewportCenterY = (canvasSize.height / 2 - viewport.y) / viewport.scale;

	return {
		x: viewportCenterX - elementWidth / 2,
		y: viewportCenterY - elementHeight / 2,
	};
}
