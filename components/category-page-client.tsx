"use client";

import { Bot, BriefcaseBusiness, GitBranch, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { FilterBar } from "@/components/filter-bar";
import { PlatformCategoryBar } from "@/components/platform-category-bar";
import { ToolCard } from "@/components/tool-card";
import { VendorComparisonTable } from "@/components/vendor-comparison-table";
import { WarningBox } from "@/components/warning-box";
import type { CategoryComparison } from "@/lib/category-comparisons";
import type { Platform, Tool, ToolCategory, UpdateEntry } from "@/lib/types";

type IconName = "bot" | "git-branch" | "shield-check" | "briefcase-business";

type CategoryPageClientProps = {
  category: ToolCategory;
  title: string;
  description: string;
  iconName: IconName;
  tools: Tool[];
  updates: UpdateEntry[];
  platforms: Platform[];
  comparison?: CategoryComparison;
};

const iconMap = {
  bot: Bot,
  "git-branch": GitBranch,
  "shield-check": ShieldCheck,
  "briefcase-business": BriefcaseBusiness,
} as const;

export function CategoryPageClient({ category, title, description, iconName, tools, updates, platforms, comparison }: CategoryPageClientProps) {
  const Icon = iconMap[iconName];
  const [typeFilter, setTypeFilter] = useState<"all" | "vendor" | "opensource" | "commercial">("all");
  const [cloudFilters, setCloudFilters] = useState<string[]>([]);
  const [licenseFilter, setLicenseFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  const availableLicenses = useMemo(
    () => Array.from(new Set(tools.map((tool) => tool.license))).sort((a, b) => a.localeCompare(b)),
    [tools],
  );

  const filteredTools = useMemo(() => {
    return tools
      .filter((tool) => typeFilter === "all" || tool.type === typeFilter)
      .filter((tool) => licenseFilter === "all" || tool.license === licenseFilter)
      .filter((tool) =>
        cloudFilters.length === 0 ? true : cloudFilters.every((cloud) => tool.clouds?.includes(cloud)),
      )
      .sort((a, b) => {
        if (sortBy === "stars") return (b.githubStars ?? 0) - (a.githubStars ?? 0);
        if (sortBy === "updated") return (b.lastRelease ?? "").localeCompare(a.lastRelease ?? "");
        return a.name.localeCompare(b.name);
      });
  }, [tools, typeFilter, licenseFilter, cloudFilters, sortBy]);

  const warningTools = tools.filter((tool) => tool.licenseWarning || tool.statusNote);
  const vendorTools = tools.filter((tool) => tool.type === "vendor");
  const openSourceTools = filteredTools.filter((tool) => tool.type !== "vendor");

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-[color:rgba(59,130,246,0.12)] p-3 text-[var(--color-primary)]">
            <Icon size={28} />
          </div>
          <div>
            <h1 className="text-[2rem] font-extrabold leading-tight text-[var(--color-text-primary)]">{title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">{description}</p>
            <div className="mt-3 text-sm text-[var(--color-text-secondary)]">{tools.length} tools in current dataset</div>
          </div>
        </div>
      </section>

      <PlatformCategoryBar category={category} platforms={platforms} />

      <FilterBar
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        cloudFilters={cloudFilters}
        onCloudFiltersChange={setCloudFilters}
        licenseFilter={licenseFilter}
        onLicenseFilterChange={setLicenseFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        availableLicenses={availableLicenses}
      />

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
        <h2 className="text-lg font-semibold">Cloud vendor tools</h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {comparison
            ? "Source-backed side-by-side comparison for the three cloud vendor offerings in this category."
            : "Vendor tool cards shown below. Detailed vendor comparison rows are still being added for this category."}
        </p>

        {comparison ? (
          <div className="mt-5">
            <VendorComparisonTable vendors={comparison.vendors} rows={comparison.rows} />
          </div>
        ) : null}

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {vendorTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
        <h2 className="text-lg font-semibold">Open source and third-party tools</h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{openSourceTools.length} matching tools after filters.</p>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {openSourceTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
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
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
