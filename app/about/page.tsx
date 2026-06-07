import type { Metadata } from "next";
import { JsonLd, buildAboutPageJsonLd, buildBreadcrumbJsonLd } from "@/components/json-ld";
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

type SectionLink = {
  id: string;
  label: string;
  summary: string;
};

type InfoCard = {
  title: string;
  body: string;
};

type CredibilityPoint = {
  title: string;
  body: string;
};

const sectionLinks: SectionLink[] = [
  {
    id: "overview",
    label: "Overview",
    summary: "What the site is, who it serves, and why it exists.",
  },
  {
    id: "how-to-use",
    label: "How to use it",
    summary: "A fast path through platforms, category hubs, and source checks.",
  },
  {
    id: "coverage",
    label: "Coverage",
    summary: "What gets tracked, what does not, and how the market is framed.",
  },
  {
    id: "standards",
    label: "Standards",
    summary: "Sourcing, methodology, and evidence rules behind the dataset.",
  },
  {
    id: "contribute",
    label: "Contribute",
    summary: "How to propose fixes or add source-backed records.",
  },
];

const overviewCards: InfoCard[] = [
  {
    title: "What this project is",
    body: "An open source landscape tracker for enterprise AI tooling across cloud vendors, enterprise platforms, and open source alternatives.",
  },
  {
    title: "Editorial lens",
    body: "The site is edited through a regulated-enterprise delivery lens: governance, identity, ownership, sourcing quality, and operational fit matter more than launch marketing.",
  },
  {
    title: "Who it helps",
    body: "Platform architects, engineering leaders, security reviewers, and practitioners comparing tools for actual production use rather than surface-level feature lists.",
  },
];

const whyThisExists: InfoCard[] = [
  {
    title: "Tooling lists are usually too flat",
    body: "Many directories collapse managed platforms, point products, and open source frameworks into one undifferentiated inventory. That hides the operating-model decisions that matter most in enterprise delivery.",
  },
  {
    title: "Enterprise teams need better decision filters",
    body: "The tracker emphasizes identity boundaries, governance posture, deployment ownership, maturity signals, and cloud coupling because those factors drive implementation risk.",
  },
  {
    title: "The goal is decision support",
    body: "The point is to help teams narrow serious options faster without flattening important differences in ownership, maturity, or reviewability.",
  },
];

const editorCredibilityPoints: CredibilityPoint[] = [
  {
    title: "Enterprise delivery lens",
    body: "The editorial framing is anchored in enterprise financial services, where governance, approval paths, and operating constraints shape what is actually deployable.",
  },
  {
    title: "Architecture before marketing",
    body: "Priority goes to control-plane boundaries, ownership, sourcing quality, and production fit rather than launch positioning or surface-level feature checklists.",
  },
  {
    title: "Reviewable change discipline",
    body: "Dataset and copy changes are meant to stay source-backed, versioned, and auditable through pull requests instead of silent opinion drift.",
  },
];

const workflowSteps = [
  "Start with Platforms to understand the cloud control plane and default production path.",
  "Move into the category hubs to compare managed vendor options against open source and commercial alternatives.",
  "Use practitioner notes and updates to judge maturity, operational fit, and recent market movement.",
  "Follow the source links before repeating any claim internally or standardizing a tool.",
];

const trackedAreas: InfoCard[] = [
  {
    title: "Platforms",
    body: "The cloud foundation layers that shape model access, identity, governance, and production defaults.",
  },
  {
    title: "Agents",
    body: "Managed agent services and code-first frameworks used to build autonomous or semi-autonomous systems.",
  },
  {
    title: "Orchestration",
    body: "Workflow engines and automation layers that define execution, approvals, retries, and integration boundaries.",
  },
  {
    title: "Governance",
    body: "Guardrails, safety controls, and policy tooling that influence whether AI systems can pass enterprise review.",
  },
  {
    title: "Assistants",
    body: "Coding copilots, productivity assistants, and build-your-own surfaces used by internal teams and end users.",
  },
];

const marketFrame: InfoCard[] = [
  {
    title: "Foundation first",
    body: "The cloud platform is not just hosting. It often sets identity, model routing, policy surface, procurement path, and the default route into production.",
  },
  {
    title: "Layers above the cloud",
    body: "Agent frameworks, orchestration tools, and assistant products are evaluated as delivery layers that either reinforce or challenge the base platform’s control.",
  },
  {
    title: "Governance boundary",
    body: "Priority goes to signals that matter in real adoption: governance depth, operational ownership, release quality, standards support, and whether the product can survive enterprise scrutiny.",
  },
];

