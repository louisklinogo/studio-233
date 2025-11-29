const unsupported = (method = "canvas") => {
	throw new Error(
		`The optional dependency "${method}" is not available in this environment. Install native prerequisites to enable server-side canvas operations.`,
	);
};

class ImageShim {}
class ImageDataShim {}

module.exports = {
	Canvas: class Canvas {
		constructor() {
			unsupported("Canvas");
		}
	},
	CanvasRenderingContext2D: class CanvasRenderingContext2D {
		constructor() {
			unsupported("CanvasRenderingContext2D");
		}
	},
	Image: ImageShim,
	ImageData: ImageDataShim,
	createCanvas: () => unsupported("createCanvas"),
	createImageData: () => unsupported("createImageData"),
	loadImage: async () => unsupported("loadImage"),
	registerFont: () => unsupported("registerFont"),
};
