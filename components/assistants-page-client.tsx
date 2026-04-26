"use client";

import { BriefcaseBusiness } from "lucide-react";
import { useMemo, useState } from "react";
import { FilterBar } from "@/components/filter-bar";
import { JsonLd, buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildToolListJsonLd } from "@/components/json-ld";
import { PlatformCategoryBar } from "@/components/platform-category-bar";
import { RelatedHubs } from "@/components/related-hubs";
import { ToolCard } from "@/components/tool-card";
import { VendorComparisonTable } from "@/components/vendor-comparison-table";
import { WarningBox } from "@/components/warning-box";
import { assistantsComparisons, type AssistantsSubcategory } from "@/lib/assistants-comparisons";
import { siteUrl } from "@/lib/metadata";
import type { CategoryFilterState } from "@/lib/category-filters";
import { filterTools, getAvailableLicenses } from "@/lib/category-filters";
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
  const [typeFilter, setTypeFilter] = useState<CategoryFilterState["type"]>("all");
  const [cloudFilters, setCloudFilters] = useState<string[]>([]);
  const [licenseFilter, setLicenseFilter] = useState("all");
  const [sortBy, setSortBy] = useState<CategoryFilterState["sort"]>("name");

  function resetNarrowingFilters() {
    setCloudFilters([]);
    setLicenseFilter("all");
  }

  const toolsBySubcategory = useMemo(() => {
    return Object.fromEntries(
      subcategoryOrder.map((subcategory) => [
        subcategory,
        tools.filter((tool) => tool.subcategory === subcategory),
      ]),
    ) as Record<AssistantsSubcategory, Tool[]>;
  }, [tools]);

  const activeTools = toolsBySubcategory[activeTab];
  const availableLicenses = useMemo(() => getAvailableLicenses(activeTools), [activeTools]);
  const effectiveTools = useMemo(() => {
    let next = filterTools(activeTools, {
      type: typeFilter,
      cloud: "all",
      license: licenseFilter,
      sort: sortBy,
    });

    if (cloudFilters.length > 0) {
      next = next.filter((tool) => cloudFilters.every((cloud) => tool.clouds?.includes(cloud)));
    }

    return next;
  }, [activeTools, typeFilter, licenseFilter, sortBy, cloudFilters]);

  const vendorTools = effectiveTools.filter((tool) => tool.type === "vendor");
  const nonVendorTools = effectiveTools.filter((tool) => tool.type !== "vendor");
  const warnings = effectiveTools.filter((tool) => tool.licenseWarning || tool.statusNote);
  const comparison = assistantsComparisons[activeTab];
  const hasActiveNarrowingFilter = cloudFilters.length > 0 || licenseFilter !== "all";
  const showVendorCards = (typeFilter === "all" || typeFilter === "vendor") && vendorTools.length > 0;
  const showVendorComparison = !hasActiveNarrowingFilter;
  const visibleUpdates = updates.slice(0, 5);

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

      <section
        className="sticky z-10 rounded-xl border border-[var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-bg-card)_92%,transparent)] backdrop-blur"
        style={{ top: "calc(var(--site-header-height, 4rem) + 0.5rem)" }}
      >
        <div className="border-b border-[var(--color-border)] p-4">
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
        </div>
        <FilterBar
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          cloudFilters={cloudFilters}
          onCloudFiltersChange={setCloudFilters}
          licenseFilter={licenseFilter}
          onLicenseFilterChange={setLicenseFilter}
          sortBy={sortBy}
          onSortByChange={(value) => setSortBy(value as CategoryFilterState["sort"])}
          availableLicenses={availableLicenses}
        />
      </section>

      <section role="tabpanel" id={`tabpanel-${activeTab}`} aria-labelledby={`tab-${activeTab}`} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
        <h2 className="text-lg font-semibold">{comparison.title}</h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {showVendorComparison
            ? `Source-backed side-by-side comparison for the cloud vendor offerings in the ${subcategoryLabels[activeTab].toLowerCase()} assistants segment.`
            : "Vendor tool cards shown below. Clear cloud and license filters to restore the vendor comparison table."}
        </p>
        {showVendorComparison ? (
          <div className="mt-5">
            <VendorComparisonTable vendors={comparison.vendors} rows={comparison.rows} />
          </div>
        ) : null}
        {showVendorCards ? (
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {vendorTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : hasActiveNarrowingFilter ? (
          <div className="mt-5 space-y-3">
            <WarningBox variant="info">
              No vendor assistant tools match the current cloud/license filters in this subcategory.
            </WarningBox>
            <button
              type="button"
              onClick={resetNarrowingFilters}
              className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-primary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              Clear cloud/license filters
            </button>
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
        <h2 className="text-lg font-semibold">
          {activeTab === "coding" ? "Commercial alternatives" : "Additional tools"}
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {nonVendorTools.length > 0
            ? `${nonVendorTools.length} matching tools in this filtered view.`
            : "No non-vendor tools match the current filter combination in this subcategory."}
        </p>
        {nonVendorTools.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {nonVendorTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            <WarningBox variant="info">
              No tools match the current filter combination. Adjust type, cloud, license, or sort to broaden the result set.
            </WarningBox>
            {hasActiveNarrowingFilter ? (
              <button
                type="button"
                onClick={resetNarrowingFilters}
                className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-primary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                Clear cloud/license filters
              </button>
            ) : null}
          </div>
        )}
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

      {visibleUpdates.length > 0 ? (
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
          <h2 className="text-lg font-semibold">Recent updates</h2>
          <div className="mt-4 space-y-4">
            {visibleUpdates.map((update) => (
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
