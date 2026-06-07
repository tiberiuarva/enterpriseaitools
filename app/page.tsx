import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Bot,
  BriefcaseBusiness,
  CalendarClock,
  GitBranch,
  Landmark,
  Layers3,
  ShieldCheck,
} from "lucide-react";
import { CategoryCard } from "@/components/category-card";
import { HomeShell } from "@/components/home-shell";
import { JsonLd, buildDataCatalogJsonLd, buildWebPageJsonLd } from "@/components/json-ld";
import { PlatformStrip } from "@/components/platform-strip";
import { ProtocolTrackingSection } from "@/components/protocol-tracking-section";
import { StatPill } from "@/components/stat-pill";
import { lastUpdated, latestUpdate, platforms, tools } from "@/lib/data";
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
  ];

  return (
    <HomeShell lastUpdated={lastUpdated} currentPath="/">
      <JsonLd data={jsonLd} />
      <main id="main-content" tabIndex={-1} className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 md:p-8">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-secondary)]">
                Enterprise AI tooling landscape
              </p>
              <h1 className="mt-3 text-[2rem] font-extrabold leading-tight text-[var(--color-text-primary)]">
                Tracking what Azure, AWS, and GCP offer alongside the best open source alternatives.
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
                Updated weekly. Data-dense. No fluff. Compare the foundation platforms first, then move into agent,
                orchestration, governance, and assistant layers.
              </p>
              <p className="mt-3 max-w-3xl text-xs leading-5 text-[var(--color-text-secondary)]">
                Naming moves fast here: use <strong>Microsoft Foundry</strong>, <strong>Amazon Q Developer</strong>, and
                <strong> Gemini Enterprise</strong> as the current product names.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <StatPill icon={Landmark} label="Categories" value={4} />
              <StatPill icon={Bot} label="Tools loaded" value={`${tools.length}+`} highlighted />
              <StatPill icon={CalendarClock} label="Updated" value={lastUpdated} />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-[color:rgba(59,130,246,0.12)] p-3 text-[var(--color-primary)]">
              <Layers3 size={28} />
            </div>
            <div className="max-w-4xl">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Foundation AI platforms</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                These three platforms are the base stack behind much of the rest of the market. Each card below shows the
                cloud foundation, and the category pages then break out what that vendor offers directly versus what teams
                often pair with it from open source or commercial tools.
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

        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
          <div className="max-w-4xl">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">What is changing in the enterprise AI market</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
              Enterprise teams now evaluate the control plane, delivery layer, governance boundary, and standards layer separately. This tracker is structured around those seams rather than one flat catalog.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">1. Foundation clouds are setting the defaults</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                Microsoft, AWS, and Google increasingly define identity, model access, security controls, procurement path, and the first route into production.
              </p>
            </div>
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">2. Delivery layers are competing above the cloud</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                Agent frameworks, orchestration stacks, and assistant surfaces now compete on speed, openness, integration depth, and operational fit.
              </p>
            </div>
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">3. Governance is becoming a hard adoption gate</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                Guardrails matter where they touch approvals, auditability, data handling, model policy, and regulated-enterprise controls rather than demo-only safety claims.
              </p>
            </div>
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">4. Standards support is starting to matter</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                Protocols like MCP, A2A, and OpenAPI are becoming practical signals for ecosystem fit, tool portability, and how easily platforms connect to external agents and services.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-primary)] p-4">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">How to read this tracker</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
              Start with{" "}
              <Link href="/platforms" className="font-semibold text-[var(--color-primary)] underline-offset-2 hover:underline">
                Platforms
              </Link>{" "}
              for the cloud control plane, then use the category hubs to compare vendor offerings against open-source and commercial alternatives.
            </p>
          </div>
        </section>

        <ProtocolTrackingSection compact currentPath="/" />

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {categoryCards.map((category) => (
            <CategoryCard key={category.href} {...category} />
          ))}
        </section>

        {latestUpdate ? (
          <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5">
            <div className="border-l-4 border-[var(--color-primary)] pl-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-secondary)]">
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
                  className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-text-inverse)] transition hover:opacity-90"
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
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </HomeShell>
  );
}
