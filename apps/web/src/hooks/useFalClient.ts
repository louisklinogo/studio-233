import { createFalClient } from "@fal-ai/client";
import React from "react";

// Custom hook for FAL client
export const useFalClient = (apiKey?: string) => {
	return React.useMemo(() => {
		return createFalClient({
			credentials: apiKey ?? undefined,
			proxyUrl: "/api/fal",
		});
	}, [apiKey]);
};
