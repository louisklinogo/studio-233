import type { NodeTypes } from "@xyflow/react";
import { ActionNode } from "./ActionNode";
import { AddNode } from "./AddNode";
import { OutputNode } from "./OutputNode";
import { TriggerNode } from "./TriggerNode";

export const nodeTypes: NodeTypes = {
	input: TriggerNode,
	default: ActionNode,
	add: AddNode,
	output: OutputNode,
};
