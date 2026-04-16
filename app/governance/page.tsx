import type { Metadata } from "next";
import { CategoryPage } from "@/components/category-page";
import { HomeShell } from "@/components/home-shell";
import { categoryComparisons } from "@/lib/category-comparisons";
import { categoryDescriptions, getPlatformsForCategory, getToolsByCategory, getUpdatesByCategory, lastUpdated } from "@/lib/data";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "AI Governance",
  description:
    "Compare Azure AI Content Safety, AWS Bedrock Guardrails, Google Model Armor, and third-party guardrails tooling for enterprise AI governance.",
  path: "/governance",
});

export default function GovernancePage() {
  return (
    <HomeShell lastUpdated={lastUpdated} currentPath="/governance">
      <CategoryPage
        category="governance"
        title="AI Governance"
        description={categoryDescriptions.governance}
        iconName="shield-check"
        tools={getToolsByCategory("governance")}
        updates={getUpdatesByCategory("governance")}
        platforms={getPlatformsForCategory("governance")}
        comparison={categoryComparisons.governance}
        enableFiltering
      />
    </HomeShell>
  );
}
