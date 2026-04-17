import platformsData from "@/data/platforms.json";
import toolsData from "@/data/tools.json";
import updatesData from "@/data/updates.json";
import type { Platform, Tool, ToolCategory, UpdateEntry } from "@/lib/types";

export const tools: Tool[] = toolsData.tools as Tool[];
export const platforms: Platform[] = platformsData.platforms as Platform[];
export const updates: UpdateEntry[] = updatesData.updates as UpdateEntry[];
export const lastUpdated = toolsData.lastUpdated;

export const categoryDescriptions: Record<ToolCategory, string> = {
  agents: "Managed cloud agent platforms and open source agent frameworks.",
  orchestration: "Workflow engines, automation platforms, and orchestration tooling.",
  governance: "Guardrails, content safety, policy, and AI governance controls.",
  assistants: "Coding copilots, productivity assistants, and build-your-own assistant platforms.",
};

export function getToolsByCategory(category: ToolCategory) {
  return tools.filter((tool) => tool.category === category);
}

export function getUpdatesByCategory(category: ToolCategory | "platforms") {
  return updates.filter((update) => update.category === category);
}

// All platforms currently map to all categories, so no filtering needed.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getPlatformsForCategory(_category: ToolCategory) {
  return platforms;
}