const sourcingStandards = [
  "Every tool entry must link to official documentation or the canonical repository.",
  "Versions, release recency, star counts, and pricing must be verifiable from primary sources on the day they are added.",
  "Licenses are recorded exactly as published, including source-available and dual-license caveats where they materially affect adoption.",
  "Weekly updates require a sourceUrl and should summarize a concrete product, governance, pricing, release, or market event.",
  "If a claim is uncertain, leave it out until it can be verified.",
];

const methodology = [
  "Track the managed cloud foundation first, then compare open source and commercial alternatives in the same category.",
  "Prefer official docs, release notes, pricing pages, vendor blogs, and primary repositories over secondary summaries.",
  "Keep coverage opinionated and bounded: the goal is enterprise-relevant tooling, not exhaustive AI cataloging.",
  "Use practitioner notes to capture deployment fit, trade-offs, and maturity signals without turning them into unsupported feature claims.",
  "Ship changes through reviewable pull requests so data, copy, and structural updates stay auditable.",
];

const qualificationRules = [
  "A tool must be relevant to enterprise AI delivery, governance, orchestration, assistants, or the cloud platform layer that powers them.",
  "There must be enough public evidence to describe the product accurately: official docs, product page, or a maintained repo.",
  "Early or niche tools can be included when they are strategically relevant, but archived or maintenance-state projects should be labeled clearly.",
  "Pure research demos, abandoned experiments, and vague stealth products are out of scope until they have real public product evidence.",
];

const outOfScope = [
  "Not an exhaustive AI company database.",
  "Not a benchmark lab or certification authority.",
  "Not a substitute for checking the underlying source material yourself.",
  "Not a substitute for internal legal, security, or procurement review.",
];

const contributionSteps = [
  "To add or edit a tool: update data/tools.json using the schema in data/SCHEMA.md.",
  "To add a market update: edit data/updates.json and include the source URL plus a factual summary.",
  "To report an error or request a tool: open an issue with the source links that support the correction.",
  "Keep claims precise. If a pricing tier, compliance statement, or support matrix item is ambiguous, call it out explicitly instead of guessing.",
];

function SectionHeading({ eyebrow, title, intro }: { eyebrow: string; title: string; intro: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">{intro}</p>
    </div>
  );
}

