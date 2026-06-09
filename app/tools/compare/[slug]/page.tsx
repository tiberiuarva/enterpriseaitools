import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { HomeShell } from "@/components/home-shell";
import { JsonLd, buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildToolListJsonLd } from "@/components/json-ld";
import { RelatedHubs } from "@/components/related-hubs";
import { ToolIdentityBadge } from "@/components/tool-identity-badge";
import { comparisonPairs, getComparisonPair } from "@/lib/comparisons";
import { lastUpdated, tools } from "@/lib/data";
import { buildMetadata, siteUrl } from "@/lib/metadata";
import { withBasePath } from "@/lib/site";
import { formatToolTypeLabel } from "@/lib/tool-type";
import type { GovernanceClaim, GovernanceStatus, Tool } from "@/lib/types";

const STATUS_LABELS: Record<GovernanceStatus, string> = {
  yes: "Yes",
  partial: "Partial",
  no: "No",
  "not-applicable": "N/A",
  unknown: "Unknown",
};

const STATUS_STYLES: Record<GovernanceStatus, string> = {
  yes: "bg-[color:var(--color-success-soft)] text-[color:var(--color-success)]",
  partial: "bg-[color:var(--color-warning-soft)] text-[color:var(--color-warning)]",
  no: "bg-[color:var(--color-danger-soft)] text-[color:var(--color-danger)]",
  "not-applicable": "bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)]",
  unknown: "bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)]",
};

