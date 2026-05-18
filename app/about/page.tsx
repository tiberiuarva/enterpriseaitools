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
    "Project background, contribution rules, and sourcing standards for the enterpriseai.tools enterprise AI tracker.",
  path: "/about",
});

export default function AboutPage() {
  const pageUrl = `${siteUrl}/about/`;
  const description =
    "Project background, contribution rules, and sourcing standards for the enterpriseai.tools enterprise AI tracker.";
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
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
            Edited by Tiberiu Arva, an AI architect in enterprise financial services with a regulated-enterprise delivery lens.
          </p>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.9fr)]">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
            <h2 className="text-lg font-semibold">Editor</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
              The editorial lens prioritizes deployment reality over vendor positioning: governance, identity, sourcing quality, platform trade-offs, and operational fit in regulated environments. The intended reader is not looking for a generic AI tools list; they are trying to decide what can survive procurement, security review, and production ownership.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--color-text-secondary)]">
              <li>Grounded in enterprise financial services and regulated delivery constraints.</li>
              <li>Biased toward architecture, ownership, and control-plane trade-offs over launch marketing.</li>
              <li>Claims are held to evidence standards before they make it into the dataset.</li>
            </ul>
            <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
              Connect on <a href="https://www.linkedin.com/in/tiberiuarva/" target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--color-primary)] hover:underline">LinkedIn</a>.
            </p>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
            <h2 className="text-lg font-semibold">Who this is for</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--color-text-secondary)]">
              <li>Platform and AI architects comparing delivery stacks.</li>
              <li>Engineering leaders narrowing enterprise-safe defaults.</li>
              <li>Security, governance, and procurement stakeholders reviewing tooling claims.</li>
              <li>Practitioners comparing tools through delivery trade-offs rather than feature-list marketing.</li>
            </ul>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
          <h2 className="text-lg font-semibold">Why this exists</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Most AI tooling lists are too shallow</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                They usually collapse managed platforms, point products, and open source frameworks into one undifferentiated catalog. That hides the control-plane and operating-model decisions that matter most in enterprise delivery.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Enterprise buyers need better filters</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                This tracker focuses on what changes implementation risk: identity boundaries, governance posture, deployment ownership, maturity signals, and how strongly a tool depends on a specific cloud foundation.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">The goal is decision support, not hype</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                The site is meant to help teams narrow serious options faster without flattening important differences in ownership, maturity, and governance posture.
              </p>
            </div>
          </div>
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
            <h2 className="text-lg font-semibold">How to use the tracker</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-[var(--color-text-secondary)]">
              <li>Start at <strong>Platforms</strong> to understand the cloud control plane and default production path.</li>
              <li>Move into the category hubs to compare managed vendor options against open source and commercial alternatives.</li>
              <li>Use practitioner notes and updates to assess maturity, operational fit, and recent market movement.</li>
              <li>Follow the source links before repeating any claim internally or standardizing a tool.</li>
            </ol>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
          <h2 className="text-lg font-semibold">What we track</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Platforms</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">The three cloud foundation layers that shape model access, identity, and production defaults.</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Agents</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">Managed agent services and code-first frameworks used to build autonomous or semi-autonomous systems.</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Orchestration</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">Workflow engines and automation layers that define execution, approvals, retries, and integration boundaries.</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Governance</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">Guardrails, safety controls, and policy tooling that influence whether AI systems can pass enterprise review.</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Assistants</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">Coding copilots, productivity assistants, and build-your-own surfaces used by internal teams and end users.</p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
            <h2 className="text-lg font-semibold">Data sourcing standards</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--color-text-secondary)]">
              <li>Every tool entry must link to official documentation or the canonical repository.</li>
              <li>Versions, release recency, star counts, and pricing must be verifiable from primary sources on the day they are added.</li>
              <li>Licenses are recorded exactly as published, including source-available and dual-license caveats where they materially affect adoption.</li>
              <li>Weekly updates require a <code>sourceUrl</code> — no exceptions — and should summarize a concrete product, governance, pricing, release, or market event.</li>
              <li>If a claim is uncertain, leave it out until it can be verified.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
            <h2 className="text-lg font-semibold">Methodology</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--color-text-secondary)]">
              <li>Track the managed cloud foundation first, then compare open source and commercial alternatives in the same category.</li>
              <li>Prefer official docs, release notes, pricing pages, vendor blogs, and primary repositories over secondary summaries.</li>
              <li>Keep category coverage opinionated and bounded: the goal is enterprise-relevant tooling, not exhaustive AI cataloging.</li>
              <li>Use practitioner notes to capture deployment fit, trade-offs, and maturity signals without turning them into unsupported feature claims.</li>
              <li>Ship changes through reviewable pull requests so data, copy, and structural updates stay auditable.</li>
            </ul>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
          <h2 className="text-lg font-semibold">What this site is not</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--color-text-secondary)]">
            <li>Not an exhaustive AI company database.</li>
            <li>Not a benchmark lab or certification authority.</li>
            <li>Not a substitute for checking the underlying source material yourself.</li>
            <li>Not a substitute for internal legal, security, or procurement review.</li>
          </ul>
        </section>

        <section className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
          <h2 className="text-lg font-semibold">How we frame the market</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Foundation first</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                The cloud foundation is not just hosting. It usually sets identity, model routing, policy surface, procurement path, and the default path into production.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Layers above the cloud</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                Agent frameworks, orchestration tools, and assistant products are assessed as delivery layers that either reinforce or challenge the control of the base platform.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Governance boundary</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                We prioritize signs that matter in real adoption: governance depth, operational ownership, release quality, standards support, and whether the product can survive enterprise scrutiny.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
            <h2 className="text-lg font-semibold">What qualifies for inclusion</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--color-text-secondary)]">
              <li>A tool must be relevant to enterprise AI delivery, governance, orchestration, assistants, or the cloud platform layer that powers them.</li>
              <li>There must be enough public evidence to describe the product accurately: official docs, product page, or a maintained repo.</li>
              <li>Early or niche tools can be included when they are strategically relevant, but archived or maintenance-state projects should be labeled clearly.</li>
              <li>Pure research demos, abandoned experiments, and vague stealth products are out of scope until they have real public product evidence.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
            <h2 className="text-lg font-semibold">Contribute</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
              Contributions are welcome via pull request. Data changes should stay evidence-backed, narrowly scoped, and easy to review.
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--color-text-secondary)]">
              <li>To add or edit a tool: update <code>data/tools.json</code> using the schema in <code>data/SCHEMA.md</code>.</li>
              <li>To add a market update: edit <code>data/updates.json</code> and include the source URL plus a factual summary.</li>
              <li>To report an error or request a tool: open an issue with the source links that support the correction.</li>
              <li>Keep claims precise. If a pricing tier, compliance statement, or support matrix item is ambiguous, call it out explicitly instead of guessing.</li>
            </ul>
            <a
              href={githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
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
