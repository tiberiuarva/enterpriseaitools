import type { Metadata } from "next";
import { CategoryPage } from "@/components/category-page";
import { HomeShell } from "@/components/home-shell";
import { categoryComparisons } from "@/lib/category-comparisons";
import { categoryDescriptions, getPlatformsForCategory, getToolsByCategory, getUpdatesByCategory, lastUpdated } from "@/lib/data";
import { getComparisonsForToolIds } from "@/lib/comparisons";
import { orchestrationFaqs } from "@/lib/hub-faqs";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "AI Orchestration",
  description:
    "Compare Azure Logic Apps, AWS Step Functions, Google Cloud Workflows, and open source orchestration platforms for enterprise AI automation.",
  path: "/orchestration",
  atomFeedPath: "/updates-orchestration.xml",
});

export default function OrchestrationPage() {
  const tools = getToolsByCategory("orchestration");
  return (
    <HomeShell lastUpdated={lastUpdated} currentPath="/orchestration">
      <CategoryPage
        category="orchestration"
        title="AI Orchestration"
        description={categoryDescriptions.orchestration}
        introParagraphs={[
          "Compare cloud workflow services with open-source orchestration platforms on deployment options, audit trails, and governance fit — full details on each tool's page.",
        ]}
        iconName="git-branch"
        tools={tools}
        updates={getUpdatesByCategory("orchestration")}
        platforms={getPlatformsForCategory("orchestration")}
        comparison={categoryComparisons.orchestration}
        enableFiltering
        faqs={orchestrationFaqs}
        relatedPairs={getComparisonsForToolIds(tools.map((tool) => tool.id))}
      />
    </HomeShell>
  );
}
