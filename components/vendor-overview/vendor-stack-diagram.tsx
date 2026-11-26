import { ArrowRight } from "lucide-react";
import type { VendorCluster, VendorOverview } from "@/lib/types";
import { domainCounts, headlineEntries } from "@/lib/vendor-overview";
import { getPlatformFragmentId } from "@/lib/platform-fragments";
import { withBasePath } from "@/lib/site";

const ROWS: { cluster: VendorCluster; label: string; caption?: string }[] = [
  { cluster: "products", label: "Products", caption: "Models power the platform; Claude Code and the apps are built on it; industry solutions package them for sectors." },
  { cluster: "ecosystem", label: "Ecosystem", caption: "Open standards, research, safety policy and programs that surround the products." },
  { cluster: "company", label: "Company" },
];

const GRID: Record<VendorCluster, string> = {
  products: "sm:grid-cols-2 lg:grid-cols-5",
  ecosystem: "sm:grid-cols-2 lg:grid-cols-4",
  company: "grid-cols-1",
};

// The vendor's whole offering as one framed diagram: product families as peer
// tiles, grouped into rows, with the distribution channels underneath. Plain
// nested lists so it reads in order without CSS and to screen readers.
export function VendorStackDiagram({ overview }: { overview: VendorOverview }) {
  const counts = domainCounts(overview);
  const channels = overview.availability.filter((item) => item.channel !== "partner");
  const partners = overview.availability.filter((item) => item.channel === "partner");

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl border border-[var(--color-border-strong)] p-3 sm:p-4">
        <p className="px-1 pb-3 text-caption uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">The {overview.name} stack</p>
        <ul className="flex flex-col gap-3">
          {ROWS.map((row) => {
            const domains = overview.domains.filter((domain) => domain.cluster === row.cluster);
            if (domains.length === 0) return null;
            return (
              <li key={row.cluster} className="rounded-xl bg-[var(--color-bg-primary)] p-3 sm:p-4">
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="text-h3 text-[var(--color-text-primary)]">{row.label}</h3>
                  {row.caption ? <p className="text-caption text-[var(--color-text-secondary)]">{row.caption}</p> : null}
                </div>
                <ul className={`grid grid-cols-1 gap-2.5 ${GRID[row.cluster]}`} aria-label={`${row.label} families`}>
                  {domains.map((domain) => {
                    const headlines = headlineEntries(overview.entries, domain.id, row.cluster === "company" ? 4 : 3);
                    return (
                      <li key={domain.id} className="card flex min-w-0 flex-col gap-2 p-3.5">
                        <div className="flex items-baseline justify-between gap-2">
                          <a href={`#catalog-${domain.id}`} className="text-sm font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-accent)]">
                            {domain.label}
                          </a>
                          <span className="shrink-0 text-caption tabular-nums text-[var(--color-text-tertiary)]">{counts[domain.id]}</span>
                        </div>
                        <p className="text-xs leading-5 text-[var(--color-text-secondary)]">{domain.tagline}</p>
                        <ul className={`mt-auto flex min-w-0 flex-wrap gap-1.5 pt-1 ${row.cluster === "company" ? "" : ""}`} aria-label={`Highlights in ${domain.label}`}>
                          {headlines.map((entry) => (
                            <li key={entry.id} className="min-w-0">
                              <a
                                href={`#entry-${entry.id}`}
                                className="block max-w-full truncate rounded-full border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-secondary)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                              >
                                {entry.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                        <a href={`#catalog-${domain.id}`} className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-accent)] hover:underline">
                          View all {counts[domain.id]}
                          <ArrowRight size={12} aria-hidden="true" />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="flex flex-col gap-2 rounded-2xl border-l-4 border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
        <p className="shrink-0 text-h3 text-[var(--color-text-primary)] sm:w-28">Runs on</p>
        <ul className="flex flex-wrap gap-2" aria-label="Where to run Claude">
          {channels.map((item) => (
            <li key={item.id}>
              <a
                href={item.platformId ? withBasePath(`/platforms#${getPlatformFragmentId(item.platformId)}`) : "#availability"}
                className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-primary)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              >
                {item.name}
              </a>
            </li>
          ))}
          {partners.length > 0 ? (
            <li>
              <a href="#availability" className="inline-flex rounded-full px-3 py-1.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]">
                + {partners.length} partner products
              </a>
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
