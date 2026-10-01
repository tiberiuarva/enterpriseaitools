import type { ToolCategory } from "./types.ts";

export type SchemaApplicationCategory = "DeveloperApplication" | "BusinessApplication" | "SecurityApplication";

// schema.org applicationCategory for each category's SoftwareApplication JSON-LD.
// Kept apart from lib/categories.ts because components/json-ld.tsx is imported by
// client components, and the full category copy would otherwise ship in their bundles.
export const SCHEMA_APPLICATION_CATEGORY: Readonly<Record<ToolCategory, SchemaApplicationCategory>> = {
  agents: "DeveloperApplication",
  orchestration: "DeveloperApplication",
  gateways: "DeveloperApplication",
  observability: "DeveloperApplication",
  "control-planes": "BusinessApplication",
  "agent-identity": "SecurityApplication",
  governance: "SecurityApplication",
  assistants: "BusinessApplication",
  "always-on-agents": "BusinessApplication",
};
