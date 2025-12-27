import { expect, test } from "bun:test";
import React from "react";
import { VortexHeroV2 } from "./VortexHeroV2";

test("VortexHeroV2 is a forwardRef component", () => {
	const isForwardRef =
		(VortexHeroV2 as any).render !== undefined ||
		(VortexHeroV2 as any).$$typeof !== undefined;
	expect(isForwardRef).toBe(true);
});
