"use client";

import { ArrowUpRight, BriefcaseBusiness } from "lucide-react";
import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { FilterBar } from "@/components/filter-bar";
import { HubFaqs } from "@/components/hub-faqs";
import { JsonLd, buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildFaqPageJsonLd, buildToolListJsonLd } from "@/components/json-ld";
import { PlatformCategoryBar } from "@/components/platform-category-bar";
import { RelatedComparisons } from "@/components/related-comparisons";
import { RelatedHubs } from "@/components/related-hubs";
import { ToolCard } from "@/components/tool-card";
import { VendorToolsSection } from "@/components/vendor-tools-section";
import { WarningBox } from "@/components/warning-box";
import { assistantsComparisons, type AssistantsSubcategory } from "@/lib/assistants-comparisons";
import { filterTools, getAvailableLicenses, type CategoryFilterState } from "@/lib/category-filters";
import type { ComparisonPair } from "@/lib/comparisons";
import type { HubFaq } from "@/lib/hub-faqs";
import { siteUrl } from "@/lib/metadata";
import { withBasePath } from "@/lib/site";
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
  introParagraphs?: string[];
  tools: Tool[];
  updates: UpdateEntry[];
  platforms: Platform[];
  faqs?: HubFaq[];
  relatedPairs?: ComparisonPair[];
};

type AssistantFilterState = {
  typeFilter: CategoryFilterState["type"];
  cloudFilters: string[];
  licenseFilter: string;
  deploymentFilter: CategoryFilterState["deployment"];
  licenseRiskFilter: CategoryFilterState["licenseRisk"];
  sortBy: CategoryFilterState["sort"];
};

const defaultFilterState: AssistantFilterState = {
  typeFilter: "all",
  cloudFilters: [],
  licenseFilter: "all",
  deploymentFilter: "all",
  licenseRiskFilter: "all",
  sortBy: "name",
};

