import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink, Globe, Star } from "lucide-react";
import { GovernancePosture } from "@/components/governance-posture";
import { HomeShell } from "@/components/home-shell";
import { JsonLd, buildBreadcrumbJsonLd, buildSoftwareApplicationJsonLd, buildToolArticleJsonLd } from "@/components/json-ld";
import { RelatedHubs } from "@/components/related-hubs";
import { ToolIdentityBadge } from "@/components/tool-identity-badge";
import { WarningBox } from "@/components/warning-box";
import { lastUpdated, tools, updates } from "@/lib/data";
import { buildMetadata, siteUrl } from "@/lib/metadata";
import { withBasePath } from "@/lib/site";
import { formatToolTypeLabel, toolTypeTintStyles } from "@/lib/tool-type";
import type { ToolCategory } from "@/lib/types";

const CHIP_CLASS = "rounded-full border border-[var(--color-border)] px-2.5 py-1";
const CURATOR_NAME = "Tiberiu Arva";

const UPDATE_TYPE_LABELS: Record<string, string> = {
  release: "Release",
  acquisition: "Acquisition",
  deprecation: "Deprecation",
  rename: "Rename",
  funding: "Funding",
  feature: "Feature",
  "model-addition": "Model addition",
};

const CATEGORY_LABELS: Record<ToolCategory, string> = {
  agents: "AI Agent Frameworks",
  orchestration: "AI Orchestration",
  governance: "AI Governance",
  assistants: "AI Assistants",
};

function getTool(id: string) {
  return tools.find((tool) => tool.id === id);
}

export function generateStaticParams(): { id: string }[] {
  return tools.map((tool) => ({ id: tool.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const tool = getTool(id);

  if (!tool) {
    notFound();
  }

  return buildMetadata({
    title: `${tool.name} — governance posture & overview`,
    description: tool.description,
    path: `/tools/${tool.id}`,
  });
}

export default async function ToolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tool = getTool(id);

  if (!tool) {
    notFound();
  }

  const pageUrl = `${siteUrl}/tools/${tool.id}/`;
  const toolHistory = updates.filter((update) => update.toolId === tool.id);
  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Home", url: `${siteUrl}/` },
      { name: CATEGORY_LABELS[tool.category], url: `${siteUrl}/${tool.category}/` },
      { name: tool.name, url: pageUrl },
    ]),
    buildSoftwareApplicationJsonLd(tool, pageUrl),
    buildToolArticleJsonLd({ tool, url: pageUrl, authorName: CURATOR_NAME, reviewedAt: tool.governance.reviewedAt }),
  ];

  return (
    <HomeShell lastUpdated={lastUpdated} currentPath={`/${tool.category}`}>
      <main id="main-content" tabIndex={-1} className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <JsonLd data={jsonLd} />

        <nav className="text-sm text-[var(--color-text-secondary)]">
          <a href={withBasePath(`/${tool.category}`)} className="text-[var(--color-primary)] hover:underline">
            {CATEGORY_LABELS[tool.category]}
          </a>
          <span aria-hidden="true"> / </span>
          <span>{tool.name}</span>
        </nav>

        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <ToolIdentityBadge label={tool.name} logoUrl={tool.logoUrl} logoKind={tool.logoKind} size="md" className="shrink-0" />
              <div className="min-w-0">
                <h1 className="text-[1.75rem] font-extrabold leading-tight text-[var(--color-text-primary)]">{tool.name}</h1>
                {tool.vendor ? <p className="text-sm text-[var(--color-text-secondary)]">{tool.vendor}</p> : null}
              </div>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${toolTypeTintStyles[tool.type]}`}>
              {formatToolTypeLabel(tool.type)}
            </span>
          </div>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">{tool.description}</p>

          <p className="mt-3 text-xs text-[var(--color-text-secondary)]">
            Curated by {CURATOR_NAME} · Last reviewed {tool.governance.reviewedAt}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-secondary)]">
            <span className={CHIP_CLASS}>{tool.license}</span>
            {tool.version ? <span className={CHIP_CLASS}>Version {tool.version}</span> : null}
            {tool.lastRelease ? <span className={CHIP_CLASS}>Released {tool.lastRelease}</span> : null}
            {typeof tool.githubStars === "number" ? (
              <span className={`${CHIP_CLASS} inline-flex items-center gap-1.5`}>
                <Star size={13} />
                {tool.githubStars.toLocaleString()}
              </span>
            ) : null}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href={tool.docsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              <ExternalLink size={14} />
              Docs
            </a>
            {tool.websiteUrl ? (
              <a
                href={tool.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:underline"
              >
                <Globe size={14} />
                Website
              </a>
            ) : null}
            {tool.githubUrl ? (
              <a
                href={tool.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:underline"
              >
                <Star size={14} />
                Repository
              </a>
            ) : null}
          </div>
        </section>

        {tool.strengths.length > 0 ? (
          <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Strengths</h2>
            <ul className="mt-3 space-y-2">
              {tool.strengths.map((strength) => (
                <li key={strength} className="text-sm text-[var(--color-text-secondary)]">
                  {strength}
                </li>
              ))}
            </ul>
            {tool.practitionerNote ? (
              <div className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">Practitioner note</p>
                <p className="mt-1 text-sm text-[var(--color-text-primary)]">{tool.practitionerNote}</p>
              </div>
            ) : null}
          </section>
        ) : null}

        {tool.licenseWarning || tool.statusNote ? (
          <WarningBox>
            <strong>{tool.name}:</strong> {tool.licenseWarning ?? tool.statusNote}
          </WarningBox>
        ) : null}

        <GovernancePosture governance={tool.governance} />

        {toolHistory.length > 0 ? (
          <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Change history</h2>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">Source-backed events for this tool, newest first.</p>
            <ol className="mt-4 flex flex-col gap-3">
              {toolHistory.map((update) => {
                const highImpact = update.impact === "high";
                const flagged = highImpact || update.type === "deprecation" || update.type === "acquisition" || update.type === "rename";
                return (
                  <li key={update.id} className={`border-l-2 pl-4 ${flagged ? "border-[var(--color-warning)]" : "border-[var(--color-primary)]"}`}>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                      <span>{update.date}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold uppercase tracking-wide">{UPDATE_TYPE_LABELS[update.type] ?? update.type}</span>
                      {highImpact ? (
                        <span className="rounded-full bg-[color:rgba(234,179,8,0.15)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--color-warning)]">High impact</span>
                      ) : null}
                    </div>
                    {update.title ? <div className="mt-1 font-semibold text-[var(--color-text-primary)]">{update.title}</div> : null}
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{update.summary}</p>
                    <a href={update.sourceUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex text-xs font-medium text-[var(--color-primary)] hover:underline">
                      {update.sourceTitle ?? "Source"}
                    </a>
                  </li>
                );
              })}
            </ol>
          </section>
        ) : null}

        <RelatedHubs
          currentPath={`/tools/${tool.id}`}
          title="Explore the category"
          intro="Compare this tool against the rest of its category and the cloud platform foundation layer."
          hubs={[
            {
              href: `/${tool.category}`,
              title: CATEGORY_LABELS[tool.category],
              description: "Return to the category grid to compare governance posture across every tracked tool.",
            },
            {
              href: "/platforms",
              title: "Platforms",
              description: "Review Microsoft Foundry, Amazon Bedrock, and Gemini Enterprise Agent Platform as the foundation layer.",
            },
            {
              href: "/updates",
              title: "Weekly updates",
              description: "Track releases, deprecations, license changes, and other market movements.",
            },
          ]}
        />
      </main>
    </HomeShell>
  );
}
