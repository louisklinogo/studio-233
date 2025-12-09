import { Inngest } from "inngest";
import type { WorkflowRequested } from "@/inngest/events";

type EventMap = {
	"studio.workflow.requested": WorkflowRequested;
};

export const inngest = new Inngest<EventMap>({ id: "studio-233" });
