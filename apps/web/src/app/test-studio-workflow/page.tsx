"use client";

import { StudioOperatorClient } from "@/components/studio-workflow/StudioOperatorClient";

export default function TestStudioWorkflowPage() {
	// Simple wrapper for the new Operations Console
	return <StudioOperatorClient projectId="test-project-123" />;
}
