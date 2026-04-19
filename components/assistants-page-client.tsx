"use client";

import { BriefcaseBusiness } from "lucide-react";
import { useMemo, useState } from "react";
import { JsonLd, buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildToolListJsonLd } from "@/components/json-ld";
import { PlatformCategoryBar } from "@/components/platform-category-bar";
import { RelatedHubs } from "@/components/related-hubs";
import { ToolCard } from "@/components/tool-card";
import { VendorComparisonTable } from "@/components/vendor-comparison-table";
import { WarningBox } from "@/components/warning-box";
import { assistantsComparisons, type AssistantsSubcategory } from "@/lib/assistants-comparisons";
import { siteUrl } from "@/lib/metadata";
import type { Platform, Tool, UpdateEntry } from "@/lib/types";

const subcategoryOrder: AssistantsSubcategory[] = ["coding", "productivity", "build-your-own"];

const subcategoryLabels: Record<AssistantsSubcategory, string> = {
  coding: "Coding",
  productivity: "Productivity",
  "build-your-own": "Build Your Own",
};

type AssistantsPageClientProps = {
  title: string;
  description: string;
  tools: Tool[];
  updates: UpdateEntry[];
  platforms: Platform[];
};

export function AssistantsPageClient({ title, description, tools, updates, platforms }: AssistantsPageClientProps) {
  const [activeTab, setActiveTab] = useState<AssistantsSubcategory>("coding");

  const toolsBySubcategory = useMemo(() => {
    return Object.fromEntries(
      subcategoryOrder.map((subcategory) => [
        subcategory,
        tools.filter((tool) => tool.subcategory === subcategory),
      ]),
    ) as Record<AssistantsSubcategory, Tool[]>;
  }, [tools]);

  const activeTools = toolsBySubcategory[activeTab];
  const vendorTools = activeTools.filter((tool) => tool.type === "vendor");
  const nonVendorTools = activeTools.filter((tool) => tool.type !== "vendor");
  const warnings = activeTools.filter((tool) => tool.licenseWarning || tool.statusNote);
  const comparison = assistantsComparisons[activeTab];

  const pageUrl = `${siteUrl}/assistants/`;
  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Home", url: `${siteUrl}/` },
      { name: title, url: pageUrl },
    ]),
    buildCollectionPageJsonLd({
      name: title,
      url: pageUrl,
      description,
    }),
    buildToolListJsonLd(tools, title, description, pageUrl),
  ];

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <JsonLd data={jsonLd} />
      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-[color:rgba(59,130,246,0.12)] p-3 text-[var(--color-primary)]">
            <BriefcaseBusiness size={28} />
          </div>
          <div>
            <h1 className="text-[2rem] font-extrabold leading-tight text-[var(--color-text-primary)]">{title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">{description}</p>
            <div className="mt-3 text-sm text-[var(--color-text-secondary)]">{tools.length} tools in current dataset</div>
          </div>
        </div>
      </section>

      <PlatformCategoryBar category="assistants" platforms={platforms} />

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
        <div role="tablist" aria-label="Assistant subcategories" className="flex flex-wrap gap-2">
          {subcategoryOrder.map((subcategory) => (
            <button
              key={subcategory}
              type="button"
              role="tab"
              aria-selected={activeTab === subcategory}
              aria-controls={`tabpanel-${subcategory}`}
              id={`tab-${subcategory}`}
              onClick={() => setActiveTab(subcategory)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                activeTab === subcategory
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-text-inverse)]"
                  : "border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              }`}
            >
              {subcategoryLabels[subcategory]}
            </button>
          ))}
        </div>
      </section>

      <section role="tabpanel" id={`tabpanel-${activeTab}`} aria-labelledby={`tab-${activeTab}`} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
        <h2 className="text-lg font-semibold">{comparison.title}</h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Source-backed side-by-side comparison for the cloud vendor offerings in the {subcategoryLabels[activeTab].toLowerCase()} assistants segment.
        </p>
        <div className="mt-5">
          <VendorComparisonTable vendors={comparison.vendors} rows={comparison.rows} />
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {vendorTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
        <h2 className="text-lg font-semibold">
          {activeTab === "coding" ? "Commercial alternatives" : "Additional tools"}
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {nonVendorTools.length > 0
            ? `${nonVendorTools.length} matching tools in this subcategory.`
            : "No additional non-vendor tools are currently tracked in this subcategory."}
        </p>
        {nonVendorTools.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {nonVendorTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : null}
      </section>

      {warnings.length > 0 ? (
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
          <h2 className="text-lg font-semibold">Important notes</h2>
          <div className="mt-4 space-y-3">
            {warnings.map((tool) => (
              <WarningBox key={tool.id}>
                <strong>{tool.name}:</strong> {tool.licenseWarning ?? tool.statusNote}
              </WarningBox>
            ))}
          </div>
        </section>
      ) : null}

      {updates.length > 0 ? (
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
          <h2 className="text-lg font-semibold">Recent updates</h2>
          <div className="mt-4 space-y-4">
            {updates.slice(0, 5).map((update) => (
              <div key={update.id} className="border-l-2 border-[var(--color-primary)] pl-4">
                <div className="text-xs uppercase tracking-wide text-[var(--color-secondary)]">{update.date}</div>
                <div className="mt-1 font-semibold">{update.toolName}</div>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{update.summary}</p>
                <a href={update.sourceUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex text-sm font-medium text-[var(--color-primary)] hover:underline">Source</a>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <RelatedHubs
        currentPath="/assistants"
        title="Explore adjacent hubs"
        intro="Move from assistants into the platform foundation layer, the weekly change log, or the contribution/sourcing guide."
        hubs={[
          {
            href: "/platforms",
            title: "Platforms",
            description: "Compare Microsoft Foundry, AWS Bedrock, and Google Vertex AI as the foundation layer beneath assistant tooling.",
          },
          {
            href: "/updates",
            title: "Weekly updates",
            description: "Review recent releases, renames, and acquisitions affecting coding, productivity, and build-your-own assistants.",
          },
          {
            href: "/about",
            title: "About and contribution rules",
            description: "See the sourcing standards and contribution process before editing the tracked assistants dataset.",
          },
        ]}
      />
    </main>
  );
}
