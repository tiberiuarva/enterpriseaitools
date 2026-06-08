import type { Metadata } from "next";
import { CategoryPage } from "@/components/category-page";
import { HomeShell } from "@/components/home-shell";
import { categoryComparisons } from "@/lib/category-comparisons";
import { categoryDescriptions, getPlatformsForCategory, getToolsByCategory, getUpdatesByCategory, lastUpdated } from "@/lib/data";
import { agentsFaqs } from "@/lib/hub-faqs";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "AI Agent Frameworks",
  description:
    "Compare Microsoft Foundry Agent Service, Amazon Bedrock Agents, Google Agent Builder, and open source agent frameworks used in enterprise AI stacks.",
  path: "/agents",
});

export default function AgentsPage() {
  return (
    <HomeShell lastUpdated={lastUpdated} currentPath="/agents">
      <CategoryPage
        category="agents"
        title="AI Agent Frameworks"
        description={categoryDescriptions.agents}
        introParagraphs={[
          "Compare cloud-native agent platforms with open-source frameworks on governance posture, deployment surface, and license risk — full details on each tool's page.",
        ]}
        iconName="bot"
        tools={getToolsByCategory("agents")}
        updates={getUpdatesByCategory("agents")}
        platforms={getPlatformsForCategory("agents")}
        comparison={categoryComparisons.agents}
        enableFiltering
        faqs={agentsFaqs}
      />
    </HomeShell>
  );
}