export function AssistantsPageClient({ title, description, introParagraphs, tools, updates, platforms, faqs, relatedPairs = [] }: AssistantsPageClientProps) {
  const [activeTab, setActiveTab] = useState<AssistantsSubcategory>("coding");
  const [filterState, setFilterState] = useState<AssistantFilterState>(defaultFilterState);
  const tabRefs = useRef<Record<AssistantsSubcategory, HTMLButtonElement | null>>({
    coding: null,
    productivity: null,
    "build-your-own": null,
  });

  const toolsBySubcategory = useMemo(() => {
    return Object.fromEntries(
      subcategoryOrder.map((subcategory) => [
        subcategory,
        tools.filter((tool) => tool.subcategory === subcategory),
      ]),
    ) as Record<AssistantsSubcategory, Tool[]>;
  }, [tools]);

  const activeTools = toolsBySubcategory[activeTab];
  const comparison = assistantsComparisons[activeTab];
  const availableLicenses = useMemo(() => getAvailableLicenses(activeTools), [activeTools]);
  const { typeFilter, cloudFilters, licenseFilter, deploymentFilter, licenseRiskFilter, sortBy } = filterState;
  const hasActiveNarrowingFilter = cloudFilters.length > 0 || licenseFilter !== "all" || deploymentFilter !== "all" || licenseRiskFilter !== "all";

  const effectiveTools = useMemo(() => {
    let next = filterTools(activeTools, {
      type: typeFilter,
      cloud: "all",
      license: licenseFilter,
      deployment: deploymentFilter,
      licenseRisk: licenseRiskFilter,
      sort: sortBy,
    });

    if (cloudFilters.length > 0) {
      next = next.filter((tool) => cloudFilters.every((cloud) => tool.clouds?.includes(cloud)));
    }

    return next;
  }, [activeTools, typeFilter, licenseFilter, deploymentFilter, licenseRiskFilter, sortBy, cloudFilters]);

  const vendorTools = useMemo(() => effectiveTools.filter((tool) => tool.type === "vendor"), [effectiveTools]);
  const nonVendorTools = useMemo(() => effectiveTools.filter((tool) => tool.type !== "vendor"), [effectiveTools]);
  const warnings = useMemo(() => effectiveTools.filter((tool) => tool.licenseWarning || tool.statusNote), [effectiveTools]);
  const showVendorCards = (typeFilter === "all" || typeFilter === "vendor") && vendorTools.length > 0;
  const showVendorComparison = !hasActiveNarrowingFilter && typeFilter !== "opensource" && typeFilter !== "commercial" && vendorTools.length > 0;
  const visibleUpdates = updates.slice(0, 5);

  function setActiveSubcategory(subcategory: AssistantsSubcategory) {
    setActiveTab(subcategory);
    setFilterState(defaultFilterState);
  }

  function updateFilterState(partial: Partial<AssistantFilterState>) {
    setFilterState((current) => ({ ...current, ...partial }));
  }

  function resetNarrowingFilters() {
    updateFilterState({ cloudFilters: [], licenseFilter: "all", deploymentFilter: "all", licenseRiskFilter: "all" });
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, subcategory: AssistantsSubcategory) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setActiveSubcategory(subcategory);
      return;
    }

    const currentIndex = subcategoryOrder.indexOf(subcategory);

    if (currentIndex === -1) {
      return;
    }

    let nextIndex: number | null = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % subcategoryOrder.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + subcategoryOrder.length) % subcategoryOrder.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = subcategoryOrder.length - 1;
    }

    if (nextIndex === null) {
      return;
    }

    event.preventDefault();
    const nextSubcategory = subcategoryOrder[nextIndex];
    tabRefs.current[nextSubcategory]?.focus();
  }

  function getVendorSectionDescription() {
    if (hasActiveNarrowingFilter) {
      return `Cloud vendor ${subcategoryLabels[activeTab].toLowerCase()} assistants stay visible under the current filters. Clear cloud and license filters to restore the side-by-side vendor comparison.`;
    }

    if (showVendorComparison) {
      return `Cloud vendor ${subcategoryLabels[activeTab].toLowerCase()} assistants stay near the top, with the side-by-side vendor comparison directly above the matching tool cards.`;
    }

    return `Matching cloud vendor ${subcategoryLabels[activeTab].toLowerCase()} assistants stay grouped near the top of the page.`;
  }

  function getAdditionalToolsHeading() {
    if (hasActiveNarrowingFilter || typeFilter !== "all" || sortBy !== "name") {
      return activeTab === "coding" ? "Filtered commercial alternatives" : "Filtered additional tools";
    }

    return activeTab === "coding" ? "Commercial alternatives" : "Additional tools";
  }

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
    ...(faqs && faqs.length > 0 ? [buildFaqPageJsonLd(faqs)] : []),
  ];

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <JsonLd data={jsonLd} />
      <section className="card-flat p-6 md:p-10">
        <div className="flex items-start gap-3">
          <BriefcaseBusiness size={20} aria-hidden="true" className="mt-2 shrink-0 text-[var(--color-text-secondary)]" />
          <div className="max-w-2xl">
            <h1 className="text-h1 text-[var(--color-text-primary)]">{title}</h1>
            <p className="mt-3 text-body text-[var(--color-text-secondary)]">{description}</p>
            {introParagraphs && introParagraphs.length > 0 ? (
              <div className="mt-3 space-y-3 text-body-sm text-[var(--color-text-secondary)]">
                {introParagraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            ) : null}
            <div className="mt-3 text-sm text-[var(--color-text-secondary)]">{tools.length} tools in current dataset</div>
          </div>
        </div>
      </section>

      <PlatformCategoryBar category="assistants" platforms={platforms} />

      <section
        className="sticky z-20 bg-[var(--color-bg-primary)] pb-2 pt-1"
        style={{ top: "calc(var(--site-header-height, 4rem) + 0.25rem)" }}
      >
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 shadow-sm">
          <div role="tablist" aria-label="Assistant subcategories" className="flex flex-wrap gap-2">
            {subcategoryOrder.map((subcategory) => (
              <button
                key={subcategory}
                ref={(element) => {
                  tabRefs.current[subcategory] = element;
                }}
                type="button"
                role="tab"
                tabIndex={activeTab === subcategory ? 0 : -1}
                aria-selected={activeTab === subcategory}
                aria-controls={`tabpanel-${subcategory}`}
                id={`tab-${subcategory}`}
                onClick={() => setActiveSubcategory(subcategory)}
                onKeyDown={(event) => handleTabKeyDown(event, subcategory)}
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
        <div className="mt-4">
          <FilterBar
            typeFilter={typeFilter}
            onTypeFilterChange={(value) => updateFilterState({ typeFilter: value })}
            cloudFilters={cloudFilters}
            onCloudFiltersChange={(value) => updateFilterState({ cloudFilters: value })}
            licenseFilter={licenseFilter}
            onLicenseFilterChange={(value) => updateFilterState({ licenseFilter: value })}
            deploymentFilter={deploymentFilter}
            onDeploymentFilterChange={(value) => updateFilterState({ deploymentFilter: value as CategoryFilterState["deployment"] })}
            licenseRiskFilter={licenseRiskFilter}
            onLicenseRiskFilterChange={(value) => updateFilterState({ licenseRiskFilter: value as CategoryFilterState["licenseRisk"] })}
            sortBy={sortBy}
            onSortByChange={(value) => updateFilterState({ sortBy: value as CategoryFilterState["sort"] })}
            availableLicenses={availableLicenses}
            resultCount={effectiveTools.length}
            resultLabel={effectiveTools.length === 1 ? `${subcategoryLabels[activeTab].toLowerCase()} assistant` : `${subcategoryLabels[activeTab].toLowerCase()} assistants`}
          />
        </div>
      </section>

      <div role="tabpanel" id={`tabpanel-${activeTab}`} aria-labelledby={`tab-${activeTab}`} className="space-y-6">
        {comparison && (showVendorCards || showVendorComparison) ? (
          <VendorToolsSection
            vendorTools={vendorTools}
            comparison={comparison}
            showComparison={showVendorComparison}
            description={getVendorSectionDescription()}
            showToolCards={showVendorCards}
            clearFiltersLabel={hasActiveNarrowingFilter ? "Clear cloud/license filters" : undefined}
            onClearFilters={hasActiveNarrowingFilter ? resetNarrowingFilters : undefined}
          />
        ) : null}

        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
          <h2 className="text-lg font-semibold">{getAdditionalToolsHeading()}</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {nonVendorTools.length > 0
              ? `${nonVendorTools.length} matching tools in this subcategory.`
              : "No additional non-vendor tools match the current assistants filters in this subcategory."}
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
                No non-vendor assistant tools match the current filter combination. Adjust type, cloud, license, or sort to broaden the result set.
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
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold">Recent updates</h2>
              <a
                href={`${withBasePath("/updates")}#auto-detected`}
                className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              >
                See auto-detected changes
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </div>
            <div className="mt-4 space-y-4">
              {visibleUpdates.map((update) => (
                <div key={update.id} className="border-l-2 border-[var(--color-primary)] pl-4">
                  <div className="text-caption uppercase tracking-wide text-[var(--color-text-tertiary)]">{update.date}</div>
                  <div className="mt-1 font-semibold">{update.title ?? update.toolName}</div>
                  <div className="mt-1 text-sm font-medium text-[var(--color-text-secondary)]">{update.toolName}</div>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{update.summary}</p>
                  <a href={update.sourceUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex text-sm font-medium text-[var(--color-primary)] hover:underline">Source</a>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <RelatedComparisons pairs={relatedPairs} title="Popular comparisons for assistants" />

      {faqs && faqs.length > 0 ? <HubFaqs faqs={faqs} /> : null}

      <RelatedHubs
        currentPath="/assistants"
        title="Explore adjacent hubs"
        intro="Move from assistants into the platform foundation layer, the weekly market-intelligence feed, or the contribution/sourcing guide."
        hubs={[
          {
            href: "/platforms",
            title: "Platforms",
            description: "Compare Microsoft Foundry, Amazon Bedrock, and Gemini Enterprise Agent Platform as the foundation layer beneath assistant tooling.",
          },
          {
            href: "/updates",
            title: "Weekly updates",
            description: "Review the high-impact market-intelligence view or expand into the full log for releases, renames, and acquisitions affecting coding, productivity, and build-your-own assistants.",
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
