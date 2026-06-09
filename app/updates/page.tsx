import type { Metadata } from "next";
import { JsonLd, buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildDataFeedJsonLd, normalizeJsonLdDate } from "@/components/json-ld";
import { HomeShell } from "@/components/home-shell";
import { RelatedHubs } from "@/components/related-hubs";
import { SnapshotDiffFeed } from "@/components/snapshot-diff-feed";
import { UpdatesFeed } from "@/components/updates-feed";
import { lastUpdated, snapshotCount, snapshotDiffEvents, updates } from "@/lib/data";
import { buildMetadata, siteUrl } from "@/lib/metadata";
import { navItems, withBasePath } from "@/lib/site";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "Weekly updates",
    description:
      "High-impact market intelligence for enterprise AI tooling, with expandable release tracking for lower-signal product changes.",
    path: "/updates",
  }),
  alternates: {
    ...buildMetadata({ path: "/updates" }).alternates,
    types: {
      "application/atom+xml": [{ title: "enterpriseai.tools weekly updates feed", url: `${siteUrl}/updates.xml` }],
    },
  },
};

export default function UpdatesPage() {
  const hubLinks = navItems.filter((item) => ["/platforms", "/agents", "/orchestration", "/governance", "/assistants"].includes(item.href));
  const pageUrl = `${siteUrl}/updates/`;
  const atomFeedUrl = `${siteUrl}/updates.xml`;
  const description =
    "High-impact market intelligence for enterprise AI tooling, with expandable release tracking for lower-signal product changes.";
  const highImpactUpdates = updates.filter((update) => update.impact === "high");
  const schemaUpdates = highImpactUpdates;
  const latestRenderedUpdate = updates[0] ?? null;
  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Home", url: `${siteUrl}/` },
      { name: "Weekly updates", url: pageUrl },
    ]),
    buildCollectionPageJsonLd({
      name: "Weekly updates",
      url: pageUrl,
      description,
    }),
    buildDataFeedJsonLd({
      name: "enterpriseai.tools weekly updates feed",
      url: pageUrl,
      description,
      siteUrl,
      dateModified: latestRenderedUpdate ? normalizeJsonLdDate(latestRenderedUpdate.date) : undefined,
      sameAs: [atomFeedUrl],
      items: schemaUpdates.map((update) => ({
        id: `${pageUrl}#${update.id}`,
        url: `${pageUrl}#${update.id}`,
        title: update.title?.trim() ? update.title : update.toolName,
        summary: update.summary,
        datePublished: normalizeJsonLdDate(update.date),
        mainEntityOfPage: pageUrl,
      })),
    }),
  ];

  return (
    <HomeShell lastUpdated={lastUpdated} currentPath="/updates">
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <JsonLd data={jsonLd} />
        <section className="card-flat p-6 md:p-10">
          <h1 className="text-h1 text-[var(--color-text-primary)]">Weekly updates</h1>
          <p className="mt-3 max-w-2xl text-body text-[var(--color-text-secondary)]">
            High-impact market intelligence for enterprise AI tooling, with an expandable full log for routine releases and lower-signal product changes.
          </p>
        </section>

        <section className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Browse the core hubs</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
                Start with the high-impact market view, then jump into the relevant hub pages for side-by-side comparisons and the current tracked dataset.
              </p>
            </div>
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3 text-sm text-[var(--color-text-secondary)] lg:max-w-sm">
              Prefer a machine-readable change feed?{" "}
              <a href={`${siteUrl}/updates.xml`} className="font-medium text-[var(--color-primary)] hover:underline">
                Subscribe to the Atom feed
              </a>
              .
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {hubLinks.map((item) => (
              <a
                key={item.href}
                href={withBasePath(item.href)}
                className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                {item.label}
              </a>
            ))}
          </div>
        </section>

        <div className="mt-6">
          <UpdatesFeed updates={updates} />
        </div>

        <div
          id="auto-detected"
          className="mt-6 scroll-mt-[calc(var(--site-header-height)_+_1rem)]"
        >
          <SnapshotDiffFeed events={snapshotDiffEvents} snapshotCount={snapshotCount} />
        </div>

        <div className="mt-6">
          <RelatedHubs
            currentPath="/updates"
            title="Continue into the tracked hubs"
            intro="Use the high-impact feed as a market scan, then pivot into the relevant comparison hubs or the contribution guide."
            hubs={[
              {
                href: "/platforms",
                title: "Platforms",
                description: "Return to the cloud foundation layer to compare Microsoft Foundry, Amazon Bedrock, and Gemini Enterprise Agent Platform.",
              },
              {
                href: "/agents",
                title: "AI Agent Frameworks",
                description: "Jump into managed agent platforms and open source frameworks after reading agent-related updates.",
              },
              {
                href: "/orchestration",
                title: "AI Orchestration",
                description: "Review workflow engines and automation layers after orchestration-related product changes.",
              },
              {
                href: "/governance",
                title: "AI Governance",
                description: "Inspect guardrails and policy tooling after governance or safety updates land.",
              },
              {
                href: "/assistants",
                title: "AI Assistants",
                description: "Move into coding, productivity, and build-your-own assistant comparisons after assistant-related updates.",
              },
              {
                href: "/about",
                title: "About and contribution rules",
                description: "Review sourcing and contribution rules before proposing additions or corrections.",
              },
            ]}
          />
        </div>
      </main>
    </HomeShell>
  );
}
