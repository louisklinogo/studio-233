import { AGENT_DEFINITIONS } from "../packages/ai/src";

console.log("Agent definitions loaded successfully.");
console.log(
	"Agents:",
	Object.values(AGENT_DEFINITIONS).map((agent) => agent.name),
);
