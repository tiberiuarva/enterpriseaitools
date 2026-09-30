import type { Metadata } from "next";
import { CategoryPage } from "@/components/category-page";
import { HomeShell } from "@/components/home-shell";
import { CATEGORIES } from "@/lib/categories";
import { categoryComparisons } from "@/lib/category-comparisons";
import { categoryDescriptions, getPlatformsForCategory, getToolsByCategory, getUpdatesByCategory, lastUpdated } from "@/lib/data";
import { getComparisonsForToolIds } from "@/lib/comparisons";
import { governanceFaqs } from "@/lib/hub-faqs";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: CATEGORIES.governance.title,
  description: CATEGORIES.governance.metaDescription,
  path: "/governance",
  atomFeedPath: "/updates-governance.xml",
});

export default function GovernancePage() {
  const tools = getToolsByCategory("governance");
  return (
    <HomeShell lastUpdated={lastUpdated} currentPath="/governance">
      <CategoryPage
        category="governance"
        title={CATEGORIES.governance.title}
        description={categoryDescriptions.governance}
        introParagraphs={[
          CATEGORIES.governance.intro,
        ]}
        iconName="shield-check"
        tools={tools}
        updates={getUpdatesByCategory("governance")}
        platforms={getPlatformsForCategory("governance")}
        comparison={categoryComparisons.governance}
        enableFiltering
        faqs={governanceFaqs}
        relatedPairs={getComparisonsForToolIds(tools.map((tool) => tool.id))}
      />
    </HomeShell>
  );
}
