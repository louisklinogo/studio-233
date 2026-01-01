import { EventSchemas, Inngest } from "inngest";
import type {
	BrandIntelligenceSync,
	BrandKnowledgeIngested,
	BrandVisionSync,
	ProcessFashionItem,
	VisionArchiveRequested,
	VisionCleanupRequested,
	WorkflowRequested,
} from "./events";

type EventMap = {
	"studio.workflow.requested": { data: WorkflowRequested };
	"brand.knowledge.ingested": { data: BrandKnowledgeIngested };
	"brand.asset.vision_sync": { data: BrandVisionSync };
	"brand.intelligence.sync_requested": { data: BrandIntelligenceSync };
	"studio/process-fashion-item": { data: ProcessFashionItem };
	"vision.archive.requested": { data: VisionArchiveRequested };
	"vision.cleanup.requested": { data: VisionCleanupRequested };
};

export const inngest = new Inngest({
	id: "studio-233",
	schemas: new EventSchemas().fromRecord<EventMap>(),
	// Force dev mode if no signing key is present to prevent accidental cloud syncs
	isDev:
		process.env.NODE_ENV !== "production" || !process.env.INNGEST_SIGNING_KEY,
});
