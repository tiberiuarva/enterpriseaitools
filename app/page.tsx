import type { Metadata } from "next";
import {
  ArrowUpRight,
  Bot,
  BriefcaseBusiness,
  CalendarClock,
  Database,
  GitBranch,
  GitCompare,
  Landmark,
  Layers3,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { CategoryCard } from "@/components/category-card";
import { HomeShell } from "@/components/home-shell";
import { HubFaqs } from "@/components/hub-faqs";
import { JsonLd, buildDataCatalogJsonLd, buildFaqPageJsonLd, buildWebPageJsonLd } from "@/components/json-ld";
import { comparisonPairs } from "@/lib/comparisons";
import { homeFaqs } from "@/lib/hub-faqs";
import { PlatformStrip } from "@/components/platform-strip";
import { ProtocolTrackingSection } from "@/components/protocol-tracking-section";
import { StatPill } from "@/components/stat-pill";
import { categoryDescriptions, lastUpdated, latestUpdate, platforms, tools } from "@/lib/data";
import { filterToolsByCategory } from "@/lib/dataset-metrics";
import { buildMetadata, siteUrl } from "@/lib/metadata";
import { withBasePath } from "@/lib/site";
import type { ToolCategory } from "@/lib/types";

const homepageTitle = "Enterprise AI tools landscape tracker";
const homepageDescription =
  "Track Microsoft Foundry, Amazon Bedrock, Gemini Enterprise Agent Platform, plus leading open source AI tools across agents, orchestration, governance, and assistants.";

export const metadata: Metadata = buildMetadata({
  title: homepageTitle,
  description: homepageDescription,
});

const categoryMeta = {
  agents: {
    href: "/agents",
    icon: Bot,
    name: "AI Agent Frameworks",
    description: "Cloud agent platforms and open source frameworks.",
  },
  orchestration: {
    href: "/orchestration",
    icon: GitBranch,
    name: "AI Orchestration",
    description: "Workflow engines, pipelines, and automation layers.",
  },
  governance: {
    href: "/governance",
    icon: ShieldCheck,
    name: "AI Governance",
    description: "Guardrails, safety controls, and policy tooling.",
  },
  assistants: {
    href: "/assistants",
    icon: BriefcaseBusiness,
    name: "AI Assistants",
    description: "Coding copilots, productivity assistants, and platforms.",
  },
} as const;

function formatUpdateLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function Home() {
  const categoryKeys = Object.keys(categoryMeta) as ToolCategory[];
  const categoryCards = categoryKeys.map((key) => {
    const categoryTools = filterToolsByCategory(tools, key);

    return {
      ...categoryMeta[key],
      count: categoryTools.length,
      previewTools: categoryTools.slice(0, 3).map((tool) => ({
        id: tool.id,
        name: tool.name,
      })),
    };
  });

  const jsonLd = [
    buildWebPageJsonLd({
      name: homepageTitle,
      url: `${siteUrl}/`,
      description: homepageDescription,
      siteUrl,
    }),
    buildDataCatalogJsonLd({
      name: "enterpriseai.tools enterprise AI tooling catalog",
      url: `${siteUrl}/`,
      description: homepageDescription,
      siteUrl,
      datasets: [
        {
          name: "Enterprise AI tools governance dataset (JSON)",
          url: `${siteUrl}/data/tools.json`,
          downloadUrl: `${siteUrl}/data/tools.json`,
          description: "Machine-readable source-backed governance posture for every tracked tool — data residency, deployment, audit logging, SOC 2 / ISO 27001 / ISO 42001, EU AI Act role, license risk.",
        },
        {
          name: "AI platforms dataset (JSON)",
          url: `${siteUrl}/data/platforms.json`,
          downloadUrl: `${siteUrl}/data/platforms.json`,
          description: "Machine-readable dataset of the cloud foundation platforms: Microsoft Foundry, Amazon Bedrock, Gemini Enterprise Agent Platform.",
        },
        {
          name: "AI platforms comparison",
          url: `${siteUrl}/platforms/`,
          description: "Structured comparison of Microsoft Foundry, Amazon Bedrock, and Gemini Enterprise Agent Platform foundations.",
        },
        {
          name: "AI agent tools catalog",
          url: `${siteUrl}/agents/`,
          description: "Tracked agent platforms and open source frameworks for enterprise AI delivery.",
        },
        {
          name: "AI orchestration tools catalog",
          url: `${siteUrl}/orchestration/`,
          description: "Tracked workflow engines, automation layers, and orchestration tooling for enterprise AI systems.",
        },
        {
          name: "AI governance tools catalog",
          url: `${siteUrl}/governance/`,
          description: "Tracked guardrails, safety controls, and governance tooling for enterprise AI systems.",
        },
        {
          name: "AI assistants catalog",
          url: `${siteUrl}/assistants/`,
          description: "Tracked coding assistants, productivity copilots, and assistant platforms for enterprise use.",
        },
        {
          name: "Enterprise AI tooling updates feed",
          url: `${siteUrl}/updates.xml`,
          description: "Atom feed of high-impact enterprise AI tooling updates and market intelligence.",
        },
      ],
    }),
    buildFaqPageJsonLd(homeFaqs),
  ];

  return (
    <HomeShell lastUpdated={lastUpdated} currentPath="/">
      <JsonLd data={jsonLd} />
      <main id="main-content" tabIndex={-1} className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <section className="card-flat p-6 md:p-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-12">
            <div className="max-w-2xl">
              <p className="text-caption uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">
                Enterprise AI tooling landscape
              </p>
              <h1 className="mt-3 text-display text-[var(--color-text-primary)]">
                Tracking what Azure, AWS, and GCP offer alongside the best open source alternatives.
              </h1>
              <p className="mt-4 text-body text-[var(--color-text-secondary)]">
                Updated weekly. Compare the cloud foundations, then the agent, orchestration, governance, and assistant layers.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 md:shrink-0 md:flex-col md:items-stretch md:gap-2">
              <StatPill icon={Landmark} label="Categories" value={Object.keys(categoryDescriptions).length} />
              <StatPill icon={Bot} label="Tools tracked" value={tools.length} highlighted />
              <StatPill icon={CalendarClock} label="Updated" value={lastUpdated} />
            </div>
          </div>
        </section>

        <section className="card-flat p-6">
          <div className="flex items-start gap-3">
            <Layers3 size={20} aria-hidden="true" className="mt-1 shrink-0 text-[var(--color-text-secondary)]" />
            <div className="max-w-2xl">
              <h2 className="text-h2 text-[var(--color-text-primary)]">Foundation AI platforms</h2>
              <p className="mt-2 text-body-sm text-[var(--color-text-secondary)]">
                The base stack behind much of the market. Category pages then break out each vendor&apos;s own services versus the open-source and commercial tools teams pair with them.
              </p>
            </div>
          </div>

          <div className="mt-5">
            <PlatformStrip platforms={platforms} />
          </div>

          <div className="mt-5">
            <a
              href={withBasePath("/platforms")}
              className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              Open platform comparison
              <ArrowUpRight size={16} />
            </a>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {categoryCards.map((category) => (
            <CategoryCard key={category.href} {...category} />
          ))}
        </section>

        <section className="card-flat p-6">
          <div className="max-w-4xl">
            <h2 className="text-h2 text-[var(--color-text-primary)]">What is changing in the enterprise AI market</h2>
            <p className="mt-2 text-body-sm text-[var(--color-text-secondary)]">
              Teams now evaluate the control plane, delivery layer, governance boundary, and standards layer separately. This tracker follows those seams.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <h3 className="text-h3 text-[var(--color-text-primary)]">Foundation clouds set the defaults</h3>
              <p className="mt-2 text-body-sm text-[var(--color-text-secondary)]">
                Microsoft, AWS, and Google define identity, model access, and the first route to production.
              </p>
            </div>
            <div>
              <h3 className="text-h3 text-[var(--color-text-primary)]">Delivery layers compete above the cloud</h3>
              <p className="mt-2 text-body-sm text-[var(--color-text-secondary)]">
                Agent, orchestration, and assistant layers compete on openness and integration depth.
              </p>
            </div>
            <div>
              <h3 className="text-h3 text-[var(--color-text-primary)]">Governance is a hard adoption gate</h3>
              <p className="mt-2 text-body-sm text-[var(--color-text-secondary)]">
                Guardrails matter where they touch approvals, auditability, and data handling.
              </p>
            </div>
            <div>
              <h3 className="text-h3 text-[var(--color-text-primary)]">Standards support starts to matter</h3>
              <p className="mt-2 text-body-sm text-[var(--color-text-secondary)]">
                MCP, A2A, and OpenAPI signal ecosystem fit and tool portability.
              </p>
            </div>
          </div>
        </section>

        <ProtocolTrackingSection compact currentPath="/" />

        <section
          aria-labelledby="compare-tile-heading"
          className="card-flat p-6"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-3">
              <GitCompare size={20} aria-hidden="true" className="mt-1 shrink-0 text-[var(--color-text-secondary)]" />
              <div className="max-w-2xl">
                <h2 id="compare-tile-heading" className="text-h2 text-[var(--color-text-primary)]">
                  Compare tools side-by-side
                </h2>
                <p className="mt-2 text-body-sm text-[var(--color-text-secondary)]">
                  {comparisonPairs.length} curated head-to-head comparisons across agent platforms, guardrails,
                  and assistants — every governance dimension laid out column-by-column.
                </p>
                <ul className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--color-text-secondary)]">
                  {comparisonPairs.slice(0, 3).map((pair) => (
                    <li
                      key={pair.slug}
                      className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-hover)] px-2.5 py-1"
                    >
                      {pair.title}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <a
              href={withBasePath("/tools/compare")}
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-text-inverse)] transition hover:bg-[var(--color-accent-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-card)]"
            >
              Open comparisons
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
        </section>

        <section aria-labelledby="trust-tiles-heading" className="card-flat p-6">
          <h2 id="trust-tiles-heading" className="text-h2 text-[var(--color-text-primary)]">
            Built to be relied on
          </h2>
          <p className="mt-2 max-w-3xl text-body-sm text-[var(--color-text-secondary)]">
            Every claim links to a primary source, nothing here can be bought, and the whole dataset is yours to take.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {[
              {
                href: "/eu-ai-act",
                icon: Scale,
                title: "EU AI Act tracker",
                body: "Which obligations apply to your role and risk tier, from when — with a deadline calendar you can subscribe to.",
              },
              {
                href: "/data",
                icon: Database,
                title: "Open data & API",
                body: "The full dataset as versioned JSON, Atom feeds, and live README badges. No key, no tracking.",
              },
              {
                href: "/impartiality",
                icon: ShieldCheck,
                title: "Nothing here can be bought",
                body: "No listing fees, no sponsored placement, no paid badges. Corrections are settled by sources, not spend.",
              },
            ].map(({ href, icon: Icon, title, body }) => (
              <a
                key={href}
                href={withBasePath(href)}
                className="card group block p-5 transition hover:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              >
                <div className="flex items-center gap-2">
                  <Icon size={18} aria-hidden="true" className="shrink-0 text-[var(--color-text-secondary)]" />
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)]">
                    {title}
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{body}</p>
              </a>
            ))}
          </div>
        </section>

        {latestUpdate ? (
          <section className="card-flat p-5">
            <div className="border-l-4 border-[var(--color-primary)] pl-4">
              <div className="text-caption uppercase tracking-wide text-[var(--color-text-tertiary)]">
                Latest update · {latestUpdate.date}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-[var(--color-text-secondary)]">
                <span>{formatUpdateLabel(latestUpdate.category)}</span>
                <span aria-hidden="true">•</span>
                <span>{formatUpdateLabel(latestUpdate.type)}</span>
                {latestUpdate.impact ? (
                  <>
                    <span aria-hidden="true">•</span>
                    <span>{formatUpdateLabel(latestUpdate.impact)} impact</span>
                  </>
                ) : null}
              </div>
              <div className="mt-2 text-base font-semibold text-[var(--color-text-primary)]">{latestUpdate.title ?? latestUpdate.toolName}</div>
              <div className="mt-1 text-sm font-medium text-[var(--color-text-secondary)]">{latestUpdate.toolName}</div>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                {latestUpdate.summary}
              </p>
              {latestUpdate.sourceTitle ? (
                <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
                  Source: <span className="font-medium text-[var(--color-text-primary)]">{latestUpdate.sourceTitle}</span>
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-text-inverse)] transition hover:bg-[var(--color-accent-strong)]"
                  href={withBasePath("/updates")}
                >
                  Open updates feed
                </a>
                <a
                  className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:underline"
                  href={latestUpdate.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open source for ${latestUpdate.toolName} in a new tab`}
                >
                  Read source
                  <ArrowUpRight size={16} />
                </a>
                <a
                  className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                  href={`${withBasePath("/updates")}#auto-detected`}
                >
                  See auto-detected changes
                  <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </div>
            </div>
          </section>
        ) : null}

        <HubFaqs faqs={homeFaqs} />
      </main>
    </HomeShell>
  );
}
