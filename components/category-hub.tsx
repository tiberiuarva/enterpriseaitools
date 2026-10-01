import { CategoryPage } from "@/components/category-page";
import { HomeShell } from "@/components/home-shell";
import { CATEGORIES } from "@/lib/categories";
import { categoryComparisons } from "@/lib/category-comparisons";
import { getComparisonsForToolIds } from "@/lib/comparisons";
import { getPlatformsForCategory, getToolsByCategory, getUpdatesByCategory, lastUpdated, tools as allTools } from "@/lib/data";
import { categoryFaqs } from "@/lib/hub-faqs";
import { buildMetadata } from "@/lib/metadata";
import type { ToolCategory } from "@/lib/types";

// Shared metadata + page body for every category hub. Only /assistants keeps a
// bespoke page, because it renders subcategory tabs in a client component.
export function buildCategoryHubMetadata(category: ToolCategory) {
  const meta = CATEGORIES[category];
  return buildMetadata({
    title: meta.title,
    description: meta.metaDescription,
    path: `/${category}`,
    atomFeedPath: `/updates-${category}.xml`,
  });
}

export function CategoryHub({ category }: { category: ToolCategory }) {
  const meta = CATEGORIES[category];
  const tools = getToolsByCategory(category);
  return (
    <HomeShell lastUpdated={lastUpdated} currentPath={`/${category}`}>
      <CategoryPage
        category={category}
        title={meta.title}
        description={meta.summary}
        introParagraphs={[meta.intro]}
        iconName={meta.iconName}
        tools={tools}
        updates={getUpdatesByCategory(category)}
        platforms={getPlatformsForCategory(category)}
        comparison={categoryComparisons[category]}
        enableFiltering
        faqs={categoryFaqs[category]}
        relatedPairs={getComparisonsForToolIds(tools.map((tool) => tool.id))}
        alsoCoveredBy={allTools.filter((tool) => tool.alsoCovers?.includes(category))}
      />
    </HomeShell>
  );
}
