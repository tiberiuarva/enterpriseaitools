"use client";

import { useMemo } from "react";

type FilterValue = "all" | "vendor" | "opensource" | "commercial";

type FilterBarProps = {
  typeFilter: FilterValue;
  onTypeFilterChange: (value: FilterValue) => void;
  cloudFilters: string[];
  onCloudFiltersChange: (value: string[]) => void;
  licenseFilter: string;
  onLicenseFilterChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  availableLicenses: string[];
};

const cloudOptions = ["azure", "aws", "gcp"] as const;

export function FilterBar({
  typeFilter,
  onTypeFilterChange,
  cloudFilters,
  onCloudFiltersChange,
  licenseFilter,
  onLicenseFilterChange,
  sortBy,
  onSortByChange,
  availableLicenses,
}: FilterBarProps) {
  const segmentedOptions = useMemo(
    () => [
      { label: "All", value: "all" },
      { label: "Vendor", value: "vendor" },
      { label: "Open Source", value: "opensource" },
      { label: "Commercial", value: "commercial" },
    ] as const,
    [],
  );

  function toggleCloud(cloud: string) {
    if (cloudFilters.includes(cloud)) {
      onCloudFiltersChange(cloudFilters.filter((item) => item !== cloud));
      return;
    }

    onCloudFiltersChange([...cloudFilters, cloud]);
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-center">
          <fieldset className="flex flex-wrap gap-2">
            <legend className="sr-only">Filter tools by type</legend>
            {segmentedOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={typeFilter === option.value}
                onClick={() => onTypeFilterChange(option.value)}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  typeFilter === option.value
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-text-inverse)]"
                    : "border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </fieldset>

          <fieldset className="flex flex-wrap gap-2">
            <legend className="sr-only">Filter tools by cloud support</legend>
            {cloudOptions.map((cloud) => (
              <label
                key={cloud}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-1.5 text-sm text-[var(--color-text-secondary)]"
              >
                <input
                  type="checkbox"
                  checked={cloudFilters.includes(cloud)}
                  onChange={() => toggleCloud(cloud)}
                  className="accent-[var(--color-primary)]"
                />
                <span className="uppercase">{cloud}</span>
              </label>
            ))}
          </fieldset>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="license-filter">
            Filter tools by license
          </label>
          <select
            id="license-filter"
            aria-label="Filter tools by license"
            value={licenseFilter}
            onChange={(event) => onLicenseFilterChange(event.target.value)}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
          >
            <option value="all">All licenses</option>
            {availableLicenses.map((license) => (
              <option key={license} value={license}>
                {license}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="sort-tools">
            Sort tools
          </label>
          <select
            id="sort-tools"
            aria-label="Sort tools"
            value={sortBy}
            onChange={(event) => onSortByChange(event.target.value)}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
          >
            <option value="name">Name (A-Z)</option>
            <option value="stars">Stars (high-low)</option>
            <option value="updated">Last updated (recent first)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