function StatusBadge({ status }: { status: GovernanceStatus }) {
  return (
    <span className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function ClaimCell({ claim, suffix }: { claim: GovernanceClaim; suffix?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <StatusBadge status={claim.status} />
      <p className="text-xs leading-5 text-[var(--color-text-secondary)]">
        {claim.detail}
        {suffix ? <span className="text-[var(--color-text-primary)]"> {suffix}</span> : null}
      </p>
      {claim.sourceUrl ? (
        <a
          href={claim.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] font-medium text-[var(--color-primary)] hover:underline"
        >
          {claim.sourceTitle ?? "Source"}
        </a>
      ) : null}
    </div>
  );
}

type Row = {
  label: string;
  render: (tool: Tool) => React.ReactNode;
};

const rows: Row[] = [
  { label: "Vendor", render: (tool) => tool.vendor ?? "—" },
  { label: "Category", render: (tool) => tool.category },
  { label: "Type", render: (tool) => formatToolTypeLabel(tool.type) },
  { label: "License", render: (tool) => tool.license },
  { label: "Status", render: (tool) => tool.status },
  { label: "Version", render: (tool) => tool.version ?? "—" },
  { label: "Last release", render: (tool) => tool.lastRelease ?? "—" },
  {
    label: "Data residency",
    render: (tool) => <ClaimCell claim={tool.governance.dataResidency} />,
  },
  {
    label: "Deployment",
    render: (tool) => (
      <ClaimCell
        claim={tool.governance.deployment}
        suffix={`(${tool.governance.deployment.models.join(", ")})`}
      />
    ),
  },
  { label: "Audit logging", render: (tool) => <ClaimCell claim={tool.governance.auditLogging} /> },
  { label: "SOC 2", render: (tool) => <ClaimCell claim={tool.governance.soc2} /> },
  { label: "ISO 27001", render: (tool) => <ClaimCell claim={tool.governance.iso27001} /> },
  { label: "ISO 42001", render: (tool) => <ClaimCell claim={tool.governance.iso42001} /> },
  {
    label: "EU AI Act",
    render: (tool) => (
      <ClaimCell claim={tool.governance.euAiAct} suffix={`(role: ${tool.governance.euAiAct.role})`} />
    ),
  },
  {
    label: "License risk",
    render: (tool) => (
      <ClaimCell claim={tool.governance.licenseRisk} suffix={`(${tool.governance.licenseRisk.level})`} />
    ),
  },
  { label: "Reviewed", render: (tool) => tool.governance.reviewedAt },
];

export function generateStaticParams(): { slug: string }[] {
  return comparisonPairs.map((pair) => ({ slug: pair.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const pair = getComparisonPair(slug);
  if (!pair) {
    notFound();
  }
  return buildMetadata({
    title: pair.title,
    description: pair.description,
    path: `/tools/compare/${pair.slug}`,
  });
}

export default async function ComparePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pair = getComparisonPair(slug);
  if (!pair) {
    notFound();
  }

  const pairTools = pair.toolIds.map((id) => tools.find((tool) => tool.id === id));
  if (pairTools.some((tool) => !tool)) {
    notFound();
  }
  const resolvedTools = pairTools as Tool[];

  const pageUrl = `${siteUrl}/tools/compare/${pair.slug}/`;
  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Home", url: `${siteUrl}/` },
      { name: "Tool comparisons", url: `${siteUrl}/tools/compare/` },
      { name: pair.title, url: pageUrl },
    ]),
    buildCollectionPageJsonLd({
      name: pair.title,
      url: pageUrl,
      description: pair.description,
    }),
    buildToolListJsonLd(resolvedTools, pair.title, pair.description, pageUrl),
  ];

  return (
    <HomeShell lastUpdated={lastUpdated} currentPath="/tools/compare">
      <main id="main-content" tabIndex={-1} className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <JsonLd data={jsonLd} />

        <nav className="text-sm text-[var(--color-text-secondary)]">
          <a href={withBasePath("/tools/compare")} className="text-[var(--color-primary)] hover:underline">
            Tool comparisons
          </a>
          <span aria-hidden="true"> / </span>
          <span>{pair.title}</span>
        </nav>

        <section className="card-flat p-6 md:p-10">
          <h1 className="text-h1 text-[var(--color-text-primary)]">
            {pair.title}
          </h1>
          <p className="mt-3 max-w-2xl text-body text-[var(--color-text-secondary)]">{pair.description}</p>
        </section>

        <section className="overflow-x-auto card-flat p-2">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th scope="col" className="sticky left-0 z-10 bg-[var(--color-bg-card)] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                  Dimension
                </th>
                {resolvedTools.map((tool) => (
                  <th key={tool.id} scope="col" className="px-4 py-3 text-left align-top">
                    <div className="flex items-start gap-2">
                      <ToolIdentityBadge label={tool.name} logoUrl={tool.logoUrl} logoKind={tool.logoKind} size="md" className="shrink-0" />
                      <div className="min-w-0">
                        <a href={withBasePath(`/tools/${tool.id}`)} className="block font-semibold text-[var(--color-text-primary)] hover:underline">
                          {tool.name}
                        </a>
                        {tool.vendor ? (
                          <span className="block text-xs text-[var(--color-text-secondary)]">{tool.vendor}</span>
                        ) : null}
                        <a
                          href={tool.docsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] hover:underline"
                        >
                          <ExternalLink size={12} />
                          Docs
                        </a>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-[var(--color-border)]">
                  <th scope="row" className="sticky left-0 z-10 border-t border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3 text-left align-top text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                    {row.label}
                  </th>
                  {resolvedTools.map((tool) => (
                    <td key={`${tool.id}-${row.label}`} className="border-t border-[var(--color-border)] px-4 py-3 align-top text-sm text-[var(--color-text-primary)]">
                      {row.render(tool)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <RelatedHubs
          currentPath="/tools/compare"
          title="More comparisons"
          intro="Pick another curated pairing or drop back into a category hub for the full grid."
          hubs={[
            { href: "/tools/compare", title: "All comparisons", description: "Browse every curated side-by-side." },
            ...resolvedTools.map((tool) => ({
              href: `/tools/${tool.id}`,
              title: tool.name,
              description: `Full source-backed governance posture for ${tool.name}.`,
            })),
          ]}
        />
      </main>
    </HomeShell>
  );
}
