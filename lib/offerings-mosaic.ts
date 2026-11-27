// Pure layout and matching rules for the offerings mosaic: which tile is how
// prominent, how wide each family block is, and what a lens lights up. No
// React, no DOM, and no runtime imports, so the client island can use it
// without pulling the dataset helpers into the bundle.
import type { VendorProminence } from "./types.ts";

// ── Tile hierarchy ─────────────────────────────────────────────────────────

// anchor: the one solid tile that names a product family. flagship: the other
// headline offerings. core and support follow the data's own prominence.
export type TileTier = "anchor" | "flagship" | "core" | "support";

const TIER_ORDER: Record<TileTier, number> = { anchor: 0, flagship: 1, core: 2, support: 3 };

// Orders a family's offerings for the mosaic, largest first. Only the first
// headline offering may become the anchor, and only when the family is allowed
// one, so a page never carries more solid tiles than product families.
export function familyTiles<T extends { prominence: VendorProminence }>(entries: readonly T[], allowAnchor: boolean): { entry: T; tier: TileTier }[] {
  const lead = allowAnchor ? entries.find((entry) => entry.prominence === "headline") : undefined;
  return entries
    .map((entry) => {
      const tier: TileTier = entry === lead ? "anchor" : entry.prominence === "headline" ? "flagship" : entry.prominence === "standard" ? "core" : "support";
      return { entry, tier };
    })
    .sort((a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier]);
}

// Rough share of a block one tile takes up, in name characters: a headline
// tile is a fixed large slab, the rest grow with their name. Summed per
// family, it sizes the blocks so neighbours end up about equally tall.
export function tileWeight(tier: TileTier, name: string): number {
  if (tier === "anchor" || tier === "flagship") return 40;
  return (name.length + 5) * (tier === "core" ? 1 : 0.8);
}

// ── Family block spans ─────────────────────────────────────────────────────

// Column spans for family blocks laid out `perRow` to a row on a `columns`
// grid. Each row's spans are proportional to its blocks' weights, never below
// `minSpan`, and always add up to `columns`, so no row ends ragged.
export function mosaicSpans(weights: readonly number[], perRow: number, columns = 12, minSpan = 3): number[] {
  const size = Math.max(1, Math.floor(perRow));
  const spans: number[] = [];
  for (let start = 0; start < weights.length; start += size) {
    spans.push(...rowSpans(weights.slice(start, start + size), columns, minSpan));
  }
  return spans;
}

function rowSpans(weights: readonly number[], columns: number, minSpan: number): number[] {
  const floor = Math.min(minSpan, Math.floor(columns / weights.length));
  const total = weights.reduce((sum, weight) => sum + Math.max(weight, 0), 0);
  const exact = weights.map((weight) => (total > 0 ? (Math.max(weight, 0) / total) * columns : columns / weights.length));
  const spans = exact.map((value) => Math.max(floor, Math.floor(value)));
  // Hand out (or take back) whole columns until the row is exactly full:
  // give to the block furthest below its exact share, take from the block
  // furthest above it that can still shrink.
  for (let used = spans.reduce((sum, span) => sum + span, 0); used !== columns; ) {
    const step = used < columns ? 1 : -1;
    let pick = -1;
    for (let index = 0; index < spans.length; index++) {
      if (step < 0 && spans[index] <= floor) continue;
      if (pick < 0 || (exact[index] - spans[index]) * step > (exact[pick] - spans[pick]) * step) pick = index;
    }
    if (pick < 0) break;
    spans[pick] += step;
    used += step;
  }
  return spans;
}

// How many headline tiles fit side by side in a block of `span` grid columns.
export function headsPerRow(span: number): number {
  return Math.max(1, Math.round((span * 5) / 12));
}

// Splits `count` tiles into the fewest rows of at most `maxPerRow`, as evenly
// as possible, shorter rows first: the anchor leads, so it gets the widest
// tiles, and no row is left with a single stray tile under a full one.
export function balancedRows(count: number, maxPerRow: number): number[] {
  if (count <= 0) return [];
  const rows = Math.ceil(count / Math.max(1, Math.floor(maxPerRow)));
  const base = Math.floor(count / rows);
  const extra = count % rows;
  return Array.from({ length: rows }, (_, index) => base + (index >= rows - extra ? 1 : 0));
}

// ── Lens matching ──────────────────────────────────────────────────────────

export type MosaicLens = {
  // Facet the tile must carry ("new", "preview"); empty for any.
  facet: string;
  // Audiences the lens stands for; the tile needs one of them. Empty for any.
  audiences: readonly string[];
  // Lower-cased search words; the tile's text must contain every one.
  terms: readonly string[];
};

export type MosaicTileData = { facets: string; audience: string; search: string };

export function searchTerms(query: string): string[] {
  return query.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

export function lensActive(lens: MosaicLens): boolean {
  return lens.facet !== "" || lens.audiences.length > 0 || lens.terms.length > 0;
}

// Whether a tile stays lit under the lens. `facets` and `audience` are the
// tile's space-separated data attributes; `search` is its lower-cased text.
export function lensMatches(tile: MosaicTileData, lens: MosaicLens): boolean {
  if (lens.facet !== "" && !tile.facets.split(" ").includes(lens.facet)) return false;
  if (lens.audiences.length > 0) {
    const audiences = tile.audience.split(" ");
    if (!lens.audiences.some((audience) => audiences.includes(audience))) return false;
  }
  return lens.terms.every((term) => tile.search.includes(term));
}

// ── Labels ─────────────────────────────────────────────────────────────────

// Short family name for the jump bar: "Claude models" → "Models", "Claude
// Developer Platform" → "Developer Platform". A family that is one capitalised
// word after the flagship is a product name ("Claude Code") and stays whole.
export function familyChipLabel(label: string, flagship: string): string {
  const prefix = `${flagship} `;
  if (!flagship || !label.startsWith(prefix)) return label;
  const rest = label.slice(prefix.length).trim();
  if (!/^\p{L}/u.test(rest)) return label;
  const descriptive = rest[0] === rest[0].toLowerCase() || rest.includes(" ");
  return descriptive ? rest[0].toUpperCase() + rest.slice(1) : label;
}
