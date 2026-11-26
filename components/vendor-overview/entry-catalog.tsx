import { ChevronDown } from "lucide-react";
import type { VendorDomain, VendorEntry, VendorOverview } from "@/lib/types";
import { AUDIENCE_LABELS, ENTRY_KIND_LABELS, childrenOf, domainCounts, entriesByDomain, entrySearchText } from "@/lib/vendor-overview";
import { withBasePath } from "@/lib/site";
import { CatalogControls } from "./catalog-controls";
import { Chip, SourceLink, StatusBadge } from "./primitives";

function year(date: string | undefined) {
  return date ? date.slice(0, 4) : null;
}

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

function EntryLinks({ entry }: { entry: VendorEntry }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {entry.docsUrl ? <SourceLink href={entry.docsUrl} label="Docs" /> : null}
      <SourceLink href={entry.sourceUrl} label="Source" />
      {entry.githubUrl ? <SourceLink href={entry.githubUrl} label="Code" /> : null}
      {entry.toolId ? (
        <a href={withBasePath(`/tools/${entry.toolId}`)} className="text-xs font-medium text-[var(--color-accent)] hover:underline">
          Governance posture →
        </a>
      ) : null}
    </div>
  );
}

function EntryMeta({ entry }: { entry: VendorEntry }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <StatusBadge status={entry.status} />
      <Chip>{ENTRY_KIND_LABELS[entry.kind]}</Chip>
      {entry.license ? <Chip tone={entry.licenseWarning ? "warning" : "default"}>{entry.license}</Chip> : null}
      {year(entry.launchedAt) ? <span className="text-caption text-[var(--color-text-tertiary)]">Since {year(entry.launchedAt)}</span> : null}
    </div>
  );
}

function ChildList({ items }: { items: VendorEntry[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="mt-3 flex flex-col gap-2 border-l border-[var(--color-border)] pl-3">
      {items.map((child) => (
        <li key={child.id} id={`entry-${child.id}`} className="scroll-mt-40 text-sm">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-medium text-[var(--color-text-primary)]">{child.name}</span>
            <StatusBadge status={child.status} />
          </div>
          <p className="text-xs leading-5 text-[var(--color-text-secondary)]">
            {child.description} <SourceLink href={child.sourceUrl} />
          </p>
        </li>
      ))}
    </ul>
  );
}

function FormerNames({ entry }: { entry: VendorEntry }) {
  return entry.formerNames && entry.formerNames.length > 0 ? (
    <p className="text-caption text-[var(--color-text-tertiary)]">Formerly {entry.formerNames.join(", ")}</p>
  ) : null;
}

function HeadlineCard({ entry, items }: { entry: VendorEntry; items: VendorEntry[] }) {
  return (
    <li id={`entry-${entry.id}`} {...filterAttributes(entry, items)} className="card flex min-w-0 scroll-mt-40 flex-col gap-2.5 p-4">
      <h4 className="text-h3 text-[var(--color-text-primary)]">{entry.name}</h4>
      <FormerNames entry={entry} />
      <EntryMeta entry={entry} />
      <p className="text-sm leading-6 text-[var(--color-text-secondary)]">{entry.description}</p>
      {entry.licenseWarning ? <p className="text-xs leading-5 text-[var(--color-warning)]">{entry.licenseWarning}</p> : null}
      <div className="mt-auto pt-1">
        <EntryLinks entry={entry} />
      </div>
      <ChildList items={items} />
    </li>
  );
}

function EntryRow({ entry, items }: { entry: VendorEntry; items: VendorEntry[] }) {
  return (
    <li id={`entry-${entry.id}`} {...filterAttributes(entry, items)} className="scroll-mt-40 py-3.5">
      <div className="flex flex-col gap-1.5 md:flex-row md:gap-6">
        <div className="md:w-64 md:shrink-0">
          <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">{entry.name}</h4>
          <FormerNames entry={entry} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <EntryMeta entry={entry} />
          <p className="text-sm leading-6 text-[var(--color-text-secondary)]">{entry.description}</p>
          {entry.licenseWarning ? <p className="text-xs leading-5 text-[var(--color-warning)]">{entry.licenseWarning}</p> : null}
          <EntryLinks entry={entry} />
          <ChildList items={items} />
        </div>
      </div>
    </li>
  );
}

function DomainBlock({ domain, entries, all, count }: { domain: VendorDomain; entries: VendorEntry[]; all: VendorEntry[]; count: number }) {
  const groups = [...domain.groups, { id: "", label: "" }]
    .map((group) => ({ group, items: entries.filter((entry) => (entry.groupId ?? "") === group.id) }))
    .filter(({ items }) => items.length > 0);

  return (
    <section id={`catalog-${domain.id}`} data-filter-group="" aria-labelledby={`catalog-${domain.id}-heading`} className="scroll-mt-40">
      <details data-domain-block="" className="group/domain rounded-xl border border-[var(--color-border)]">
        <summary className="flex cursor-pointer list-none items-start gap-3 rounded-xl p-4 transition hover:bg-[var(--color-bg-hover)] sm:p-5 [&::-webkit-details-marker]:hidden">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 id={`catalog-${domain.id}-heading`} className="text-h2 text-[var(--color-text-primary)]">
                {domain.label}
              </h3>
              <span className="text-caption tabular-nums text-[var(--color-text-tertiary)]">{count} offerings</span>
            </div>
            <p className="mt-1 max-w-3xl text-body-sm text-[var(--color-text-secondary)]">{domain.tagline}</p>
          </div>
          <ChevronDown size={20} aria-hidden="true" className="mt-1 shrink-0 text-[var(--color-text-secondary)] transition group-open/domain:rotate-180" />
        </summary>
        <div className="flex flex-col gap-5 border-t border-[var(--color-border)] p-4 sm:p-5">
          <p className="max-w-3xl text-body-sm text-[var(--color-text-secondary)]">{domain.intro}</p>
          {groups.map(({ group, items }) => {
            const headlines = items.filter((entry) => entry.prominence === "headline");
            const standard = items.filter((entry) => entry.prominence === "standard");
            const detail = items.filter((entry) => entry.prominence === "detail");
            return (
              <div key={group.id || "ungrouped"} data-filter-group="">
                {group.label ? <p className="mb-2 text-caption uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">{group.label}</p> : null}
                {headlines.length > 0 ? (
                  <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {headlines.map((entry) => (
                      <HeadlineCard key={entry.id} entry={entry} items={childrenOf(all, entry.id)} />
                    ))}
                  </ul>
                ) : null}
                {standard.length > 0 ? (
                  <ul className="divide-y divide-[var(--color-border)]">
                    {standard.map((entry) => (
                      <EntryRow key={entry.id} entry={entry} items={childrenOf(all, entry.id)} />
                    ))}
                  </ul>
                ) : null}
                {detail.length > 0 ? (
                  <details data-more="" className="group/more">
                    <summary className="inline-flex min-h-9 cursor-pointer list-none items-center gap-1 rounded-full text-sm font-medium text-[var(--color-accent)] hover:underline [&::-webkit-details-marker]:hidden">
                      <ChevronDown size={14} aria-hidden="true" className="transition group-open/more:rotate-180" />
                      <span className="group-open/more:hidden">Show {detail.length} more</span>
                      <span className="hidden group-open/more:inline">Show fewer</span>
                    </summary>
                    <ul className="divide-y divide-[var(--color-border)]">
                      {detail.map((entry) => (
                        <EntryRow key={entry.id} entry={entry} items={childrenOf(all, entry.id)} />
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
