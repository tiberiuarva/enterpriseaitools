"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FilterBar } from "@/components/filter-bar";
import { PlatformCategoryBar } from "@/components/platform-category-bar";
import { RelatedHubs } from "@/components/related-hubs";
import { ToolCard } from "@/components/tool-card";
import { VendorToolsSection } from "@/components/vendor-tools-section";
import { WarningBox } from "@/components/warning-box";
import { filterTools, getAvailableLicenses, isDeploymentModel, isLicenseRiskLevel, type CategoryFilterState } from "@/lib/category-filters";
import type { CategoryComparison } from "@/lib/category-comparisons";
import type { Platform, Tool, ToolCategory, UpdateEntry } from "@/lib/types";

type FilteredCategorySectionsProps = {
  category: ToolCategory;
  tools: Tool[];
  updates: UpdateEntry[];
  platforms: Platform[];
  comparison?: CategoryComparison;
};

type FilterStateSnapshot = {
  typeFilter: CategoryFilterState["type"];
  cloudFilters: string[];
  licenseFilter: string;
  deploymentFilter: CategoryFilterState["deployment"];
  licenseRiskFilter: CategoryFilterState["licenseRisk"];
  sortBy: CategoryFilterState["sort"];
};

const defaultFilterState: FilterStateSnapshot = {
  typeFilter: "all",
  cloudFilters: [],
  licenseFilter: "all",
  deploymentFilter: "all",
  licenseRiskFilter: "all",
  sortBy: "name",
};

function parseCloudFilters(searchParams: URLSearchParams) {
  const values = searchParams.getAll("cloud");

  if (values.length === 0) {
    return [];
  }

  return Array.from(
    new Set(
      values
        .flatMap((value) => value.split(","))
        .map((value) => value.trim().toLowerCase())
        .filter((value): value is "azure" | "aws" | "gcp" => value === "azure" || value === "aws" || value === "gcp"),
    ),
  );
}

function readFilterState(searchParams: URLSearchParams): FilterStateSnapshot {
  const type = searchParams.get("type");
  const license = searchParams.get("license");
  const deployment = searchParams.get("deployment");
  const licenseRisk = searchParams.get("licenseRisk");
  const sort = searchParams.get("sort");

  return {
    typeFilter: type === "vendor" || type === "opensource" || type === "commercial" ? type : "all",
    cloudFilters: parseCloudFilters(searchParams),
    licenseFilter: license && license.length > 0 ? license : "all",
    deploymentFilter: deployment && isDeploymentModel(deployment) ? deployment : "all",
    licenseRiskFilter: licenseRisk && isLicenseRiskLevel(licenseRisk) ? licenseRisk : "all",
    sortBy: sort === "stars" || sort === "updated" ? sort : "name",
  };
}

function readFilterStateFromWindow(): FilterStateSnapshot {
  if (typeof window === "undefined") {
    return defaultFilterState;
  }

  return readFilterState(new URLSearchParams(window.location.search));
}

function buildFilterQuery({
  typeFilter,
  cloudFilters,
  licenseFilter,
  deploymentFilter,
  licenseRiskFilter,
  sortBy,
}: FilterStateSnapshot) {
  const next = new URLSearchParams();

  if (typeFilter !== "all") {
    next.set("type", typeFilter);
  }

  if (cloudFilters.length > 0) {
    next.set("cloud", [...cloudFilters].sort().join(","));
  }

  if (licenseFilter !== "all") {
    next.set("license", licenseFilter);
  }

  if (deploymentFilter !== "all") {
    next.set("deployment", deploymentFilter);
  }

  if (licenseRiskFilter !== "all") {
    next.set("licenseRisk", licenseRiskFilter);
  }

  if (sortBy !== "name") {
    next.set("sort", sortBy);
  }

  return next.toString();
}

