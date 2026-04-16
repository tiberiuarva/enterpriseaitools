import type { Metadata } from "next";
import { CategoryPage } from "@/components/category-page";
import { HomeShell } from "@/components/home-shell";
import { categoryComparisons } from "@/lib/category-comparisons";
import { categoryDescriptions, getPlatformsForCategory, getToolsByCategory, getUpdatesByCategory, lastUpdated } from "@/lib/data";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "AI Orchestration",
  description:
    "Compare Azure Logic Apps, AWS Step Functions, Google Cloud Workflows, and open source orchestration platforms for enterprise AI automation.",
  path: "/orchestration",
});

export default function OrchestrationPage() {
  return (
    <HomeShell lastUpdated={lastUpdated} currentPath="/orchestration">
      <CategoryPage
        category="orchestration"
        title="AI Orchestration"
        description={categoryDescriptions.orchestration}
        iconName="git-branch"
        tools={getToolsByCategory("orchestration")}
        updates={getUpdatesByCategory("orchestration")}
        platforms={getPlatformsForCategory("orchestration")}
        comparison={categoryComparisons.orchestration}
        enableFiltering
      />
    </HomeShell>
  );
}
