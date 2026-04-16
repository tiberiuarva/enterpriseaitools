import type { Metadata } from "next";
import { CategoryPage } from "@/components/category-page";
import { HomeShell } from "@/components/home-shell";
import { categoryDescriptions, getPlatformsForCategory, getToolsByCategory, getUpdatesByCategory, lastUpdated } from "@/lib/data";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "AI Agent Frameworks",
  description:
    "Compare Microsoft Foundry Agent Service, AWS Bedrock Agents, Google Agent Builder, and open source agent frameworks used in enterprise AI stacks.",
  path: "/agents",
});

export default function AgentsPage() {
  return (
    <HomeShell lastUpdated={lastUpdated} currentPath="/agents">
      <CategoryPage
        category="agents"
        title="AI Agent Frameworks"
        description={categoryDescriptions.agents}
        iconName="bot"
        tools={getToolsByCategory("agents")}
        updates={getUpdatesByCategory("agents")}
        platforms={getPlatformsForCategory("agents")}
        enableFiltering
      />
    </HomeShell>
  );
}
