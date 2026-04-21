import type { ComparisonRow } from "@/lib/category-comparisons";

export function VendorComparisonTable({
  vendors,
  rows,
}: {
  vendors: [string, string, string];
  rows: ComparisonRow[];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] [content-visibility:auto] [contain-intrinsic-size:1200px]">
      <table className="min-w-full border-collapse text-sm">
        <caption className="sr-only">Comparison table for {vendors.join(", ")}</caption>
        <thead>
          <tr className="bg-[var(--color-bg-surface)] text-left">
            <th scope="col" className="sticky left-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3 font-semibold text-[var(--color-text-primary)]">
              Attribute
            </th>
            {vendors.map((vendor) => (
              <th scope="col" key={vendor} className="border-b border-[var(--color-border)] px-4 py-3 font-semibold text-[var(--color-text-primary)]">
                {vendor}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.attribute} className={index % 2 === 0 ? "bg-[var(--color-bg-card)]" : "bg-[var(--color-bg-surface)]/40"}>
              <th scope="row" className="sticky left-0 border-b border-[var(--color-border)] bg-inherit px-4 py-3 text-left font-medium text-[var(--color-text-primary)]">
                {row.attribute}
              </th>
              {row.values.map((value, valueIndex) => (
                <td key={`${row.attribute}-${valueIndex}`} className="border-b border-[var(--color-border)] px-4 py-3 text-[var(--color-text-secondary)]">
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
