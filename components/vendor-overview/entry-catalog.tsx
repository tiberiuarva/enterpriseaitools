import { ChevronDown } from "lucide-react";
import type { VendorDomain, VendorEntry, VendorOverview } from "@/lib/types";
import { AUDIENCE_LABELS, ENTRY_KIND_LABELS, childrenOf, domainCounts, entriesByDomain, entrySearchText } from "@/lib/vendor-overview";
import { groupBreakdown } from "@/lib/vendor-viz";
import { withBasePath } from "@/lib/site";
import { CatalogControls } from "./catalog-controls";
import { SourceLink, StatusBadge } from "./primitives";

function filterAttributes(entry: VendorEntry, children: VendorEntry[]) {
  const all = [entry, ...children];
  return {
    "data-entry": "",
    "data-domain": entry.domainId,
    "data-status": [...new Set(all.map((item) => item.status))].join(" "),
    "data-audience": [...new Set(all.flatMap((item) => item.audience))].join(" "),
    "data-search": all.map(entrySearchText).join(" "),
    "data-weight": String(all.length),
  };
}

// One compact card per offering. Repeated ~170 times, so it leans on the short
// .vo-entry* classes in globals.css instead of long utility strings.
function EntryCard({ entry, items }: { entry: VendorEntry; items: VendorEntry[] }) {
  return (
    <li id={`entry-${entry.id}`} data-prominence={entry.prominence} {...filterAttributes(entry, items)} className="vo-entry">
      <h4 className="vo-entry-name">{entry.name}</h4>
      <div className="vo-entry-meta">
        <StatusBadge status={entry.status} />
        <span>{ENTRY_KIND_LABELS[entry.kind]}</span>
        {entry.launchedAt ? <span>since {entry.launchedAt.slice(0, 4)}</span> : null}
        {entry.license ? <span className={entry.licenseWarning ? "text-[var(--color-warning)]" : undefined}>{entry.license}</span> : null}
      </div>
      {entry.formerNames?.length ? <p className="vo-entry-meta">Formerly {entry.formerNames.join(", ")}</p> : null}
      <p className="vo-entry-desc">{entry.description}</p>
      {entry.licenseWarning ? <p className="vo-entry-warn">{entry.licenseWarning}</p> : null}
      {items.length > 0 ? (
        <ul className="vo-entry-kids" aria-label={`Inside ${entry.name}`}>
          {items.map((child) => (
            <li key={child.id} id={`entry-${child.id}`} title={child.description}>
              {child.name}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="vo-entry-meta mt-auto pt-1">
        {entry.docsUrl ? <SourceLink href={entry.docsUrl} label="Docs" /> : null}
        <SourceLink href={entry.sourceUrl} />
        {entry.githubUrl ? <SourceLink href={entry.githubUrl} label="Code" /> : null}
        {entry.toolId ? (
          <a href={withBasePath(`/tools/${entry.toolId}`)} className="font-medium text-[var(--color-accent)] hover:underline">
            Governance →
          </a>
        ) : null}
      </div>
    </li>
  );
}

function FamilyBar({ domain, entries }: { domain: VendorDomain; entries: VendorEntry[] }) {
  const parts = groupBreakdown(domain, entries);
  if (parts.length < 2) return null;
  return (
    <div className="mt-3 flex flex-col gap-1.5" aria-hidden="true">
      <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-full">
        {parts.map((part, index) => (
          <span key={part.id} className="h-full" style={{ width: `${part.share}%`, background: `var(--viz-seq-${(index % 6) + 1})` }} />
        ))}
      </div>
      <p className="hidden flex-wrap gap-x-3 text-[0.6875rem] text-[var(--color-text-tertiary)] md:flex">
        {parts.map((part, index) => (
          <span key={part.id} className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: `var(--viz-seq-${(index % 6) + 1})` }} />
            {part.label} {part.count}
          </span>
        ))}
      </p>
    </div>
  );
}

function DomainBlock({ domain, entries, all, count }: { domain: VendorDomain; entries: VendorEntry[]; all: VendorEntry[]; count: number }) {
  const groups = [...domain.groups, { id: "", label: "" }]
    .map((group) => ({ group, items: entries.filter((entry) => (entry.groupId ?? "") === group.id) }))
    .filter(({ items }) => items.length > 0);
  const tone = domain.cluster === "ecosystem" ? "var(--viz-eco)" : domain.cluster === "company" ? "var(--viz-co)" : "var(--color-accent)";

  return (
    <section id={`catalog-${domain.id}`} data-filter-group="" aria-labelledby={`catalog-${domain.id}-heading`} className="scroll-mt-40">
      <details data-domain-block="" className="group/domain rounded-2xl border border-[var(--color-border)]">
        <summary className="flex cursor-pointer list-none items-start gap-3 rounded-2xl p-4 transition hover:bg-[var(--color-bg-hover)] sm:p-5 [&::-webkit-details-marker]:hidden">
          <span aria-hidden="true" className="mt-1.5 h-3 w-3 shrink-0 rounded-full" style={{ background: tone }} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 id={`catalog-${domain.id}-heading`} className="text-h2 text-[var(--color-text-primary)]">
                {domain.label}
              </h3>
              <span className="text-caption tabular-nums text-[var(--color-text-tertiary)]">{count}</span>
            </div>
            <p className="mt-0.5 max-w-3xl text-body-sm text-[var(--color-text-secondary)]">{domain.tagline}</p>
            <FamilyBar domain={domain} entries={all} />
          </div>
          <ChevronDown size={20} aria-hidden="true" className="mt-1 shrink-0 text-[var(--color-text-secondary)] transition group-open/domain:rotate-180" />
        </summary>
        <div className="flex flex-col gap-5 border-t border-[var(--color-border)] p-4 sm:p-5">
          <p className="max-w-3xl text-body-sm text-[var(--color-text-secondary)]">{domain.intro}</p>
          {groups.map(({ group, items }) => {
            const main = items.filter((entry) => entry.prominence !== "detail");
            const detail = items.filter((entry) => entry.prominence === "detail");
            return (
              <div key={group.id || "ungrouped"} data-filter-group="">
                {group.label ? <p className="mb-2 text-caption uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">{group.label}</p> : null}
                {main.length > 0 ? (
                  <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                    {main.map((entry) => (
                      <EntryCard key={entry.id} entry={entry} items={childrenOf(all, entry.id)} />
                    ))}
                  </ul>
                ) : null}
                {detail.length > 0 ? (
                  <details data-more="" className="group/more mt-2">
                    <summary className="inline-flex min-h-9 cursor-pointer list-none items-center gap-1 rounded-full text-sm font-medium text-[var(--color-accent)] hover:underline [&::-webkit-details-marker]:hidden">
                      <ChevronDown size={14} aria-hidden="true" className="transition group-open/more:rotate-180" />
                      <span className="group-open/more:hidden">Show {detail.length} more</span>
                      <span className="hidden group-open/more:inline">Show fewer</span>
                    </summary>
                    <ul className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                      {detail.map((entry) => (
                        <EntryCard key={entry.id} entry={entry} items={childrenOf(all, entry.id)} />
                      ))}
                    </ul>
                  </details>
                ) : null}
              </div>
            );
          })}
        </div>
      </details>
    </section>
  );
}

export function EntryCatalog({ overview }: { overview: VendorOverview }) {
  const byDomain = entriesByDomain(overview);
  const counts = domainCounts(overview);
  const audiences = [...new Set(overview.entries.flatMap((entry) => entry.audience))].map((id) => ({ id, label: AUDIENCE_LABELS[id] }));

  return (
    <div className="flex flex-col gap-6">
      <CatalogControls
        targetId="catalog-results"
        total={overview.entries.length}
        domains={overview.domains.map((domain) => ({ id: domain.id, label: domain.label, count: counts[domain.id] }))}
        audiences={audiences}
      />
      <div id="catalog-results" className="flex flex-col gap-3">
        {overview.domains.map((domain) => (
          <DomainBlock key={domain.id} domain={domain} entries={byDomain.get(domain.id) ?? []} all={overview.entries} count={counts[domain.id]} />
        ))}
        <p data-empty="" hidden className="rounded-xl border border-dashed border-[var(--color-border)] p-6 text-center text-sm text-[var(--color-text-secondary)]">
          No offerings match these filters.
        </p>
      </div>
    </div>
  );
}
