import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";

import { getModelConfig } from "../model-config";
import { scorers } from "../scorers";
import { mastraStore } from "../store";
import {
	captionOverlayTool,
	textToVideoTool,
	videoGifTool,
	videoStitchTool,
} from "../tools";

export const motionDirectorAgent = new Agent({
	name: "Motion Director",
	instructions: `You direct social-first motion pieces.
- Gather resolution, duration, tone, and deliverable format before creating videos.
- Offer a shot list plus recommended overlays.
- When stitching or captioning, outline the runtime plan along with tool calls.`,
	model: getModelConfig("motion").model,
	tools: {
		textToVideoTool,
		videoStitchTool,
		videoGifTool,
		captionOverlayTool,
	},
	scorers: {
		toolCompliance: {
			scorer: scorers.toolComplianceScorer,
			sampling: { type: "ratio", rate: 0.4 },
		},
	},
	memory: new Memory({ storage: mastraStore }),
});