export default function AboutPage() {
  const pageUrl = `${siteUrl}/about/`;
  const description =
    "Project background, contribution rules, and sourcing standards for the enterpriseai.tools enterprise AI tracker.";
  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Home", url: `${siteUrl}/` },
      { name: "About enterpriseai.tools", url: pageUrl },
    ]),
    buildAboutPageJsonLd({
      name: "About enterpriseai.tools",
      url: pageUrl,
      description,
      siteUrl,
      about: [
        "enterprise AI tooling market",
        "project sourcing standards",
        "contribution rules",
        "enterprise AI methodology",
      ],
    }),
  ];

  return (
    <HomeShell lastUpdated={lastUpdated} currentPath="/about">
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <JsonLd data={jsonLd} />

        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
            <div className="max-w-4xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
                About the project
              </p>
              <h1 className="mt-2 text-[2rem] font-extrabold text-[var(--color-text-primary)]">About enterpriseai.tools</h1>
              <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                An open source landscape tracker comparing enterprise AI tooling across cloud vendors,
                enterprise platforms, and open source alternatives.
              </p>
              <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
                  Editor
                </p>
                <h2 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">Tiberiu Arva</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                  Edited with a regulated-enterprise delivery lens shaped by enterprise financial-services constraints, governance expectations, and source-backed decision support.
                </p>
                <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                  {editorCredibilityPoints.map((point) => (
                    <li key={point.title} className="list-none rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
                      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{point.title}</h3>
                      <p className="mt-2 text-xs leading-5 text-[var(--color-text-secondary)]">{point.body}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex h-full flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
                Working stance
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--color-text-secondary)]">
                <li>Prefer official docs, release notes, pricing pages, and canonical repositories.</li>
                <li>Keep copy technical and reviewable rather than promotional.</li>
                <li>Do not treat unresolved claims as facts just to make the grid look complete.</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {overviewCards.map((card) => (
              <div key={card.title} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[17rem_minmax(0,1fr)]">
          <aside className="xl:sticky xl:top-[calc(var(--site-header-height)+1.5rem)] xl:self-start">
            <nav aria-label="About page sections" className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
                On this page
              </p>
              <div className="mt-3 space-y-2">
                {sectionLinks.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block rounded-xl border border-transparent px-3 py-2 transition hover:border-[var(--color-border)] hover:bg-[var(--color-bg-surface)]"
                  >
                    <span className="block text-sm font-medium text-[var(--color-text-primary)]">{section.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-[var(--color-text-secondary)]">{section.summary}</span>
                  </a>
                ))}
              </div>
              <p className="mt-4 text-xs leading-5 text-[var(--color-text-secondary)]">
                Short version: this site is meant to be scanned quickly, then verified against source material before any internal decision gets repeated.
              </p>
            </nav>
          </aside>

          <div className="space-y-6">
            <section
              id="overview"
              tabIndex={-1}
              className="scroll-mt-24 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6"
            >
              <SectionHeading
                eyebrow="Overview"
                title="Why this tracker exists"
                intro="The site is designed for readers who need clearer enterprise AI tooling comparisons, not a generic long-form catalog."
              />
              <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
                {whyThisExists.map((card) => (
                  <div key={card.title} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{card.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{card.body}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Editor</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                  The editorial lens prioritizes deployment reality over vendor positioning: governance, identity, sourcing quality, platform trade-offs, and operational fit in regulated environments.
                </p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--color-text-secondary)]">
                  <li>Grounded in enterprise financial services and regulated delivery constraints.</li>
                  <li>Biased toward architecture, ownership, and control-plane trade-offs over launch marketing.</li>
                  <li>Claims are held to evidence standards before they make it into the dataset.</li>
                </ul>
                <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                  Connect on{" "}
                  <a
                    href="https://www.linkedin.com/in/tiberiuarva/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[var(--color-primary)] hover:underline"
                  >
                    LinkedIn
                  </a>
                  .
                </p>
              </div>
            </section>

            <section
              id="how-to-use"
              tabIndex={-1}
              className="scroll-mt-24 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6"
            >
              <SectionHeading
                eyebrow="How to use it"
                title="Read the site in the same order enterprise teams make decisions"
                intro="Start from the foundation layer, then move upward into category tools and current market movement."
              />
              <ol className="mt-5 grid gap-3 list-none pl-0">
                {workflowSteps.map((step, index) => (
                  <li key={step} className="flex gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
                    <span
                      aria-hidden="true"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-card)] text-sm font-semibold text-[var(--color-text-primary)]"
                    >
                      {index + 1}
                    </span>
                    <p className="text-sm leading-6 text-[var(--color-text-secondary)]">{step}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section
              id="coverage"
              tabIndex={-1}
              className="scroll-mt-24 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6"
            >
              <SectionHeading
                eyebrow="Coverage"
                title="What gets tracked and how the market is framed"
                intro="Coverage stays opinionated and bounded so the tracker remains useful for enterprise decisions instead of turning into a catch-all AI directory."
              />
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {trackedAreas.map((card) => (
                  <div key={card.title} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{card.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{card.body}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
                {marketFrame.map((card) => (
                  <div key={card.title} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{card.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{card.body}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">What qualifies for inclusion</h3>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--color-text-secondary)]">
                    {qualificationRules.map((rule) => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">What this site is not</h3>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--color-text-secondary)]">
                    {outOfScope.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section
              id="standards"
              tabIndex={-1}
              className="scroll-mt-24 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6"
            >
              <SectionHeading
                eyebrow="Standards"
                title="The page is only useful if the dataset stays defensible"
                intro="These are the sourcing and methodology rules that keep the tracker reviewable and evidence-backed."
              />
              <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Data sourcing standards</h3>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--color-text-secondary)]">
                    {sourcingStandards.map((rule) => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Methodology</h3>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--color-text-secondary)]">
                    {methodology.map((rule) => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section
              id="contribute"
              tabIndex={-1}
              className="scroll-mt-24 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6"
            >
              <SectionHeading
                eyebrow="Contribute"
                title="Keep fixes small, source-backed, and easy to review"
                intro="Contributions are welcome, but the bar is evidence and auditability rather than broad unsupported edits."
              />
              <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
                  <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--color-text-secondary)]">
                    {contributionSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Project entry points</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    The repo, schema files, and source-linked issues are the right place to propose changes.
                  </p>
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
              </div>
            </section>
          </div>
        </div>

        <section className="mt-6">
          <RelatedHubs
            currentPath="/about"
            title="Start from the main indexed hubs"
            intro="Use the main hub pages to browse the tracked platform/category landscape after reviewing sourcing and contribution rules."
            hubs={[
              {
                href: "/platforms",
                title: "Platforms",
                description: "Compare Microsoft Foundry, Amazon Bedrock, and Gemini Enterprise Agent Platform as the foundation layer.",
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
