import platformsData from "@/data/platforms.json";
import snapshotDiffsData from "@/data/snapshot-diffs.json";
import toolsData from "@/data/tools.json";
import updatesData from "@/data/updates.json";
import { filterToolsByCategory, latestIsoDate } from "@/lib/dataset-metrics";
import anthropicOverview from "@/data/stacks/anthropic.json";
import { VENDOR_STACKS, countUpdatesByTool, isCurrentTool, type VendorStackSlug } from "@/lib/stacks";
import type { Platform, SnapshotDiffEvent, Tool, ToolCategory, UpdateEntry, VendorOverview } from "@/lib/types";
import { parseVendorOverview } from "@/lib/vendor-overview";

export const tools = toolsData.tools as Tool[];
export const platforms = platformsData.platforms as Platform[];
const updateIdPattern = /^[A-Za-z0-9._~-]+$/;

export const updates = [...(updatesData.updates as UpdateEntry[])].sort((a, b) =>
  b.date.localeCompare(a.date) || a.toolName.localeCompare(b.toolName),
);

for (const update of updates) {
  if (!updateIdPattern.test(update.id)) {
    throw new Error(`Invalid updates.json id for URL fragment usage: ${update.id}`);
  }
}

function getLatestPlatformReviewedDate() {
  return latestIsoDate(platforms.map((platform) => platform.logoReviewedAt));
}

const latestDataDate = latestIsoDate([
  toolsData.lastUpdated,
  updates[0]?.date,
  getLatestPlatformReviewedDate(),
]);

export const lastUpdated = latestDataDate ?? toolsData.lastUpdated;

export const snapshotDiffEvents = (snapshotDiffsData.events as SnapshotDiffEvent[])
  .slice()
  .sort((a, b) => b.to.localeCompare(a.to) || a.toolName.localeCompare(b.toolName) || a.field.localeCompare(b.field));

export const snapshotDiffsGeneratedAt = snapshotDiffsData.generatedAt ?? null;
export const snapshotCount = snapshotDiffsData.snapshotCount ?? 0;

export function getToolsByCategory(category: ToolCategory) {
  return filterToolsByCategory(tools, category);
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

// Update-feed activity per tool, used to pick recognisable preview tools.
export const updateCountByTool = countUpdatesByTool(updates);

// Rich vendor overviews (data/stacks/<vendor>.json). Parsed with the same
// validator as `npm run check-stack-data`, so a bad file fails the build.
function loadVendorOverview(slug: VendorStackSlug, raw: unknown): VendorOverview {
  const stack = VENDOR_STACKS.find((candidate) => candidate.slug === slug);
  return parseVendorOverview(raw, {
    toolIds: new Set(tools.map((tool) => tool.id)),
    platformIds: new Set(platforms.map((platform) => platform.id)),
    updateIds: new Set(updates.map((update) => update.id)),
    vendorToolIds: tools
      .filter((tool) => tool.vendor !== undefined && stack?.vendorNames.includes(tool.vendor) && isCurrentTool(tool))
      .map((tool) => tool.id),
    today: new Date().toISOString().slice(0, 10),
  });
}

export const vendorOverviews: Partial<Record<VendorStackSlug, VendorOverview>> = {
  anthropic: loadVendorOverview("anthropic", anthropicOverview),
};
