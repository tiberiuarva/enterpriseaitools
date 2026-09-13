import type { Metadata } from "next";
import { HomeShell } from "@/components/home-shell";
import { JsonLd, buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildToolListJsonLd } from "@/components/json-ld";
import { RelatedHubs } from "@/components/related-hubs";
import { ToolIdentityBadge } from "@/components/tool-identity-badge";
import { lastUpdated, tools } from "@/lib/data";
import { buildMetadata, siteUrl } from "@/lib/metadata";
import { withBasePath } from "@/lib/site";
import { formatToolTypeLabel } from "@/lib/tool-type";
import type { ToolCategory } from "@/lib/types";

const PAGE_TITLE = "All tracked enterprise AI tools";
const PAGE_DESCRIPTION =
  "The complete A-Z index of every enterprise AI tool tracked here, grouped by category with vendor, licence, and type — one link to every source-backed record.";

const CATEGORY_LABELS: Record<ToolCategory, string> = {
  agents: "AI Agent Frameworks",
  orchestration: "AI Orchestration",
  governance: "AI Governance",
  assistants: "AI Assistants",
};

const CATEGORY_ORDER: ToolCategory[] = ["agents", "orchestration", "governance", "assistants"];

export const metadata: Metadata = buildMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/tools",
  modifiedTime: lastUpdated,
});

export default function ToolsIndexPage() {
  const pageUrl = `${siteUrl}/tools/`;
  const sortedTools = [...tools].sort((a, b) => a.name.localeCompare(b.name));
  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Home", url: `${siteUrl}/` },
      { name: PAGE_TITLE, url: pageUrl },
    ]),
    buildCollectionPageJsonLd({ name: PAGE_TITLE, url: pageUrl, description: PAGE_DESCRIPTION }),
    buildToolListJsonLd(sortedTools, PAGE_TITLE, PAGE_DESCRIPTION, pageUrl),
  ];

  return (
    <HomeShell lastUpdated={lastUpdated} currentPath="/tools">
      <main id="main-content" tabIndex={-1} className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <JsonLd data={jsonLd} />

        <section className="card-flat p-6 md:p-10">
          <h1 className="text-h1 text-[var(--color-text-primary)]">{PAGE_TITLE}</h1>
          <p className="mt-3 max-w-3xl text-body text-[var(--color-text-secondary)]">{PAGE_DESCRIPTION}</p>
          <p className="mt-4 text-sm text-[var(--color-text-secondary)]">
            {sortedTools.length} tools tracked. Every record carries a primary-source URL on each governance claim; see the{" "}
            <a href={withBasePath("/methodology")} className="font-medium text-[var(--color-primary)] hover:underline">
              methodology
            </a>{" "}
            for how they are verified, or the{" "}
            <a href={withBasePath("/tools/compare")} className="font-medium text-[var(--color-primary)] hover:underline">
              curated comparisons
            </a>{" "}
            for side-by-side views.
          </p>
        </section>

        <nav aria-label="Jump to category" className="card-flat flex flex-wrap gap-2 p-4">
          {CATEGORY_ORDER.map((category) => (
            <a
              key={category}
              href={`#${category}`}
              className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
            >
              {CATEGORY_LABELS[category]}
            </a>
          ))}
        </nav>

        {CATEGORY_ORDER.map((category) => {
          const categoryTools = sortedTools.filter((tool) => tool.category === category);

          if (categoryTools.length === 0) {
            return null;
          }

          return (
            <section key={category} id={category} className="card-flat scroll-mt-24 p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-h2 text-[var(--color-text-primary)]">{CATEGORY_LABELS[category]}</h2>
                <a
                  href={withBasePath(`/${category}`)}
                  className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                >
                  Open the {CATEGORY_LABELS[category]} hub
                </a>
              </div>

              <ul className="mt-4 flex flex-col divide-y divide-[var(--color-border)]">
                {categoryTools.map((tool) => (
                  <li key={tool.id} className="flex items-start gap-3 py-3">
                    <ToolIdentityBadge
                      label={tool.name}
                      logoUrl={tool.logoUrl}
                      logoKind={tool.logoKind}
                      size="sm"
                      className="mt-0.5 shrink-0"
                    />
                    <div className="min-w-0">
                      <a
                        href={withBasePath(`/tools/${tool.id}`)}
                        className="text-sm font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-primary)] hover:underline"
                      >
                        {tool.name}
                      </a>
                      <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                        {[tool.vendor, formatToolTypeLabel(tool.type), tool.license].filter(Boolean).join(" · ")}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">{tool.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        <RelatedHubs
          title="Explore adjacent hubs"
          hubs={[
            {
              href: "/platforms",
              title: "Platforms",
              description:
                "Microsoft Foundry, Amazon Bedrock, and the Gemini Enterprise Agent Platform — the foundation layer these tools sit on.",
            },
            {
              href: "/evaluate",
              title: "Help me evaluate",
              description:
                "Answer a few governance questions and get a ranked shortlist, computed entirely in your browser.",
            },
            {
              href: "/updates",
              title: "Weekly updates",
              description:
                "High-impact market intelligence plus the full release log for every tracked record.",
            },
          ]}
        />
      </main>
    </HomeShell>
  );
}
