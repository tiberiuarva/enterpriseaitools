import comparisonsData from "../data/comparison-slugs.json" with { type: "json" };

// Curated tool-vs-tool comparison pairings. Sourced from
// data/comparison-slugs.json so the SEO sitemap generator and the per-page
// route share the same definitions. Each entry produces a static
// /tools/compare/<slug>/ route.

export type ComparisonPair = {
  slug: string;
  toolIds: string[];
  title: string;
  description: string;
};

export const comparisonPairs: ComparisonPair[] = comparisonsData as ComparisonPair[];

export function getComparisonPair(slug: string): ComparisonPair | undefined {
  return comparisonPairs.find((pair) => pair.slug === slug);
}

/**
 * Curated pairings whose tools all live in the given set of `toolIds`.
 * Used by category hubs to surface only the pairings entirely contained
 * within that category. Caps at `limit` to avoid drowning the page.
 */
export function getComparisonsForToolIds(toolIds: string[], limit = 6): ComparisonPair[] {
  const allowed = new Set(toolIds);
  return comparisonPairs.filter((pair) => pair.toolIds.every((id) => allowed.has(id))).slice(0, limit);
}
