import { EventSchemas, Inngest } from "inngest";
import type {
	BrandKnowledgeIngested,
	ProcessFashionItem,
	VisionArchiveRequested,
	VisionCleanupRequested,
	WorkflowRequested,
} from "./events";

type EventMap = {
	"studio.workflow.requested": { data: WorkflowRequested };
	"brand.knowledge.ingested": { data: BrandKnowledgeIngested };
	"studio/process-fashion-item": { data: ProcessFashionItem };
	"vision.archive.requested": { data: VisionArchiveRequested };
	"vision.cleanup.requested": { data: VisionCleanupRequested };
};

export const inngest = new Inngest({
	id: "studio-233",
	schemas: new EventSchemas().fromRecord<EventMap>(),
});
