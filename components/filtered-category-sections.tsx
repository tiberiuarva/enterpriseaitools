"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FilterBar } from "@/components/filter-bar";
import { ToolCard } from "@/components/tool-card";
import { VendorToolsSection } from "@/components/vendor-tools-section";
import { WarningBox } from "@/components/warning-box";
import { filterTools, getAvailableLicenses, type CategoryFilterState } from "@/lib/category-filters";
import type { CategoryComparison } from "@/lib/category-comparisons";
import type { Tool, UpdateEntry } from "@/lib/types";

type FilteredCategorySectionsProps = {
  tools: Tool[];
  updates: UpdateEntry[];
  comparison?: CategoryComparison;
};

type FilterStateSnapshot = {
  typeFilter: CategoryFilterState["type"];
  cloudFilters: string[];
  licenseFilter: string;
  sortBy: CategoryFilterState["sort"];
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
  const sort = searchParams.get("sort");

  return {
    typeFilter: type === "vendor" || type === "opensource" || type === "commercial" ? type : "all",
    cloudFilters: parseCloudFilters(searchParams),
    licenseFilter: license && license.length > 0 ? license : "all",
    sortBy: sort === "stars" || sort === "updated" ? sort : "name",
  };
}

function readFilterStateFromWindow(): FilterStateSnapshot {
  if (typeof window === "undefined") {
    return {
      typeFilter: "all",
      cloudFilters: [],
      licenseFilter: "all",
      sortBy: "name",
    };
  }

  return readFilterState(new URLSearchParams(window.location.search));
}

function buildFilterQuery({
  typeFilter,
  cloudFilters,
  licenseFilter,
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

  if (sortBy !== "name") {
    next.set("sort", sortBy);
  }

  return next.toString();
}

export function FilteredCategorySections({ tools, updates, comparison }: FilteredCategorySectionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const didMountRef = useRef(false);
  const [filterState, setFilterState] = useState<FilterStateSnapshot>(() => readFilterStateFromWindow());

  useEffect(() => {
    didMountRef.current = true;

    const handlePopState = () => {
      setFilterState(readFilterStateFromWindow());
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    if (!didMountRef.current || typeof window === "undefined") {
      return;
    }

    const nextQuery = buildFilterQuery(filterState);
    const currentQuery = window.location.search.replace(/^\?/, "");

    if (nextQuery === currentQuery) {
      return;
    }

    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [filterState, pathname, router]);

  function updateFilterState(partial: Partial<FilterStateSnapshot>) {
    setFilterState((current) => ({ ...current, ...partial }));
  }

  function resetNarrowingFilters() {
    updateFilterState({ cloudFilters: [], licenseFilter: "all" });
  }

  const { typeFilter, cloudFilters, licenseFilter, sortBy } = filterState;
  const availableLicenses = useMemo(() => getAvailableLicenses(tools), [tools]);
  const effectiveTools = useMemo(() => {
    let next = filterTools(tools, {
      type: typeFilter,
      cloud: "all",
      license: licenseFilter,
      sort: sortBy,
    });

    if (cloudFilters.length > 0) {
      next = next.filter((tool) => cloudFilters.every((cloud) => tool.clouds?.includes(cloud)));
    }

    return next;
  }, [tools, typeFilter, licenseFilter, sortBy, cloudFilters]);

  const vendorTools = useMemo(() => effectiveTools.filter((tool) => tool.type === "vendor"), [effectiveTools]);
  const nonVendorTools = effectiveTools.filter((tool) => tool.type !== "vendor");
  const warningTools = effectiveTools.filter((tool) => tool.licenseWarning || tool.statusNote);
  const visibleUpdates = useMemo(() => updates.slice(0, 5), [updates]);
  const hasActiveNarrowingFilter = cloudFilters.length > 0 || licenseFilter !== "all";
  const showVendorCards = (typeFilter === "all" || typeFilter === "vendor") && vendorTools.length > 0;
  const showVendorComparison = Boolean(comparison) && !hasActiveNarrowingFilter;
  const showVendorSection = showVendorCards || showVendorComparison;

  return (
    <>
      <section
        className="sticky z-10 rounded-xl border border-[var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-bg-card)_92%,transparent)] backdrop-blur"
        style={{ top: "calc(var(--site-header-height, 4rem) + 0.5rem)" }}
      >
        <FilterBar
          typeFilter={typeFilter}
          onTypeFilterChange={(value) => updateFilterState({ typeFilter: value })}
          cloudFilters={cloudFilters}
          onCloudFiltersChange={(value) => updateFilterState({ cloudFilters: value })}
          licenseFilter={licenseFilter}
          onLicenseFilterChange={(value) => updateFilterState({ licenseFilter: value })}
          sortBy={sortBy}
          onSortByChange={(value) => updateFilterState({ sortBy: value as CategoryFilterState["sort"] })}
          availableLicenses={availableLicenses}
        />
      </section>

      {showVendorSection ? (
        <VendorToolsSection
          vendorTools={vendorTools}
          comparison={comparison}
          showComparison={showVendorComparison}
          description={
            showVendorComparison
              ? showVendorCards
                ? "Source-backed side-by-side comparison for the three cloud vendor offerings in this category."
                : "Source-backed side-by-side comparison for the three cloud vendor offerings in this category. Vendor tool cards are hidden by the current type filter."
              : comparison
                ? "Vendor tool cards shown below. Clear cloud and license filters to restore the three-way vendor comparison table."
                : hasActiveNarrowingFilter
                  ? "Vendor tool cards shown below. Current filters still apply here, and detailed vendor comparison rows are still being added for this category."
                  : "Vendor tool cards shown below. Detailed vendor comparison rows are still being added for this category."
          }
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
                <div className="mt-1 font-semibold">{update.toolName}</div>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{update.summary}</p>
                <a href={update.sourceUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex text-sm font-medium text-[var(--color-primary)] hover:underline">Source</a>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
