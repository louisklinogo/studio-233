import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";

import { processFashionItem } from "@/inngest/functions/process-fashion-item";

export const { GET, POST, PUT } = serve({
	client: inngest,
	functions: [processFashionItem],
});
