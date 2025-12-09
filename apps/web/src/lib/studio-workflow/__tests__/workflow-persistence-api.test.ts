// @ts-nocheck
import { describe, expect, test } from "bun:test";
import { assertWorkflowDefinitionApi } from "../use-workflow-persistence";

const noop = () => undefined;

describe("assertWorkflowDefinitionApi", () => {
	test("allows a complete workflowDefinition API", () => {
		expect(() =>
			assertWorkflowDefinitionApi({
				workflowDefinition: {
					create: { mutationOptions: noop },
					update: { mutationOptions: noop },
					delete: { mutationOptions: noop },
					get: { queryOptions: noop },
					list: { queryOptions: noop },
				},
			}),
		).not.toThrow();
	});

	test("throws when required helpers are missing", () => {
		expect(() =>
			assertWorkflowDefinitionApi({
				workflowDefinition: {
					create: {},
					update: {},
					delete: {},
					get: {},
					list: {},
				},
			}),
		).toThrow(/workflowDefinition API is not ready/i);
	});
});
