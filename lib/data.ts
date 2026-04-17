import platformsData from "@/data/platforms.json";
import toolsData from "@/data/tools.json";
import updatesData from "@/data/updates.json";
import type { Platform, Tool, ToolCategory, UpdateEntry } from "@/lib/types";

export const tools = toolsData.tools as Tool[];
export const platforms = platformsData.platforms as Platform[];
export const updates = [...(updatesData.updates as UpdateEntry[])].sort((a, b) =>
  b.date.localeCompare(a.date) || a.toolName.localeCompare(b.toolName),
);
export const latestUpdate = updates[0] ?? null;
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

export function getPlatformsForCategory(category: ToolCategory) {
  const categoryKey =
    category === "assistants"
      ? ["assistantsCoding", "assistantsProductivity", "assistantsBuildYourOwn"]
      : [category];

  return platforms.filter((platform) =>
    categoryKey.some((key) => key in platform.categoryMapping),
  );
}
