import { expect, test } from "bun:test";
import React from "react";
import { VortexHero } from "./VortexHero";

test("VortexHero is a forwardRef component", () => {
	// React components created with forwardRef have a specific $$typeof or render property
	const isForwardRef =
		(VortexHero as any).render !== undefined ||
		(VortexHero as any).$$typeof !== undefined;
	expect(isForwardRef).toBe(true);
});
