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
  deploymentFilter: string;
  onDeploymentFilterChange: (value: string) => void;
  licenseRiskFilter: string;
  onLicenseRiskFilterChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  availableLicenses: string[];
  resultCount?: number;
  resultLabel?: string;
};

const cloudOptions = ["azure", "aws", "gcp"] as const;
const deploymentOptions = [
  { value: "saas", label: "SaaS" },
  { value: "self-hosted", label: "Self-hosted" },
  { value: "on-prem", label: "On-prem" },
  { value: "sovereign", label: "Sovereign" },
  { value: "hybrid", label: "Hybrid" },
] as const;
const licenseRiskOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "unknown", label: "Unknown" },
] as const;

const SEGMENT_BASE = "rounded-full border px-2.5 py-1 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-card)]";
const SEGMENT_ON = "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-text-inverse)]";
const SEGMENT_OFF = "border-[var(--color-border)] bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]";
const SELECT_CLASS = "rounded-md border border-[var(--color-border)] bg-[var(--color-bg-hover)] px-2 py-1 text-xs text-[var(--color-text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]";

export function FilterBar({
  typeFilter,
  onTypeFilterChange,
  cloudFilters,
  onCloudFiltersChange,
  licenseFilter,
  onLicenseFilterChange,
  deploymentFilter,
  onDeploymentFilterChange,
  licenseRiskFilter,
  onLicenseRiskFilterChange,
  sortBy,
  onSortByChange,
  availableLicenses,
  resultCount,
  resultLabel = "matching tools",
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
  const advancedActive =
    (licenseFilter !== "all" ? 1 : 0) +
    (deploymentFilter !== "all" ? 1 : 0) +
    (licenseRiskFilter !== "all" ? 1 : 0);

  function toggleCloud(cloud: string) {
    if (cloudFilters.includes(cloud)) {
      onCloudFiltersChange(cloudFilters.filter((item) => item !== cloud));
      return;
    }

    onCloudFiltersChange([...cloudFilters, cloud]);
  }

  return (
    <section
      aria-label="Filter and sort tools"
      className="w-full card-flat p-3"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <fieldset className="flex flex-wrap gap-1.5">
          <legend className="sr-only">Filter tools by type</legend>
          {segmentedOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={typeFilter === option.value}
              onClick={() => onTypeFilterChange(option.value)}
              className={`${SEGMENT_BASE} ${typeFilter === option.value ? SEGMENT_ON : SEGMENT_OFF}`}
            >
              {option.label}
            </button>
          ))}
        </fieldset>

        <fieldset className="flex flex-wrap gap-1">
          <legend className="sr-only">Filter tools by cloud support</legend>
          {cloudOptions.map((cloud) => {
            const checked = cloudFilters.includes(cloud);
            return (
              <label
                key={cloud}
                className={`inline-flex cursor-pointer items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] uppercase transition focus-within:ring-2 focus-within:ring-[var(--color-primary)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--color-bg-card)] ${
                  checked
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                    : "border-[var(--color-border)] bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCloud(cloud)}
                  className="sr-only"
                />
                {cloud}
              </label>
            );
          })}
        </fieldset>

        <label className="sr-only" htmlFor="sort-tools">
          Sort tools
        </label>
        <select
          id="sort-tools"
          aria-label="Sort tools"
          value={sortBy}
          onChange={(event) => onSortByChange(event.target.value)}
          className={SELECT_CLASS}
        >
          <option value="name">A–Z</option>
          <option value="stars">Stars</option>
          <option value="updated">Updated</option>
        </select>

        {resultCount !== undefined ? (
          <span className="ml-auto text-xs text-[var(--color-text-secondary)]" aria-live="polite">
            {resultCount} {resultLabel}
          </span>
        ) : null}
      </div>

      <details key={advancedActive > 0 ? "open" : "closed"} className="mt-2" open={advancedActive > 0}>
        <summary className="cursor-pointer select-none rounded text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]">
          More filters{advancedActive > 0 ? ` (${advancedActive})` : ""}
        </summary>
        <div className="mt-2 flex flex-wrap gap-2">
          <label className="sr-only" htmlFor="license-filter">
            Filter tools by license
          </label>
          <select
            id="license-filter"
            aria-label="Filter tools by license"
            value={licenseFilter}
            onChange={(event) => onLicenseFilterChange(event.target.value)}
            className={SELECT_CLASS}
          >
            <option value="all">All licenses</option>
            {availableLicenses.map((license) => (
              <option key={license} value={license}>
                {license}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="deployment-filter">
            Filter tools by deployment model
          </label>
          <select
            id="deployment-filter"
            aria-label="Filter tools by deployment model"
            value={deploymentFilter}
            onChange={(event) => onDeploymentFilterChange(event.target.value)}
            className={SELECT_CLASS}
          >
            <option value="all">All deployment models</option>
            {deploymentOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="license-risk-filter">
            Filter tools by license risk
          </label>
          <select
            id="license-risk-filter"
            aria-label="Filter tools by license risk"
            value={licenseRiskFilter}
            onChange={(event) => onLicenseRiskFilterChange(event.target.value)}
            className={SELECT_CLASS}
          >
            <option value="all">All license risk</option>
            {licenseRiskOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </details>
    </section>
  );
}
