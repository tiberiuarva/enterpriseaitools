import type { Metadata } from "next";
import { AssistantsPageClient } from "@/components/assistants-page-client";
import { HomeShell } from "@/components/home-shell";
import { categoryDescriptions, getPlatformsForCategory, getToolsByCategory, getUpdatesByCategory, lastUpdated } from "@/lib/data";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "AI Assistants",
  description:
    "Compare coding assistants, productivity copilots, and build-your-own assistant platforms across Microsoft, AWS, Google, and independent vendors.",
  path: "/assistants",
});

export default function AssistantsPage() {
  return (
    <HomeShell lastUpdated={lastUpdated} currentPath="/assistants">
      <AssistantsPageClient
        title="AI Assistants"
        description={categoryDescriptions.assistants}
        tools={getToolsByCategory("assistants")}
        updates={getUpdatesByCategory("assistants")}
        platforms={getPlatformsForCategory("assistants")}
      />
    </HomeShell>
  );
}