export function FilteredCategorySections({ category, tools, updates, platforms, comparison }: FilteredCategorySectionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const didMountRef = useRef(false);
  const [filterState, setFilterState] = useState<FilterStateSnapshot>(defaultFilterState);
  const [hasSyncedFromUrl, setHasSyncedFromUrl] = useState(false);

  useEffect(() => {
    const syncFromUrl = () => {
      setFilterState(readFilterStateFromWindow());
      setHasSyncedFromUrl(true);
      didMountRef.current = true;
    };

    const timeoutId = window.setTimeout(syncFromUrl, 0);

    const handlePopState = () => {
      setFilterState(readFilterStateFromWindow());
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    if (!didMountRef.current || !hasSyncedFromUrl || typeof window === "undefined") {
      return;
    }

    const nextQuery = buildFilterQuery(filterState);
    const currentQuery = window.location.search.replace(/^\?/, "");

    if (nextQuery === currentQuery) {
      return;
    }

    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [filterState, hasSyncedFromUrl, pathname, router]);

  function updateFilterState(partial: Partial<FilterStateSnapshot>) {
    setFilterState((current) => ({ ...current, ...partial }));
  }

  function resetNarrowingFilters() {
    updateFilterState({ cloudFilters: [], licenseFilter: "all", deploymentFilter: "all", licenseRiskFilter: "all" });
  }

  const { typeFilter, cloudFilters, licenseFilter, deploymentFilter, licenseRiskFilter, sortBy } = filterState;
  const availableLicenses = useMemo(() => getAvailableLicenses(tools), [tools]);
  const effectiveTools = useMemo(() => {
    let next = filterTools(tools, {
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
  }, [tools, typeFilter, licenseFilter, deploymentFilter, licenseRiskFilter, sortBy, cloudFilters]);

  const vendorTools = useMemo(() => effectiveTools.filter((tool) => tool.type === "vendor"), [effectiveTools]);
  const nonVendorTools = effectiveTools.filter((tool) => tool.type !== "vendor");
  const warningTools = effectiveTools.filter((tool) => tool.licenseWarning || tool.statusNote);
  const visibleUpdates = useMemo(() => updates.slice(0, 5), [updates]);
  const hasActiveNarrowingFilter = cloudFilters.length > 0 || licenseFilter !== "all" || deploymentFilter !== "all" || licenseRiskFilter !== "all";
  const showVendorCards = (typeFilter === "all" || typeFilter === "vendor") && vendorTools.length > 0;
  const showVendorComparison = Boolean(comparison) && !hasActiveNarrowingFilter && typeFilter !== "opensource" && typeFilter !== "commercial";
  const showVendorSection = showVendorCards || showVendorComparison;

  function getVendorSectionDescription() {
    if (category === "agents") {
      return hasActiveNarrowingFilter
        ? "Cloud-native agent offerings stay visible under the filter controls. Clear cloud and license filters to restore the full vendor comparison after the vendor tool cards in this section."
        : "Cloud-native agent offerings are grouped near the top of the page, with the vendor comparison directly below the vendor tool cards in the same section.";
    }

    if (showVendorComparison) {
      return showVendorCards
        ? "Cloud-native vendor offerings are shown first here, before the broader open source and third-party landscape below."
        : "The three-way vendor comparison is available here because cloud and license filters are cleared. Vendor tool cards are hidden by the current type filter.";
    }

    if (comparison) {
      return "Cloud-native vendor offerings stay near the top of this page. Clear cloud and license filters to restore the three-way vendor comparison table.";
    }

    return hasActiveNarrowingFilter
      ? "Vendor tool cards stay visible near the top and respect the current filters. Detailed vendor comparison rows are still being added for this category."
      : "Vendor tool cards are shown near the top of the page. Detailed vendor comparison rows are still being added for this category.";
  }

  return (
    <>
      <PlatformCategoryBar category={category} platforms={platforms} headingLevel={3} />

      <section
        className="sticky top-[calc(var(--site-header-height,4rem)+0.25rem)] z-20 -mx-2 bg-[linear-gradient(to_bottom,var(--color-bg-surface),color-mix(in_srgb,var(--color-bg-surface)_82%,transparent))] px-2 pb-2 pt-1 sm:mx-0 sm:px-0"
      >
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
          resultLabel={effectiveTools.length === 1 ? "matching tool" : "matching tools"}
        />
      </section>

      {showVendorSection ? (
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

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 [content-visibility:auto] [contain-intrinsic-size:1200px]">
        <h2 className="text-lg font-semibold">Filtered open source and third-party tools</h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{nonVendorTools.length} matching non-vendor tools in this filtered view.</p>

        {nonVendorTools.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {nonVendorTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} compact />
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

      {warningTools.length > 0 ? (
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 [content-visibility:auto] [contain-intrinsic-size:320px]">
          <h2 className="text-lg font-semibold">Important notes</h2>
          <div className="mt-4 space-y-3">
            {warningTools.map((tool) => (
              <WarningBox key={tool.id}>
                <strong>{tool.name}:</strong> {tool.licenseWarning ?? tool.statusNote}
              </WarningBox>
            ))}
          </div>
        </section>
      ) : null}

      {visibleUpdates.length > 0 ? (
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 [content-visibility:auto] [contain-intrinsic-size:360px]">
          <h2 className="text-lg font-semibold">Recent updates</h2>
          <div className="mt-4 space-y-4">
            {visibleUpdates.map((update) => (
              <div key={update.id} className="border-l-2 border-[var(--color-primary)] pl-4">
                <div className="text-xs uppercase tracking-wide text-[var(--color-secondary)]">{update.date}</div>
                <div className="mt-1 font-semibold">{update.title ?? update.toolName}</div>
                <div className="mt-1 text-sm font-medium text-[var(--color-text-secondary)]">{update.toolName}</div>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{update.summary}</p>
                <a href={update.sourceUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex text-sm font-medium text-[var(--color-primary)] hover:underline">Source</a>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <RelatedHubs
        currentPath={`/${category}`}
        title="Explore adjacent hubs"
        intro="Compare the active category against the platform foundation layer, the cross-category updates feed, and the sourcing/contribution guide."
        hubs={[
          {
            href: "/platforms",
            title: "Platforms",
            description: "Review Microsoft Foundry, Amazon Bedrock, and Gemini Enterprise Agent Platform as the foundation layer behind this category.",
          },
          {
            href: "/updates",
            title: "Weekly updates",
            description: "Check the market-intelligence feed for high-impact moves, plus the expandable full log for releases, deprecations, acquisitions, and other notable changes.",
          },
          {
            href: "/about",
            title: "About and contribution rules",
            description: "See sourcing standards, contribution rules, and project scope before adding or updating tracked tools.",
          },
        ]}
      />
    </>
  );
}
