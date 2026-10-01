import { STACK_LAYERS, type StackLayer } from "./categories.ts";
import type { Tool, ToolCategory } from "./types.ts";

export type VendorStackSlug = "microsoft" | "aws" | "google";

export type VendorStack = {
  slug: VendorStackSlug;
  name: string;
  // Platform record that forms this vendor's foundation layer (data/platforms.json id).
  platformId: string;
  // Exact `vendor` values in data/tools.json that belong to this vendor.
  vendorNames: readonly string[];
};

export const VENDOR_STACKS: readonly VendorStack[] = [
  { slug: "microsoft", name: "Microsoft", platformId: "microsoft-foundry", vendorNames: ["Microsoft", "GitHub/Microsoft"] },
  { slug: "aws", name: "AWS", platformId: "aws-bedrock", vendorNames: ["AWS"] },
  { slug: "google", name: "Google", platformId: "google-vertex-ai", vendorNames: ["Google", "Google Cloud"] },
];

// Products a buyer can still adopt: excludes archived and deprecated records.
export function isCurrentTool(tool: Pick<Tool, "status">): boolean {
  return tool.status === "active" || tool.status === "maintenance";
}

export function getVendorStack(slug: string): VendorStack | undefined {
  return VENDOR_STACKS.find((stack) => stack.slug === slug);
}

export function vendorStackForTool(tool: Pick<Tool, "vendor">): VendorStack | undefined {
  return VENDOR_STACKS.find((stack) => tool.vendor !== undefined && stack.vendorNames.includes(tool.vendor));
}

export type StackCell = { category: ToolCategory; tools: Tool[] };
export type StackRow = { layer: StackLayer; cells: StackCell[] };

// One row per layer, one cell per category: the vendor's tracked tools that
// either sit in that category or list it under `alsoCovers`. Empty cells are
// kept so the page can show where nothing is tracked yet.
export function buildVendorStack(stack: VendorStack, tools: readonly Tool[]): StackRow[] {
  // Retired products would overstate what a buyer can adopt today.
  const own = tools.filter((tool) => tool.vendor !== undefined && stack.vendorNames.includes(tool.vendor) && isCurrentTool(tool));
  return STACK_LAYERS.map((layer) => ({
    layer,
    cells: layer.categories.map((category) => ({
      category,
      tools: own
        .filter((tool) => tool.category === category || tool.alsoCovers?.includes(category))
        .sort((a, b) => Number(b.category === category) - Number(a.category === category) || a.name.localeCompare(b.name)),
    })),
  }));
}

export function countCoveredCategories(rows: readonly StackRow[]): number {
  return rows.reduce((sum, row) => sum + row.cells.filter((cell) => cell.tools.length > 0).length, 0);
}

// Categories where the vendor has nothing tracked, in stack order.
export function vendorStackGaps(rows: readonly StackRow[]): ToolCategory[] {
  return rows.flatMap((row) => row.cells.filter((cell) => cell.tools.length === 0).map((cell) => cell.category));
}

// Each of the vendor's tools once, even when a suite fills several cells.
export function vendorStackTools(rows: readonly StackRow[]): Tool[] {
  const seen = new Map<string, Tool>();
  for (const row of rows) for (const cell of row.cells) for (const tool of cell.tools) seen.set(tool.id, tool);
  return [...seen.values()];
}

// Current tools filed under another category that also cover `category`.
export function toolsAlsoCovering(category: ToolCategory, tools: readonly Tool[]): Tool[] {
  return tools
    .filter((tool) => isCurrentTool(tool) && tool.alsoCovers?.includes(category))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Current suites that cover two or more of a layer's categories besides their own.
export function suitesSpanningLayer(layer: StackLayer, tools: readonly Tool[]): Tool[] {
  return tools
    .filter((tool) => isCurrentTool(tool) && (tool.alsoCovers ?? []).filter((category) => layer.categories.includes(category)).length >= 2)
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Same vendor, other categories: the products a buyer of `tool` most likely pairs it with.
export function pairsWith(tool: Tool, tools: readonly Tool[], limit = 6): Tool[] {
  if (!tool.vendor) return [];
  const stack = vendorStackForTool(tool);
  const sameVendor = (candidate: Tool) =>
    stack ? candidate.vendor !== undefined && stack.vendorNames.includes(candidate.vendor) : candidate.vendor === tool.vendor;
  const order = new Map(STACK_LAYERS.flatMap((layer) => layer.categories).map((category, index) => [category, index]));
  return tools
    .filter((candidate) => candidate.id !== tool.id && candidate.category !== tool.category && sameVendor(candidate))
    .filter(isCurrentTool)
    .sort((a, b) => (order.get(a.category) ?? 0) - (order.get(b.category) ?? 0) || a.name.localeCompare(b.name))
    .slice(0, limit);
}

// A category's most recognisable current tools for preview chips: the most active in
// the update feed first (a proxy for what buyers are watching), then cloud
// vendor products, then open source by stars, then by name.
export function previewTools(
  tools: readonly Tool[],
  category: ToolCategory,
  limit = 3,
  activity: ReadonlyMap<string, number> = new Map(),
): Tool[] {
  const rank = (tool: Tool) => (tool.type === "vendor" ? 0 : tool.type === "opensource" ? 1 : 2);
  return tools
    .filter((tool) => tool.category === category && isCurrentTool(tool))
    .sort(
      (a, b) =>
        (activity.get(b.id) ?? 0) - (activity.get(a.id) ?? 0) ||
        rank(a) - rank(b) ||
        (b.githubStars ?? 0) - (a.githubStars ?? 0) ||
        a.name.localeCompare(b.name),
    )
    .slice(0, limit);
}

export function countUpdatesByTool(updates: readonly { toolId: string }[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const update of updates) counts.set(update.toolId, (counts.get(update.toolId) ?? 0) + 1);
  return counts;
}
