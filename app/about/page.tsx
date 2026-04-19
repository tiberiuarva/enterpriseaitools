import type { Metadata } from "next";
import { JsonLd, buildBreadcrumbJsonLd, buildCollectionPageJsonLd } from "@/components/json-ld";
import { HomeShell } from "@/components/home-shell";
import { RelatedHubs } from "@/components/related-hubs";
import { githubRepoUrl } from "@/lib/site";
import { lastUpdated } from "@/lib/data";
import { buildMetadata, siteUrl } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "About enterpriseai.tools",
  description:
    "Project background, contribution rules, and sourcing standards for the enterpriseai.tools enterprise AI landscape tracker.",
  path: "/about",
});

export default function AboutPage() {
  const pageUrl = `${siteUrl}/about/`;
  const description =
    "Project background, contribution rules, and sourcing standards for the enterpriseai.tools enterprise AI landscape tracker.";
  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Home", url: `${siteUrl}/` },
      { name: "About enterpriseai.tools", url: pageUrl },
    ]),
    buildCollectionPageJsonLd({
      name: "About enterpriseai.tools",
      url: pageUrl,
      description,
    }),
  ];

  return (
    <HomeShell lastUpdated={lastUpdated} currentPath="/about">
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <JsonLd data={jsonLd} />
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 md:p-8">
          <h1 className="text-[2rem] font-extrabold text-[var(--color-text-primary)]">About enterpriseai.tools</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
            An open source landscape tracker comparing enterprise AI tooling across cloud vendors,
            enterprise platforms, and open source alternatives.
          </p>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
            <h2 className="text-lg font-semibold">Project goals</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--color-text-secondary)]">
              <li>Track real enterprise AI tooling with source-backed data.</li>
              <li>Compare cloud vendor offerings (Microsoft Foundry, AWS Bedrock, Google Vertex AI) with open source alternatives.</li>
              <li>Keep weekly updates reviewable and PR-driven.</li>
              <li>Maintain a data-dense, no-marketing-fluff resource for practitioners.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
            <h2 className="text-lg font-semibold">What we track</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--color-text-secondary)]">
              <li><strong>Platforms</strong> &mdash; the three cloud foundation layers.</li>
              <li><strong>Agents</strong> &mdash; managed agent platforms and open source frameworks.</li>
              <li><strong>Orchestration</strong> &mdash; workflow engines and automation platforms.</li>
              <li><strong>Governance</strong> &mdash; guardrails, safety controls, and policy tooling.</li>
              <li><strong>Assistants</strong> &mdash; coding copilots, productivity assistants, and build-your-own platforms.</li>
            </ul>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
            <h2 className="text-lg font-semibold">Data sourcing standards</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--color-text-secondary)]">
              <li>Every tool entry must link to official documentation or repository.</li>
              <li>GitHub star counts and version numbers must be verifiable at time of entry.</li>
              <li>Pricing information must come from official product or docs pages.</li>
              <li>Weekly updates require a <code>sourceUrl</code> &mdash; no exceptions.</li>
              <li>License labels must be exact (MIT, Apache 2.0, Proprietary, etc.).</li>
            </ul>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
            <h2 className="text-lg font-semibold">Contribute</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
              Contributions are welcome via pull request. All data changes must be evidence-backed and include verifiable source URLs.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--color-text-secondary)]">
              <li>To add a tool: edit <code>data/tools.json</code> following the schema in <code>data/SCHEMA.md</code>.</li>
              <li>To add a weekly update: edit <code>data/updates.json</code> with a <code>sourceUrl</code>.</li>
              <li>To report an error: open an issue on GitHub.</li>
            </ul>
            <a
              href={githubRepoUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="View GitHub repository in a new tab"
              className="mt-4 inline-flex text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              View GitHub repository
            </a>
          </div>
        </section>

        <section className="mt-6">
          <RelatedHubs
            currentPath="/about"
            title="Start from the main indexed hubs"
            intro="Use the main hub pages to browse the tracked platform/category landscape after reviewing sourcing and contribution rules."
            hubs={[
              {
                href: "/platforms",
                title: "Platforms",
                description: "Compare Microsoft Foundry, AWS Bedrock, and Google Vertex AI as the foundation layer.",
              },
              {
                href: "/agents",
                title: "AI Agent Frameworks",
                description: "Explore managed cloud agent services and open source agent frameworks.",
              },
              {
                href: "/orchestration",
                title: "AI Orchestration",
                description: "Review workflow engines, pipelines, and automation layers.",
              },
              {
                href: "/governance",
                title: "AI Governance",
                description: "Inspect guardrails, safety controls, and policy tooling.",
              },
              {
                href: "/assistants",
                title: "AI Assistants",
                description: "Browse coding, productivity, and build-your-own assistant comparisons.",
              },
              {
                href: "/updates",
                title: "Weekly updates",
                description: "Track releases, deprecations, acquisitions, and other notable enterprise AI changes.",
              },
            ]}
          />
        </section>
      </main>
    </HomeShell>
  );
}
