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
        introParagraphs={[
          "In regulated environments, orchestration becomes the execution boundary for AI systems: where approvals, audit trails, retries, secrets handling, and human checkpoints have to be explicit rather than implied.",
          "Read this page with that lens. Some tools are strong for fast internal automation, while others are better suited to controlled enterprise workflows where reliability, segregation of duties, and integration with existing cloud operations matter more than pure builder speed.",
        ]}
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
