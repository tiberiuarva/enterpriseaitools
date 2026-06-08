import type { Metadata } from "next";
import { AssistantsPageClient } from "@/components/assistants-page-client";
import { HomeShell } from "@/components/home-shell";
import { categoryDescriptions, getPlatformsForCategory, getToolsByCategory, getUpdatesByCategory, lastUpdated } from "@/lib/data";
import { getComparisonsForToolIds } from "@/lib/comparisons";
import { assistantsFaqs } from "@/lib/hub-faqs";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "AI Assistants",
  description:
    "Compare coding assistants, productivity copilots, and build-your-own assistant platforms across Microsoft, AWS, Google, and independent vendors.",
  path: "/assistants",
});

export default function AssistantsPage() {
  const tools = getToolsByCategory("assistants");
  return (
    <HomeShell lastUpdated={lastUpdated} currentPath="/assistants">
      <AssistantsPageClient
        title="AI Assistants"
        description={categoryDescriptions.assistants}
        introParagraphs={[
          "Compare coding, productivity, and build-your-own assistants on deployment surface, admin controls, and certification posture — full details on each tool's page.",
        ]}
        tools={tools}
        updates={getUpdatesByCategory("assistants")}
        platforms={getPlatformsForCategory("assistants")}
        faqs={assistantsFaqs}
        relatedPairs={getComparisonsForToolIds(tools.map((tool) => tool.id))}
      />
    </HomeShell>
  );
}
