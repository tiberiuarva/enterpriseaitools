import { ArrowUpRight, X } from "lucide-react";
import type { VendorDomain, VendorEntry, VendorOverview } from "@/lib/types";
import { AUDIENCE_LABELS, childrenOf, domainCounts, entriesByDomain, entrySearchText } from "@/lib/vendor-overview";
import { catalogFamily, entryFacets, NEW_WINDOW_MONTHS, type CatalogFacet } from "@/lib/vendor-viz";
import { withBasePath } from "@/lib/site";
import { CatalogControls } from "./catalog-controls";
import { SourceLink } from "./primitives";

const STATUS_LABEL: Partial<Record<VendorEntry["status"], string>> = {
  beta: "Beta",
  preview: "Preview",
  "research-preview": "Research preview",
  deprecated: "Deprecated",
  retired: "Retired",
};

function filterAttributes(members: VendorEntry[], today: string) {
  return {
    "data-entry": "",
    "data-facets": [...new Set(members.flatMap((item) => entryFacets(item, today)))].join(" "),
    "data-audience": [...new Set(members.flatMap((item) => item.audience))].join(" "),
    "data-search": members.map(entrySearchText).join(" "),
    "data-weight": String(members.length),
  };
}

// Everything about one offering, shown only when its name is selected. A
// native popover: no script, closes on Escape or a click outside.
function EntryDetail({ entry, kids, family, today, popId }: { entry: VendorEntry; kids: VendorEntry[]; family: string; today: string; popId: string }) {
  const status = STATUS_LABEL[entry.status];
  const isNew = entryFacets(entry, today).includes("new");
  const formerly = (entry.formerNames ?? []).filter((name) => !entry.description.includes(name));
  return (
    <div id={popId} popover="auto" role="dialog" aria-labelledby={`${popId}-title`} className="vo-detail">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-caption uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">{family}</p>
            <h4 id={`${popId}-title`} className="mt-1 text-lg font-semibold leading-snug text-[var(--color-text-primary)]">
              {entry.name}
            </h4>
          </div>
          <button type="button" popoverTarget={popId} popoverTargetAction="hide" className="vo-detail-close" aria-label="Close">
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        {isNew || status ? (
          <p className="flex flex-wrap gap-1.5">
            {isNew ? <span className="vo-badge vo-badge-new">New</span> : null}
            {status ? <span className="vo-badge vo-badge-preview">{status}</span> : null}
          </p>
        ) : null}
        <p className="text-sm leading-6 text-[var(--color-text-secondary)]">{entry.description}</p>
        {entry.licenseWarning ? <p className="text-sm leading-6 text-[var(--color-warning)]">{entry.licenseWarning}</p> : null}
        {kids.length > 0 ? (
          <div>
            <p className="text-caption uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">Includes</p>
            <ul className="mt-1 flex flex-col gap-1.5 text-sm text-[var(--color-text-primary)]">
              {kids.map((kid) => (
                <li key={kid.id} id={`entry-${kid.id}`}>
                  {kid.name}
                  {entryFacets(kid, today).includes("new") ? <span className="vo-badge vo-badge-new ml-1.5">New</span> : null}
                  <span className="block text-caption text-[var(--color-text-tertiary)]">{kid.description}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {formerly.length > 0 ? <p className="text-caption text-[var(--color-text-tertiary)]">Formerly {formerly.join(", ")}</p> : null}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--color-border)] pt-3 text-sm">
          <a
            href={entry.docsUrl ?? entry.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-[var(--color-accent)] px-3.5 py-1.5 font-medium text-[var(--color-text-inverse)] hover:opacity-90"
          >
            Official page
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          {entry.docsUrl && entry.docsUrl !== entry.sourceUrl ? <SourceLink href={entry.sourceUrl} label="Source" /> : null}
          {entry.githubUrl ? <SourceLink href={entry.githubUrl} label={entry.license && !entry.licenseWarning ? `Code · ${entry.license}` : "Code"} /> : null}
          {entry.toolId ? (
            <a href={withBasePath(`/tools/${entry.toolId}`)} className="text-xs font-medium text-[var(--color-accent)] hover:underline">
              Governance profile →
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// One product name. Selecting it opens its detail card.
function EntryName({ entry, kids, family, today }: { entry: VendorEntry; kids: VendorEntry[]; family: string; today: string }) {
  const popId = `detail-${entry.id}`;
  const status = STATUS_LABEL[entry.status];
  const isNew = [entry, ...kids].some((item) => entryFacets(item, today).includes("new"));
  return (
    <li id={`entry-${entry.id}`} {...filterAttributes([entry, ...kids], today)} className="scroll-mt-40">
      <button type="button" popoverTarget={popId} className="vo-name">
        <span className="min-w-0">{entry.name}</span>
        {isNew ? <span className="vo-name-tag vo-name-tag-new">New</span> : status ? <span className="vo-name-tag">{status}</span> : null}
      </button>
      <EntryDetail entry={entry} kids={kids} family={family} today={today} popId={popId} />
    </li>
  );
}

function FamilyTile({ domain, entries, all, count, today }: { domain: VendorDomain; entries: VendorEntry[]; all: VendorEntry[]; count: number; today: string }) {
  const { featured, groups } = catalogFamily(domain, entries);
  const rest = groups.flatMap((group) => group.items);
  const name = (entry: VendorEntry) => <EntryName key={entry.id} entry={entry} kids={childrenOf(all, entry.id)} family={domain.label} today={today} />;
  return (
    <section id={`catalog-${domain.id}`} data-filter-group="" aria-labelledby={`catalog-${domain.id}-heading`} className="vo-tile scroll-mt-40">
      <h3 id={`catalog-${domain.id}-heading`} title={domain.tagline} className="flex items-baseline justify-between gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
        {domain.label}
        <span className="text-caption font-normal tabular-nums text-[var(--color-text-tertiary)]">{count}</span>
      </h3>
      <ul className="flex flex-col">{featured.map(name)}</ul>
      {rest.length > 0 ? (
        <details data-more="" className="group/more">
          <summary className="vo-more">
            <span className="group-open/more:hidden">+{rest.length} more</span>
            <span className="hidden group-open/more:inline">Show fewer</span>
          </summary>
          <ul className="flex flex-col">{rest.map(name)}</ul>
        </details>
      ) : null}
    </section>
  );
}

// How many offerings (rows plus what they include) carry a facet, matching how
// the filter counts what it shows.
function facetCount(rows: VendorEntry[][], facet: CatalogFacet, today: string) {
  return rows.filter((members) => members.some((item) => entryFacets(item, today).includes(facet))).reduce((sum, members) => sum + members.length, 0);
}

const BANDS: { id: string; label: (flagship: string) => string; clusters: VendorDomain["cluster"][] }[] = [
  { id: "products", label: () => "Products", clusters: ["products"] },
  { id: "beyond", label: (flagship) => `Beyond ${flagship}`, clusters: ["ecosystem", "company"] },
];

export function EntryCatalog({ overview, flagship }: { overview: VendorOverview; flagship: string }) {
  const byDomain = entriesByDomain(overview);
  const counts = domainCounts(overview);
  const today = overview.reviewedAt;
  const audiences = [...new Set(overview.entries.flatMap((entry) => entry.audience))].map((id) => ({ id, label: AUDIENCE_LABELS[id] }));
  const rows = [...byDomain.values()].flat().map((entry) => [entry, ...childrenOf(overview.entries, entry.id)]);
  const facets = [
    { id: "new", label: `New in the last ${NEW_WINDOW_MONTHS} months`, count: facetCount(rows, "new", today) },
    { id: "preview", label: "Preview or beta", count: facetCount(rows, "preview", today) },
  ].filter((facet) => facet.count > 0);

  return (
    <div className="flex flex-col gap-6">
      <CatalogControls targetId="catalog-results" total={overview.entries.length} facets={facets} audiences={audiences} />
      <div id="catalog-results" className="flex flex-col gap-8">
        {BANDS.map((band) => {
          const domains = overview.domains.filter((domain) => band.clusters.includes(domain.cluster));
          if (domains.length === 0) return null;
          return (
            <div key={band.id} data-filter-group="" className="flex flex-col gap-3">
              <p className="text-caption uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">{band.label(flagship)}</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
                {domains.map((domain) => (
                  <FamilyTile key={domain.id} domain={domain} entries={byDomain.get(domain.id) ?? []} all={overview.entries} count={counts[domain.id]} today={today} />
                ))}
              </div>
            </div>
          );
        })}
        <p data-empty="" hidden className="rounded-xl border border-dashed border-[var(--color-border)] p-6 text-center text-sm text-[var(--color-text-secondary)]">
          No offerings match. Try another word or clear the filters.
        </p>
      </div>
    </div>
  );
}
