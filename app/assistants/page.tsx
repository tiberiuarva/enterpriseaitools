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
        introParagraphs={[
          "Enterprise assistant rollouts usually fail on workflow and control issues before model quality is the blocker. The practical questions are deployment surface, data boundaries, admin controls, auditability, and how much lock-in comes with the assistant experience.",
          "Use this page to separate coding, productivity, and build-your-own assistant options. In regulated organisations, those three buying decisions often land with different owners, risk tolerances, and integration requirements.",
        ]}
        tools={getToolsByCategory("assistants")}
        updates={getUpdatesByCategory("assistants")}
        platforms={getPlatformsForCategory("assistants")}
      />
    </HomeShell>
  );
}
