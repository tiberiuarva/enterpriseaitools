import type { Metadata } from "next";
import { JsonLd, buildBreadcrumbJsonLd, buildCollectionPageJsonLd } from "@/components/json-ld";
import { HomeShell } from "@/components/home-shell";
import { RelatedHubs } from "@/components/related-hubs";
import { UpdatesFeed } from "@/components/updates-feed";
import { lastUpdated, updates } from "@/lib/data";
import { buildMetadata, siteUrl } from "@/lib/metadata";
import { navItems, withBasePath } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Weekly updates",
  description:
    "Changelog-style updates for enterprise AI tooling, including releases, deprecations, acquisitions, and notable market changes.",
  path: "/updates",
});

export default function UpdatesPage() {
  const hubLinks = navItems.filter((item) => ["/platforms", "/agents", "/orchestration", "/governance", "/assistants"].includes(item.href));
  const pageUrl = `${siteUrl}/updates/`;
  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Home", url: `${siteUrl}/` },
      { name: "Weekly updates", url: pageUrl },
    ]),
    buildCollectionPageJsonLd({
      name: "Weekly updates",
      url: pageUrl,
      description:
        "Changelog-style updates for enterprise AI tooling, including releases, deprecations, acquisitions, and notable market changes.",
    }),
  ];

  return (
    <HomeShell lastUpdated={lastUpdated} currentPath="/updates">
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <JsonLd data={jsonLd} />
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 md:p-8">
          <h1 className="text-[2rem] font-extrabold text-[var(--color-text-primary)]">Weekly updates</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
            Changelog-style feed of releases, acquisitions, and notable changes in enterprise AI tooling.
          </p>
        </section>

        <section className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Browse the core hubs</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
            Use the updates feed as a change log, then jump into the relevant hub pages for side-by-side comparisons and the current tracked dataset.
          </p>
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

        <div className="mt-6">
          <RelatedHubs
            currentPath="/updates"
            title="Continue into the tracked hubs"
            intro="Use the updates feed as a change log, then pivot into the relevant comparison hubs or the contribution guide."
            hubs={[
              {
                href: "/platforms",
                title: "Platforms",
                description: "Return to the cloud foundation layer to compare Microsoft Foundry, AWS Bedrock, and Google Vertex AI.",
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
