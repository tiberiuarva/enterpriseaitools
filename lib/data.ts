import platformsData from "@/data/platforms.json";
import toolsData from "@/data/tools.json";
import updatesData from "@/data/updates.json";
import type { Platform, Tool, ToolCategory, UpdateEntry } from "@/lib/types";

export const tools = toolsData.tools as Tool[];
export const platforms = platformsData.platforms as Platform[];
export const updates = [...(updatesData.updates as UpdateEntry[])].sort((a, b) =>
  b.date.localeCompare(a.date) || a.toolName.localeCompare(b.toolName),
);
export const lastUpdated = toolsData.lastUpdated;

function isWithinLast30Days(dateString: string) {
  const now = new Date();
  const date = new Date(`${dateString}T00:00:00Z`);
  const diffMs = now.getTime() - date.getTime();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  return diffMs >= 0 && diffMs <= thirtyDaysMs;
}

const latestHighImpactUpdate = updates.find((update) => update.impact === "high" && isWithinLast30Days(update.date));
export const latestUpdate = latestHighImpactUpdate ?? updates[0] ?? null;

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
