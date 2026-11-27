import { ArrowUpRight, X } from "lucide-react";
import type { CSSProperties } from "react";
import type { VendorDomain, VendorEntry, VendorOverview } from "@/lib/types";
import { balancedRows, familyChipLabel, familyTiles, headsPerRow, mosaicSpans, tileWeight, type TileTier } from "@/lib/offerings-mosaic";
import { AUDIENCE_LABELS, ENTRY_STATUS_LABELS, childrenOf, domainCounts, entriesByDomain, entrySearchText, formatPartialDate } from "@/lib/vendor-overview";
import { entryFacets, LENSES, NEW_WINDOW_MONTHS, type CatalogFacet } from "@/lib/vendor-viz";
import { withBasePath } from "@/lib/site";
import { CatalogControls } from "./catalog-controls";
import { SourceLink } from "./primitives";

// Short status words for the tiles; the detail card spells the status out.
const TILE_STATUS: Partial<Record<VendorEntry["status"], string>> = {
  beta: "Beta",
  preview: "Preview",
  "research-preview": "Preview",
  deprecated: "Deprecated",
  retired: "Retired",
};
const QUIET_STATUSES: readonly VendorEntry["status"][] = ["ga", "active"];

type FamilyTile = { entry: VendorEntry; tier: TileTier };
type Family = { domain: VendorDomain; label: string; count: number; quiet: boolean; span: number; tiles: FamilyTile[] };

function filterAttributes(members: VendorEntry[], today: string) {
  return {
    "data-entry": "",
    "data-facets": [...new Set(members.flatMap((item) => entryFacets(item, today)))].join(" "),
    "data-audience": [...new Set(members.flatMap((item) => item.audience))].join(" "),
    "data-search": members.map(entrySearchText).join(" "),
    "data-weight": String(members.length),
  };
}

// "New" and "Beta" / "Preview", read straight off the tile: no legend needed.
function StatusTags({ entry, today }: { entry: VendorEntry; today: string }) {
  const status = TILE_STATUS[entry.status];
  const isNew = entryFacets(entry, today).includes("new");
  return (
    <>
      {isNew ? <span className="vo-tag vo-tag-new">New</span> : null}
      {status ? <span className="vo-tag vo-tag-pre">{status}</span> : null}
    </>
  );
}

