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
