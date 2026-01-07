import { EventSchemas, Inngest } from "inngest";
import type {
	BrandIntelligenceSync,
	BrandKnowledgeIngested,
	BrandKnowledgeTextAdded,
	BrandVisionSync,
	ProcessFashionItem,
	VisionArchiveRequested,
	VisionCleanupRequested,
	WorkflowRequested,
} from "./events";

type EventMap = {
	"studio.workflow.requested": { data: WorkflowRequested };
	"brand.knowledge.ingested": { data: BrandKnowledgeIngested };
	"brand.knowledge.text_added": { data: BrandKnowledgeTextAdded };
	"brand.asset.vision_sync": { data: BrandVisionSync };
	"brand.intelligence.sync_requested": { data: BrandIntelligenceSync };
	"studio/process-fashion-item": { data: ProcessFashionItem };
	"vision.archive.requested": { data: VisionArchiveRequested };
	"vision.cleanup.requested": { data: VisionCleanupRequested };
};

export const inngest = new Inngest({
	id: "studio-233",
	schemas: new EventSchemas().fromRecord<EventMap>(),
	eventKey: process.env.INNGEST_EVENT_KEY,
	signingKey: process.env.INNGEST_SIGNING_KEY,
	isDev: process.env.NODE_ENV !== "production",
});