// Everything about one offering, shown only when its tile is selected. A
// native popover: no script, closes on Escape or a click outside.
function EntryDetail({ entry, kids, family, today, popId }: { entry: VendorEntry; kids: VendorEntry[]; family: VendorDomain; today: string; popId: string }) {
  const isNew = entryFacets(entry, today).includes("new");
  const group = family.groups.find((item) => item.id === entry.groupId)?.label;
  const formerly = (entry.formerNames ?? []).filter((name) => !entry.description.includes(name));
  return (
    <div id={popId} popover="auto" role="dialog" aria-labelledby={`${popId}-title`} className="vo-detail">
      <div className="flex flex-col gap-3.5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-caption uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">
              {family.label}
              {group ? ` · ${group}` : ""}
            </p>
            <h4 id={`${popId}-title`} className="mt-1 text-xl font-semibold leading-snug tracking-tight text-[var(--color-text-primary)]">
              {entry.name}
            </h4>
          </div>
          <button type="button" popoverTarget={popId} popoverTargetAction="hide" className="vo-detail-close" aria-label="Close">
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        <p className="flex flex-wrap gap-1.5">
          {isNew ? <span className="vo-badge vo-badge-new">New</span> : null}
          <span className={`vo-badge ${QUIET_STATUSES.includes(entry.status) ? "vo-badge-quiet" : "vo-badge-preview"}`}>{ENTRY_STATUS_LABELS[entry.status]}</span>
        </p>
        <p className="text-sm leading-6 text-[var(--color-text-secondary)]">{entry.description}</p>
        {entry.licenseWarning ? <p className="vo-detail-warn">{entry.licenseWarning}</p> : null}
        <dl className="vo-detail-facts">
          {entry.launchedAt ? (
            <div>
              <dt>Launched</dt>
              <dd>
                <time dateTime={entry.launchedAt}>{formatPartialDate(entry.launchedAt)}</time>
              </dd>
            </div>
          ) : null}
          <div>
            <dt>For</dt>
            <dd>{entry.audience.map((id) => AUDIENCE_LABELS[id]).join(", ")}</dd>
          </div>
          {formerly.length > 0 ? (
            <div>
              <dt>Formerly</dt>
              <dd>{formerly.join(", ")}</dd>
            </div>
          ) : null}
        </dl>
        {kids.length > 0 ? (
          <div>
            <p className="text-caption uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">Includes</p>
            <ul className="vo-minis">
              {kids.map((kid) => (
                <li key={kid.id} id={`entry-${kid.id}`}>
                  <a href={kid.docsUrl ?? kid.sourceUrl} target="_blank" rel="noreferrer" className="vo-mini">
                    <span className="flex items-start justify-between gap-2">
                      <span className="vo-mini-name">{kid.name}</span>
                      <ArrowUpRight size={13} aria-hidden="true" className="mt-0.5 shrink-0 opacity-60" />
                    </span>
                    <span className="vo-mini-desc">{kid.description}</span>
                    <span className="flex flex-wrap gap-1 empty:hidden">
                      <StatusTags entry={kid} today={today} />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--color-border)] pt-3.5 text-sm">
          <a
            href={entry.docsUrl ?? entry.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-9 items-center gap-1 rounded-full bg-[var(--color-accent)] px-4 font-medium text-[var(--color-text-inverse)] hover:opacity-90"
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

// One offering: a tile that carries only its name, its status and how much it
// includes. Selecting it opens the detail card.
// How many headline tiles share a tile's row on each layout.
type RowSize = { desktop: number; tablet: number };

// Below the desktop grid every family block is full width; four headline
// tiles side by side is the most that still leaves room for their names.
const TABLET_HEADS_PER_ROW = 4;

function Tile({ entry, tier, kids, family, today, row }: { entry: VendorEntry; tier: TileTier; kids: VendorEntry[]; family: VendorDomain; today: string; row?: RowSize }) {
  const popId = `detail-${entry.id}`;
  const kidFacets = kids.flatMap((kid) => entryFacets(kid, today));
  const kidTone = kidFacets.includes("new") ? "new" : kidFacets.includes("preview") ? "pre" : undefined;
  return (
    <li id={`entry-${entry.id}`} {...filterAttributes([entry, ...kids], today)} data-tier={tier} className="vo-cell" style={row ? ({ "--row": row.desktop, "--row-t": row.tablet } as CSSProperties) : undefined}>
      <button type="button" popoverTarget={popId} className="vo-mt" data-kids={kids.length > 0 ? "" : undefined}>
        <span className="vo-mt-name">{entry.name}</span>
        <span className="vo-mt-meta">
          <StatusTags entry={entry} today={today} />
          {kids.length > 0 ? (
            <span className="vo-tag vo-tag-kids" data-tone={kidTone}>
              +{kids.length}
              <span className="sr-only"> included</span>
            </span>
          ) : null}
        </span>
      </button>
      <EntryDetail entry={entry} kids={kids} family={family} today={today} popId={popId} />
    </li>
  );
}

function FamilyBlock({ family, all, today }: { family: Family; all: VendorEntry[]; today: string }) {
  const { domain } = family;
  const { tiles } = family;
  const heads = tiles.filter((tile) => tile.tier === "anchor" || tile.tier === "flagship");
  const rest = tiles.filter((tile) => tile.tier === "core" || tile.tier === "support");
  // Each headline tile knows how many share its row, on the desktop grid and
  // on the full-width tablet block, so rows come out balanced instead of
  // leaving one stray tile.
  const rows = balancedRows(heads.length, headsPerRow(family.span));
  const desktop = rows.flatMap((size) => Array.from({ length: size }, () => size));
  const tablet = balancedRows(heads.length, TABLET_HEADS_PER_ROW).flatMap((size) => Array.from({ length: size }, () => size));
  const render = ({ entry, tier }: FamilyTile, row?: RowSize) => (
    <Tile key={entry.id} entry={entry} tier={tier} kids={childrenOf(all, entry.id)} family={domain} today={today} row={row} />
  );
  return (
    <section
      id={`catalog-${domain.id}`}
      data-family={domain.id}
      data-quiet={family.quiet ? "" : undefined}
      aria-labelledby={`catalog-${domain.id}-heading`}
      className="vo-block"
      style={{ "--span": family.span } as CSSProperties}
    >
      <h3 id={`catalog-${domain.id}-heading`} title={domain.tagline} className="vo-block-head">
        {domain.label}
        <span data-family-count={domain.id} data-total={family.count}>
          {family.count}
        </span>
      </h3>
      {heads.length > 0 ? <ul className="vo-heads" style={{ "--rows": rows.length } as CSSProperties}>{heads.map((tile, index) => render(tile, { desktop: desktop[index], tablet: tablet[index] }))}</ul> : null}
      {rest.length > 0 ? <ul className="vo-tiles">{rest.map((tile) => render(tile))}</ul> : null}
    </section>
  );
}

// How many offerings (tiles plus what they include) carry a facet, matching
// how the lens counts what it lights up.
function facetCount(rows: VendorEntry[][], facet: CatalogFacet, today: string) {
  return rows.filter((members) => members.some((item) => entryFacets(item, today).includes(facet))).reduce((sum, members) => sum + members.length, 0);
}

// Product families sit two to a row; the quieter families beyond the product
// line sit three to a row.
const BANDS: { id: string; label: (flagship: string) => string; clusters: VendorDomain["cluster"][]; perRow: number; quiet: boolean }[] = [
  { id: "products", label: () => "Products", clusters: ["products"], perRow: 2, quiet: false },
  { id: "beyond", label: (flagship) => `Beyond ${flagship}`, clusters: ["ecosystem", "company"], perRow: 3, quiet: true },
];

export function EntryCatalog({ overview, flagship }: { overview: VendorOverview; flagship: string }) {
  const byDomain = entriesByDomain(overview);
  const counts = domainCounts(overview);
  const today = overview.reviewedAt;
  const rows = [...byDomain.values()].flat().map((entry) => [entry, ...childrenOf(overview.entries, entry.id)]);
  const facets = [
    { id: "new", label: "New", title: `Launched in the last ${NEW_WINDOW_MONTHS} months`, count: facetCount(rows, "new", today) },
    { id: "preview", label: "Beta or preview", title: "Not generally available yet", count: facetCount(rows, "preview", today) },
  ].filter((facet) => facet.count > 0);
  const lenses = LENSES.filter((lens) => overview.entries.some((entry) => entry.audience.some((audience) => (lens.audiences as readonly string[]).includes(audience)))).map(
    (lens) => ({ id: lens.id, label: lens.label, audiences: [...lens.audiences], alias: lens.catalogAudience }),
  );
  const bands = BANDS.map((band) => {
    const domains = overview.domains.filter((domain) => band.clusters.includes(domain.cluster));
    const tiles = domains.map((domain) => familyTiles(byDomain.get(domain.id) ?? [], !band.quiet));
    // Blocks are sized by what they hold, so neighbours end about level.
    const spans = mosaicSpans(
      tiles.map((family) => family.reduce((sum, tile) => sum + tileWeight(tile.tier, tile.entry.name), 0)),
      band.perRow,
    );
    const families: Family[] = domains.map((domain, index) => ({
      domain,
      label: familyChipLabel(domain.label, flagship),
      count: counts[domain.id] ?? 0,
      quiet: band.quiet,
      span: spans[index],
      tiles: tiles[index],
    }));
    return { ...band, families };
  }).filter((band) => band.families.length > 0);

  return (
    <div data-mosaic="" className="flex flex-col gap-4">
      <CatalogControls targetId="catalog-results" total={overview.entries.length} facets={facets} lenses={lenses} />
      <nav aria-label="Offering families" className="vo-jump">
        {bands.map((band) => (
          <ul key={band.id} aria-label={band.label(flagship)}>
            {band.families.map((family) => (
              <li key={family.domain.id}>
                <a href={`#catalog-${family.domain.id}`} title={family.domain.label}>
                  {family.label}
                  <span data-family-count={family.domain.id} data-total={family.count}>
                    {family.count}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ))}
      </nav>
      <div id="catalog-results" className="vo-bento">
        {bands.map((band) => (
          <div key={band.id} className="contents">
            <p className="vo-band">{band.label(flagship)}</p>
            {band.families.map((family) => (
              <FamilyBlock key={family.domain.id} family={family} all={overview.entries} today={today} />
            ))}
          </div>
        ))}
        <p data-empty="" hidden className="vo-empty">
          Nothing lights up. Try another word or clear the lens.
        </p>
      </div>
    </div>
  );
}
