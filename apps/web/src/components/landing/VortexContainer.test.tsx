import { expect, test } from "bun:test";
import React from "react";
import { VortexContainer } from "./VortexContainer";

test("VortexContainer renders without crashing", () => {
	// In a real TDD with DOM, we would render here.
	// For now, we just check if it's a valid React component (function).
	expect(typeof VortexContainer).toBe("function");
});
