import type { Metadata } from "next";
import {
  ArrowUpRight,
  Bot,
  BriefcaseBusiness,
  CalendarClock,
  GitBranch,
  Landmark,
  ShieldCheck,
} from "lucide-react";
import { CategoryCard } from "@/components/category-card";
import { HomeShell } from "@/components/home-shell";
import { PlatformStrip } from "@/components/platform-strip";
import { StatPill } from "@/components/stat-pill";
import { WarningBox } from "@/components/warning-box";
import { lastUpdated, latestUpdate, platforms, tools } from "@/lib/data";
import { buildMetadata } from "@/lib/metadata";
import { withBasePath } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Enterprise AI tools landscape tracker",
  description:
    "Track Microsoft Foundry, AWS Bedrock, Google Vertex AI, and the leading open source enterprise AI tools across agents, orchestration, governance, and assistants.",
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
  const categoryCards = Object.entries(categoryMeta).map(([key, meta]) => {
    const categoryTools = tools.filter((tool) => tool.category === key);

    return {
      ...meta,
      count: categoryTools.length,
      previewTools: categoryTools.slice(0, 3).map((tool) => ({
        id: tool.id,
        name: tool.name,
        type: tool.type,
      })),
    };
  });

  return (
    <HomeShell lastUpdated={lastUpdated} currentPath="/">
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
                Updated weekly. Data-dense. No fluff. Start with the three cloud foundation platforms, then drill into the category layers.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <StatPill icon={Landmark} label="Categories" value={4} />
              <StatPill icon={Bot} label="Tools loaded" value={`${tools.length}+`} highlighted />
              <StatPill icon={CalendarClock} label="Updated" value={lastUpdated} />
            </div>
          </div>
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
              <div className="mt-2 text-base font-semibold text-[var(--color-text-primary)]">{latestUpdate.toolName}</div>
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

        <PlatformStrip platforms={platforms} />

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {categoryCards.map((category) => (
            <CategoryCard key={category.href} {...category} />
          ))}
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <WarningBox>
            Platform-level naming changed repeatedly. Always use <strong>Microsoft Foundry</strong>, <strong>Amazon Q Developer</strong>, and <strong>Gemini Enterprise</strong>.
          </WarningBox>
          <WarningBox variant="info" title="Open source">
            This project is open source. Data contributions are welcome via pull request — all entries must include source URLs and verified facts.
          </WarningBox>
        </section>
      </main>
    </HomeShell>
  );
}
