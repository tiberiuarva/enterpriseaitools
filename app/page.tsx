import type { Metadata } from "next";
import { ArrowUpRight, Bot, CalendarClock, Compass, Database, GitCompare, Layers3, ListChecks, Scale, ShieldCheck } from "lucide-react";
import { HomeShell } from "@/components/home-shell";
import { HubFaqs } from "@/components/hub-faqs";
import { JsonLd, buildDataCatalogJsonLd, buildFaqPageJsonLd, buildWebPageJsonLd } from "@/components/json-ld";
import { StackMap } from "@/components/stack-map";
import { StatPill } from "@/components/stat-pill";
import { CATEGORIES, CATEGORY_ORDER } from "@/lib/categories";
import { comparisonPairs } from "@/lib/comparisons";
import { lastUpdated, platforms, tools, updateCountByTool, updates } from "@/lib/data";
import { homeFaqs } from "@/lib/hub-faqs";
import { JOURNEYS } from "@/lib/journeys";
import { buildMetadata, siteUrl } from "@/lib/metadata";
import { withBasePath } from "@/lib/site";

const homepageTitle = "Enterprise AI tools landscape tracker";
const homepageDescription =
  "Track Microsoft Foundry, Amazon Bedrock, Gemini Enterprise Agent Platform, and the tools to build, control and use AI agents, each claim source-backed.";

export const metadata: Metadata = buildMetadata({
  title: homepageTitle,
  description: homepageDescription,
});

function formatUpdateLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function Home() {
  const recentHighImpact = updates.filter((update) => update.impact === "high").slice(0, 3);

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
        ...CATEGORY_ORDER.map((category) => ({
          name: `${CATEGORIES[category].title} catalog`,
          url: `${siteUrl}/${category}/`,
          description: CATEGORIES[category].summary,
        })),
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
                Enterprise AI stack guide
              </p>
              <h1 className="mt-3 text-display text-[var(--color-text-primary)]">
                Every layer of the enterprise AI stack, compared with sources.
              </h1>
              <p className="mt-4 text-body text-[var(--color-text-secondary)]">
                From the cloud platforms up to the agents your staff use: {tools.length} tools across building, controlling and
                using AI, each claim linked to a primary source. Updated weekly.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 md:shrink-0 md:flex-col md:items-stretch md:gap-2">
              <StatPill icon={Layers3} label="Categories" value={CATEGORY_ORDER.length} />
              <StatPill icon={Bot} label="Tools tracked" value={tools.length} highlighted />
              <StatPill icon={CalendarClock} label="Updated" value={lastUpdated} />
            </div>
          </div>
        </section>

        <section aria-labelledby="stack-map-heading" className="flex flex-col gap-4">
          <div className="max-w-3xl">
            <h2 id="stack-map-heading" className="text-h2 text-[var(--color-text-primary)]">
              The enterprise AI stack
            </h2>
            <p className="mt-2 text-body-sm text-[var(--color-text-secondary)]">
              Teams build agents, control them, and put AI in people&apos;s hands, all on top of a cloud platform. Pick a layer or a
              category to compare the tools in it.
            </p>
          </div>
          <StackMap tools={tools} activity={updateCountByTool} platforms={platforms} headingLevel="h3" />
        </section>

        <section aria-labelledby="start-heading" className="card-flat p-6">
          <div className="flex items-start gap-3">
            <Compass size={20} aria-hidden="true" className="mt-1 shrink-0 text-[var(--color-text-secondary)]" />
            <div className="max-w-3xl">
              <h2 id="start-heading" className="text-h2 text-[var(--color-text-primary)]">
                Start with your question
              </h2>
              <p className="mt-2 text-body-sm text-[var(--color-text-secondary)]">
                Not sure which category you need? Pick the job you are trying to get done.
              </p>
            </div>
          </div>
          <ul className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            {JOURNEYS.map((journey) => (
              <li key={journey.id}>
                <a
                  href={`${withBasePath("/start")}#${journey.id}`}
                  className="card group flex h-full flex-col gap-2 p-5 transition hover:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                >
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)]">
                    {journey.question}
                  </h3>
                  <p className="hidden text-sm leading-6 text-[var(--color-text-secondary)] sm:block">{journey.summary}</p>
                  <span className="mt-auto text-xs text-[var(--color-text-tertiary)]">{journey.steps.length} steps</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {recentHighImpact.length > 0 ? (
          <section aria-labelledby="this-week-heading" className="card-flat p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="this-week-heading" className="text-h2 text-[var(--color-text-primary)]">
                What changed recently
              </h2>
              <a href={withBasePath("/updates")} className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:underline">
                All updates
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </div>
            <ul className="mt-4 flex flex-col gap-4">
              {recentHighImpact.map((update) => (
                <li key={update.id} className="border-l-2 border-[var(--color-primary)] pl-4">
                  <div className="text-caption uppercase tracking-wide text-[var(--color-text-tertiary)]">
                    {update.date} · {formatUpdateLabel(update.type)}
                  </div>
                  <a
                    href={withBasePath(`/tools/${update.toolId}`)}
                    className="mt-1 block font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-primary)]"
                  >
                    {update.toolName}
                  </a>
                  <p className="mt-1 line-clamp-3 text-sm leading-6 text-[var(--color-text-secondary)] sm:line-clamp-none">{update.summary}</p>
                  <a
                    href={update.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open source for ${update.toolName} in a new tab`}
                    className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:underline"
                  >
                    Source
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section aria-labelledby="decide-heading" className="card-flat p-6">
          <h2 id="decide-heading" className="text-h2 text-[var(--color-text-primary)]">
            More ways to decide
          </h2>
          <p className="mt-2 max-w-3xl text-body-sm text-[var(--color-text-secondary)]">
            Every claim links to a primary source, no listing or ranking here can be bought, and the whole dataset is open.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {[
              {
                href: "/tools/compare",
                icon: GitCompare,
                title: "Compare tools side by side",
                body: `${comparisonPairs.length} head-to-head comparisons, every governance dimension column by column.`,
              },
              {
                href: "/evaluate",
                icon: ListChecks,
                title: "Get a shortlist",
                body: "Answer a few questions about your goal and constraints and get a ranked, source-backed shortlist.",
              },
              {
                href: "/eu-ai-act",
                icon: Scale,
                title: "EU AI Act tracker",
                body: "Which obligations apply to your role and risk tier, and from when, with a subscribable deadline calendar.",
              },
              {
                href: "/data",
                icon: Database,
                title: "Open data & API",
                body: "The full dataset as versioned JSON, Atom feeds and README badges. No key, no tracking.",
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
                <p className="mt-2 hidden text-sm leading-6 text-[var(--color-text-secondary)] sm:block">{body}</p>
              </a>
            ))}
          </div>
          <p className="mt-4 text-sm text-[var(--color-text-secondary)]">
            <ShieldCheck size={16} aria-hidden="true" className="mr-1 inline align-[-3px] text-[var(--color-text-secondary)]" />
            <a href={withBasePath("/impartiality")} className="font-medium text-[var(--color-primary)] hover:underline">
              Nothing here can be bought
            </a>
            : no listing fees, sponsored placement or paid badges.
          </p>
        </section>

        <HubFaqs faqs={homeFaqs} />
      </main>
    </HomeShell>
  );
}
