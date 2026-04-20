import { ToolCard } from "@/components/tool-card";
import { VendorComparisonTable } from "@/components/vendor-comparison-table";
import type { CategoryComparison } from "@/lib/category-comparisons";
import type { Tool } from "@/lib/types";

type VendorToolsSectionProps = {
  vendorTools: Tool[];
  comparison?: CategoryComparison;
  description: string;
  showComparison?: boolean;
  showToolCards?: boolean;
  clearFiltersLabel?: string;
  onClearFilters?: () => void;
};

export function VendorToolsSection({
  vendorTools,
  comparison,
  description,
  showComparison = false,
  showToolCards = true,
  clearFiltersLabel,
  onClearFilters,
}: VendorToolsSectionProps) {
  if (!showComparison && (!showToolCards || vendorTools.length === 0)) return null;

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 [content-visibility:auto] [contain-intrinsic-size:960px]">
      <h2 className="text-lg font-semibold">Cloud vendor tools</h2>
      <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--color-text-secondary)]">{description}</p>
        {clearFiltersLabel && onClearFilters ? (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-primary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            {clearFiltersLabel}
          </button>
        ) : null}
      </div>

      {showComparison && comparison ? (
        <div className="mt-5">
          <VendorComparisonTable vendors={comparison.vendors} rows={comparison.rows} />
        </div>
      ) : null}

      {showToolCards ? (
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {vendorTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} compact />
          ))}
        </div>
      ) : null}
    </section>
  );
}
