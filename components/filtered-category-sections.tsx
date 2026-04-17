"use client";

import { useMemo, useState } from "react";
import { FilterBar } from "@/components/filter-bar";
import { ToolCard } from "@/components/tool-card";
import { WarningBox } from "@/components/warning-box";
import { filterTools, getAvailableLicenses, type CategoryFilterState } from "@/lib/category-filters";
import type { Tool, UpdateEntry } from "@/lib/types";

export function FilteredCategorySections({ tools, updates }: { tools: Tool[]; updates: UpdateEntry[] }) {
  const [typeFilter, setTypeFilter] = useState<CategoryFilterState["type"]>("all");
  const [cloudFilters, setCloudFilters] = useState<string[]>([]);
  const [licenseFilter, setLicenseFilter] = useState("all");
  const [sortBy, setSortBy] = useState<CategoryFilterState["sort"]>("name");

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

  const nonVendorTools = effectiveTools.filter((tool) => tool.type !== "vendor");
  const warningTools = effectiveTools.filter((tool) => tool.licenseWarning || tool.statusNote);

  return (
    <>
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

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
        <h2 className="text-lg font-semibold">Filtered open source and third-party tools</h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{nonVendorTools.length} matching non-vendor tools in this filtered view.</p>

        {nonVendorTools.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {nonVendorTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} compact />
            ))}
          </div>
        ) : null}
      </section>

      {warningTools.length > 0 ? (
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
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
    </>
  );
}
