import { EventSchemas, Inngest } from "inngest";
import type {
	BrandKnowledgeIngested,
	WorkflowRequested,
} from "@/inngest/events";

type EventMap = {
	"studio.workflow.requested": { data: WorkflowRequested };
	"brand.knowledge.ingested": { data: BrandKnowledgeIngested };
};

export const inngest = new Inngest({
	id: "studio-233",
	schemas: new EventSchemas().fromRecord<EventMap>(),
});
