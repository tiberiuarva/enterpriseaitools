import type { Metadata } from "next";
import { AssistantsPageClient } from "@/components/assistants-page-client";
import { buildCategoryHubMetadata } from "@/components/category-hub";
import { HomeShell } from "@/components/home-shell";
import { CATEGORIES, layerForCategory } from "@/lib/categories";
import { getPlatformsForCategory, getToolsByCategory, getUpdatesByCategory, lastUpdated } from "@/lib/data";
import { getComparisonsForToolIds } from "@/lib/comparisons";
import { assistantsFaqs } from "@/lib/hub-faqs";

export const metadata: Metadata = buildCategoryHubMetadata("assistants");

export default function AssistantsPage() {
  const tools = getToolsByCategory("assistants");
  const layer = layerForCategory("assistants");
  return (
    <HomeShell lastUpdated={lastUpdated} currentPath="/assistants">
      <AssistantsPageClient
        title={CATEGORIES.assistants.title}
        description={CATEGORIES.assistants.summary}
        introParagraphs={[CATEGORIES.assistants.intro]}
        tools={tools}
        updates={getUpdatesByCategory("assistants")}
        platforms={getPlatformsForCategory("assistants")}
        faqs={assistantsFaqs}
        relatedPairs={getComparisonsForToolIds(tools.map((tool) => tool.id))}
        layer={{ label: layer.label, href: layer.href }}
      />
    </HomeShell>
  );
}
