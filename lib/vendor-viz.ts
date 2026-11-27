// Pure layout math for the vendor overview visuals (isometric stack, model
// map, price ladder, timeline density, orbit). No React, no DOM: every function
// takes overview data and returns numbers the components draw.
import type {
  GovernanceStatus,
  VendorAvailability,
  VendorDomain,
  VendorEntry,
  VendorGovernanceRow,
  VendorModel,
  VendorOverview,
  VendorTimelineEvent,
  VendorTimelineType,
} from "./types.ts";

// ── Isometric projection ───────────────────────────────────────────────────

const COS30 = Math.sqrt(3) / 2;
const SIN30 = 0.5;

export type Point = [number, number];
export type Box = { x: number; y: number; z: number; w: number; d: number; h: number };
export type Prism = { top: string; left: string; right: string };

const round = (value: number) => Math.round(value * 10) / 10;

// World (x right-back, y left-back, z up) to screen.
export function isoPoint(x: number, y: number, z: number): Point {
  return [round((x - y) * COS30), round((x + y) * SIN30 - z)];
}

const points = (list: Point[]) => list.map(([px, py]) => `${px},${py}`).join(" ");

// The three faces a viewer sees of an axis-aligned box: top, front-left
// (the y + d plane) and front-right (the x + w plane).
export function isoPrism({ x, y, z, w, d, h }: Box): Prism {
  const t = z + h;
  return {
    top: points([isoPoint(x, y, t), isoPoint(x + w, y, t), isoPoint(x + w, y + d, t), isoPoint(x, y + d, t)]),
    left: points([isoPoint(x, y + d, z), isoPoint(x + w, y + d, z), isoPoint(x + w, y + d, t), isoPoint(x, y + d, t)]),
    right: points([isoPoint(x + w, y, z), isoPoint(x + w, y + d, z), isoPoint(x + w, y + d, t), isoPoint(x + w, y, t)]),
  };
}

function prismBounds({ x, y, z, w, d, h }: Box) {
  const corners: Point[] = [];
  for (const cx of [x, x + w]) for (const cy of [y, y + d]) for (const cz of [z, z + h]) corners.push(isoPoint(cx, cy, cz));
  return corners;
}

// Bounding viewBox around a set of boxes, padded on every side.
export function prismsViewBox(boxes: readonly Box[], pad = 8): { x: number; y: number; width: number; height: number } {
  const all = boxes.flatMap(prismBounds);
  const minX = Math.min(...all.map(([px]) => px)) - pad;
  const minY = Math.min(...all.map(([, py]) => py)) - pad;
  return {
    x: round(minX),
    y: round(minY),
    width: round(Math.max(...all.map(([px]) => px)) + pad - minX),
    height: round(Math.max(...all.map(([, py]) => py)) + pad - minY),
  };
}

// Push label y positions apart (top to bottom) so no two are closer than gap.
export function spreadLabels(ys: readonly number[], gap: number): number[] {
  const order = ys.map((y, index) => ({ y, index })).sort((a, b) => a.y - b.y);
  const placed: number[] = new Array(ys.length);
  let last = -Infinity;
  for (const item of order) {
    const y = Math.max(item.y, last + gap);
    placed[item.index] = y;
    last = y;
  }
  return placed;
}

// ── The stack tower ────────────────────────────────────────────────────────

export type TowerSlab = {
  domainId: string;
  slot: number;
  level: number;
  faces: Prism;
  anchor: Point;
  label: Point;
};

export type TowerDot = { domainId: string; at: Point };

export type TowerLayout = {
  viewBox: { x: number; y: number; width: number; height: number };
  base: Prism;
  baseAnchor: Point;
  baseLabel: Point;
  ecoAnchor: Point;
  ecoLabel: Point;
  studs: Point[];
  ring: { cx: number; cy: number; rx: number; ry: number };
  dots: TowerDot[];
  slabs: TowerSlab[];
  labelX: number;
  // Share of the viewBox width taken by the drawing (without the label gutter).
  drawingShare: number;
};

// Product families stack bottom-up in data order. The first two and the last
// each take a level; families in between share levels two at a time, so a
// five-family stack reads models → platform → (code | apps) → solutions.
export function stackLevels(domainIds: readonly string[]): string[][] {
  if (domainIds.length <= 3) return domainIds.map((id) => [id]);
  const levels: string[][] = [[domainIds[0]], [domainIds[1]]];
  const middle = domainIds.slice(2, -1);
  for (let index = 0; index < middle.length; index += 2) levels.push(middle.slice(index, index + 2));
  levels.push([domainIds[domainIds.length - 1]]);
  return levels;
}

const PLATE = 260;
const PLATE_H = 10;
const SLAB_H = 30;
const SLAB_GAP = 24;
const SHRINK = 26;
const PAIR_GAP = 14;
const RING_R = 196;
const LABEL_GUTTER = 270;
const LABEL_GAP = 54;

export function towerLayout(overview: Pick<VendorOverview, "domains" | "availability">): TowerLayout {
  const products = overview.domains.filter((domain) => domain.cluster === "products").map((domain) => domain.id);
  const ecosystem = overview.domains.filter((domain) => domain.cluster === "ecosystem").map((domain) => domain.id);
  const levels = stackLevels(products);
  const center = PLATE / 2;

  const baseBox: Box = { x: 0, y: 0, z: 0, w: PLATE, d: PLATE, h: PLATE_H };
  const boxes: { domainId: string; level: number; box: Box }[] = [];
  levels.forEach((ids, level) => {
    const size = PLATE - 30 - level * SHRINK;
    const z = PLATE_H + SLAB_GAP + level * (SLAB_H + SLAB_GAP);
    const origin = center - size / 2;
    if (ids.length === 1) {
      boxes.push({ domainId: ids[0], level, box: { x: origin, y: origin, z, w: size, d: size, h: SLAB_H } });
    } else {
      const half = (size - PAIR_GAP) / 2;
      ids.forEach((id, index) => {
        // Split front/back (along y) so each half keeps a visible right-hand
        // corner for its leader line; the back half is drawn first.
        boxes.push({ domainId: id, level, box: { x: origin, y: origin + index * (half + PAIR_GAP), z, w: size, d: half, h: SLAB_H } });
      });
    }
  });

  // Studs: one per channel you can buy Claude through directly or in a cloud.
  const studCount = overview.availability.filter((item) => item.channel !== "partner").length;
  const studs: Point[] = Array.from({ length: studCount }, (_, index) => {
    const t = (index + 0.5) / Math.max(studCount, 1);
    return isoPoint(12 + t * (PLATE - 24), PLATE - 10, PLATE_H);
  });

  // Ecosystem dots sit on the front arc of a ground ring around the plate.
  const angles = ecosystem.map((_, index) => -25 + (index * 150) / Math.max(ecosystem.length - 1, 1));
  const dots: TowerDot[] = ecosystem.map((domainId, index) => {
    const radians = (angles[index] * Math.PI) / 180;
    return { domainId, at: isoPoint(center + RING_R * Math.cos(radians), center + RING_R * Math.sin(radians), 0) };
  });
  const [ringCx, ringCy] = isoPoint(center, center, 0);
  const ring = { cx: ringCx, cy: ringCy, rx: round(RING_R * Math.SQRT2 * COS30), ry: round(RING_R * Math.SQRT2 * SIN30) };

  const all: Point[] = [...prismBounds(baseBox), ...boxes.flatMap(({ box }) => prismBounds(box))];
  all.push([ring.cx - ring.rx, ring.cy], [ring.cx + ring.rx, ring.cy], [ring.cx, ring.cy + ring.ry]);
  const minX = Math.min(...all.map(([px]) => px)) - 12;
  const maxX = Math.max(...all.map(([px]) => px));
  const minY = Math.min(...all.map(([, py]) => py)) - 28;
  const maxY = Math.max(...all.map(([, py]) => py)) + 16;
  const labelX = maxX + 40;

  // Anchor each label at the slab's right-hand top corner, then spread.
  const anchors = boxes.map(({ box }) => isoPoint(box.x + box.w, box.y, box.z + box.h));
  const baseAnchor = isoPoint(PLATE, PLATE / 2, PLATE_H);
  const ecoAnchor: Point = dots.length > 0 ? dots.reduce((best, dot) => (dot.at[0] > best[0] ? dot.at : best), dots[0].at) : [maxX, ring.cy];
  const spread = spreadLabels([...anchors.map(([, py]) => py), baseAnchor[1], ecoAnchor[1]], LABEL_GAP);

  const slabs: TowerSlab[] = boxes.map(({ domainId, level, box }, index) => ({
    domainId,
    level,
    slot: index + 1,
    faces: isoPrism(box),
    anchor: anchors[index],
    label: [labelX, round(spread[index])],
  }));

  const height = Math.max(maxY, ...spread.map((y) => y + LABEL_GAP / 2)) - minY;
  return {
    viewBox: { x: round(minX), y: round(minY), width: round(labelX + LABEL_GUTTER - minX), height: round(height) },
    base: isoPrism(baseBox),
    baseAnchor,
    baseLabel: [labelX, round(spread[spread.length - 2])],
    ecoAnchor,
    ecoLabel: [labelX, round(spread[spread.length - 1])],
    studs,
    ring,
    dots,
    slabs,
    labelX,
    drawingShare: round((maxX + 40 - minX) / (labelX + LABEL_GUTTER - minX)),
  };
}

// Percent position of a point inside a viewBox (for HTML overlays).
export function toPercent(point: Point, viewBox: TowerLayout["viewBox"]): { left: number; top: number } {
  return {
    left: round(((point[0] - viewBox.x) / viewBox.width) * 100),
    top: round(((point[1] - viewBox.y) / viewBox.height) * 100),
  };
}

// The vendor's flagship product line, named after its model family ("Claude
// models" → "Claude"), so page copy can say "ways to get Claude" without
// hardcoding a vendor. Falls back to the vendor name.
export function flagshipName(overview: Pick<VendorOverview, "name" | "domains">): string {
  const models = overview.domains.find((domain) => domain.cluster === "products" && / models$/i.test(domain.label));
  return models ? models.label.replace(/ models$/i, "") : overview.name;
}

// ── Audience lens ──────────────────────────────────────────────────────────

// The lens ids are mirrored by static :has(#lens-<id>:checked) rules in
// app/globals.css (search "Audience lens"); add a rule there for any new id.
export const LENSES = [
  { id: "developers", label: "Developers", audiences: ["developers"], catalogAudience: "developers" },
  { id: "enterprise", label: "Enterprise & IT", audiences: ["enterprise", "admins"], catalogAudience: "enterprise" },
  { id: "everyone", label: "Everyday users", audiences: ["everyone"], catalogAudience: "everyone" },
  { id: "researchers", label: "Researchers", audiences: ["researchers"], catalogAudience: "researchers" },
  { id: "public", label: "Public sector & education", audiences: ["public-sector", "education"], catalogAudience: "public-sector" },
] as const;

export type LensId = (typeof LENSES)[number]["id"];

export type LensCounts = { total: number; byLens: Record<LensId, number> };

// Per family: how many offerings each lens covers (children included).
export function audienceLens(entries: readonly Pick<VendorEntry, "domainId" | "audience">[]): {
  domains: Map<string, LensCounts>;
  totals: Record<LensId, number>;
} {
  const empty = (): Record<LensId, number> => ({ developers: 0, enterprise: 0, everyone: 0, researchers: 0, public: 0 });
  const domains = new Map<string, LensCounts>();
  const totals = empty();
  for (const entry of entries) {
    const counts = domains.get(entry.domainId) ?? { total: 0, byLens: empty() };
    counts.total += 1;
    for (const lens of LENSES) {
      if (lens.audiences.some((audience) => (entry.audience as readonly string[]).includes(audience))) {
        counts.byLens[lens.id] += 1;
        totals[lens.id] += 1;
      }
    }
    domains.set(entry.domainId, counts);
  }
  return { domains, totals };
}

// Opacity strength for a family under a lens: share of its offerings that
// match, curved so a family that is mostly relevant still stands apart from
// one that is barely relevant. Never fully invisible.
export function lensStrength(count: number, total: number): number {
  if (total <= 0 || count <= 0) return 0.1;
  return Math.max(0.1, round(Math.pow(count / total, 0.8) * 100) / 100);
}

// ── Catalog directory ──────────────────────────────────────────────────────

export type CatalogFacet = "new" | "preview";
export const PREVIEW_STATUSES: readonly string[] = ["beta", "preview", "research-preview"];
// Launches inside this window, counted in whole calendar months, show as new.
export const NEW_WINDOW_MONTHS = 3;

// Whole calendar months from a month-precise date to `today`; undefined for
// year-only dates, which cannot say whether something is recent.
export function monthsSince(date: string, today: string): number | undefined {
  if (!/^\d{4}-\d{2}/.test(date) || !/^\d{4}-\d{2}/.test(today)) return undefined;
  return (Number(today.slice(0, 4)) - Number(date.slice(0, 4))) * 12 + Number(today.slice(5, 7)) - Number(date.slice(5, 7));
}

export function entryFacets(entry: Pick<VendorEntry, "status" | "launchedAt">, today: string): CatalogFacet[] {
  const facets: CatalogFacet[] = [];
  const age = entry.launchedAt ? monthsSince(entry.launchedAt, today) : undefined;
  if (age !== undefined && age >= 0 && age <= NEW_WINDOW_MONTHS) facets.push("new");
  if (PREVIEW_STATUSES.includes(entry.status)) facets.push("preview");
  return facets;
}

// A family's catalog layout: headline entries up front (or the first three
// when none are marked), the rest grouped by the family's own groups.
export function catalogFamily<T extends Pick<VendorEntry, "prominence" | "groupId">>(
  domain: Pick<VendorDomain, "groups">,
  entries: readonly T[],
): { featured: T[]; groups: { id: string; label: string; items: T[] }[] } {
  const headline = entries.filter((entry) => entry.prominence === "headline");
  const featured = headline.length > 0 ? headline : entries.slice(0, 3);
  const rest = entries.filter((entry) => !featured.includes(entry));
  const groups = [...domain.groups, { id: "", label: "" }]
    .map((group) => ({ id: group.id, label: group.label, items: rest.filter((entry) => (entry.groupId ?? "") === group.id) }))
    .filter((group) => group.items.length > 0);
  return { featured, groups };
}

// ── Model subway map ───────────────────────────────────────────────────────

const DAY = 86_400_000;
const toTime = (date: string) => Date.parse(date.length === 7 ? `${date}-01` : date);

export type Station = { model: VendorModel; x: number; label: string };
export type Lane = { tier: string; start: number; end: number; stations: Station[]; live: boolean };
export type ModelMap = {
  today: number;
  lanes: Lane[];
  ticks: { year: string; x: number }[];
  interchanges: { x: number; tiers: string[] }[];
};

// "Opus 4.5" → "4.5"; "Sonnet 3.5 (Oct 2024)" → "3.5 Oct"
export function stationLabel(model: Pick<VendorModel, "name" | "tier">): string {
  const short = model.name.replace(/^Claude\s+/, "").replace(new RegExp(`^${model.tier}\\s*`), "");
  return (short || model.name).replace(/\s*\((\w{3})\w*\s+\d{4}\)$/, " $1");
}

export function modelMap(models: readonly VendorModel[], today: string): ModelMap {
  if (models.length === 0) return { today: 0, lanes: [], ticks: [], interchanges: [] };
  const start = Math.min(...models.map((model) => toTime(model.releasedAt)));
  const firstYear = new Date(start).getUTCFullYear();
  const t0 = Date.UTC(firstYear, 0, 1);
  const t1 = toTime(today) + 30 * DAY;
  const x = (time: number) => round(((time - t0) / (t1 - t0)) * 100);

  const tiers: string[] = [];
  for (const model of models) if (!tiers.includes(model.tier)) tiers.push(model.tier);

  const lanes: Lane[] = tiers.map((tier) => {
    const items = models.filter((model) => model.tier === tier).sort((a, b) => a.releasedAt.localeCompare(b.releasedAt));
    const live = items.some((model) => model.status !== "retired");
    const ends = items.map((model) => toTime(model.retiresAt ?? model.releasedAt));
    return {
      tier,
      live,
      start: x(toTime(items[0].releasedAt)),
      end: live ? x(toTime(today)) : x(Math.max(...ends)),
      stations: items.map((model) => ({ model, x: x(toTime(model.releasedAt)), label: stationLabel(model) })),
    };
  });

  const byDate = new Map<string, Set<string>>();
  for (const model of models) byDate.set(model.releasedAt, (byDate.get(model.releasedAt) ?? new Set()).add(model.tier));
  const interchanges = [...byDate.entries()]
    .filter(([, set]) => set.size > 1)
    .map(([date, set]) => ({ x: x(toTime(date)), tiers: tiers.filter((tier) => set.has(tier)) }))
    .sort((a, b) => a.x - b.x);

  const lastYear = new Date(toTime(today)).getUTCFullYear();
  const ticks = [];
  for (let year = firstYear; year <= lastYear; year += 1) ticks.push({ year: String(year), x: x(Date.UTC(year, 0, 1)) });

  return { today: x(toTime(today)), lanes, ticks, interchanges };
}

// ── Price ladder ───────────────────────────────────────────────────────────

export type PriceRow = {
  model: VendorModel;
  input: number;
  output: number;
  inputPct: number;
  outputPct: number;
  previous?: { name: string; inputPct: number; outputPct: number; input: number; output: number };
};

export function priceLadder(models: readonly VendorModel[]): { rows: PriceRow[]; max: number; sharedContext?: string; sharedOutput?: string } {
  const current = models.filter((model) => model.status === "current" && model.pricing).sort((a, b) => (b.pricing?.outputPerMTok ?? 0) - (a.pricing?.outputPerMTok ?? 0));
  const priorOf = (model: VendorModel) =>
    models
      .filter((other) => other.tier === model.tier && other.pricing && other.releasedAt < model.releasedAt)
      .sort((a, b) => b.releasedAt.localeCompare(a.releasedAt))[0];
  // The scale covers the previous prices too, so "was" ticks stay on the track.
  const max = Math.max(1, ...current.flatMap((model) => [model.pricing?.outputPerMTok ?? 0, priorOf(model)?.pricing?.outputPerMTok ?? 0]));
  const pct = (value: number) => round((value / max) * 100);
  const rows = current.map((model) => {
    const pricing = model.pricing!;
    const prior = priorOf(model);
    return {
      model,
      input: pricing.inputPerMTok,
      output: pricing.outputPerMTok,
      inputPct: pct(pricing.inputPerMTok),
      outputPct: pct(pricing.outputPerMTok),
      previous: prior?.pricing
        ? {
            name: prior.name,
            input: prior.pricing.inputPerMTok,
            output: prior.pricing.outputPerMTok,
            inputPct: pct(prior.pricing.inputPerMTok),
            outputPct: pct(prior.pricing.outputPerMTok),
          }
        : undefined,
    };
  });
  const contexts = new Set(current.map((model) => model.contextWindow));
  const outputs = new Set(current.map((model) => model.maxOutput));
  return {
    rows,
    max,
    sharedContext: contexts.size === 1 ? [...contexts][0] : undefined,
    sharedOutput: outputs.size === 1 ? [...outputs][0] : undefined,
  };
}

// ── Channels, governance ───────────────────────────────────────────────────

export const CHANNEL_GROUPS = [
  { id: "direct", label: "Direct from Anthropic", short: "Direct" },
  { id: "cloud", label: "Inside your cloud", short: "Your cloud" },
  { id: "partner", label: "Inside partner products", short: "Partner products" },
] as const;

export function availabilityByChannel(items: readonly VendorAvailability[]) {
  return CHANNEL_GROUPS.map((group) => ({ ...group, items: items.filter((item) => item.channel === group.id) })).filter((group) => group.items.length > 0);
}

const GOVERNANCE_ORDER: GovernanceStatus[] = ["yes", "partial", "no", "unknown", "not-applicable"];

export function governanceSummary(rows: readonly VendorGovernanceRow[]) {
  const counts: Record<GovernanceStatus, number> = { yes: 0, partial: 0, no: 0, unknown: 0, "not-applicable": 0 };
  for (const row of rows) counts[row.claim.status] += 1;
  const ordered = [...rows].sort((a, b) => GOVERNANCE_ORDER.indexOf(a.claim.status) - GOVERNANCE_ORDER.indexOf(b.claim.status));
  return { counts, ordered };
}

// ── Timeline density ───────────────────────────────────────────────────────

export const TIMELINE_FAMILIES = [
  { id: "models", label: "Models", types: ["model", "deprecation"] },
  { id: "products", label: "Products & platform", types: ["product", "platform", "enterprise"] },
  { id: "safety", label: "Safety & research", types: ["safety-policy", "research"] },
  { id: "company", label: "Company & ecosystem", types: ["company", "partnership", "program", "open-source"] },
] as const satisfies readonly { id: string; label: string; types: readonly VendorTimelineType[] }[];

export type TimelineFamilyId = (typeof TIMELINE_FAMILIES)[number]["id"];

export function timelineFamily(type: VendorTimelineType): TimelineFamilyId {
  return TIMELINE_FAMILIES.find((family) => (family.types as readonly VendorTimelineType[]).includes(type))?.id ?? "company";
}

export type DensityYear = {
  year: string;
  count: number;
  quarters: { quarter: number; events: { id: string; family: TimelineFamilyId; high: boolean; title: string }[] }[];
};

// One column per quarter, oldest first; events stack in date order.
export function timelineDensity(events: readonly VendorTimelineEvent[]): DensityYear[] {
  if (events.length === 0) return [];
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const first = Number(sorted[0].date.slice(0, 4));
  const last = Number(sorted[sorted.length - 1].date.slice(0, 4));
  const years: DensityYear[] = [];
  for (let year = first; year <= last; year += 1) {
    years.push({ year: String(year), count: 0, quarters: [1, 2, 3, 4].map((quarter) => ({ quarter, events: [] })) });
  }
  for (const event of sorted) {
    const year = years[Number(event.date.slice(0, 4)) - first];
    const month = Number(event.date.slice(5, 7)) || 1;
    year.count += 1;
    year.quarters[Math.floor((month - 1) / 3)].events.push({ id: event.id, family: timelineFamily(event.type), high: event.impact === "high", title: event.title });
  }
  return years;
}


// ── Summaries ──────────────────────────────────────────────────────────────

// FAQ ids the overview page asks as section headings or inline sub-questions
// (models, plans, where to run, training data, EU residency).
export const SECTION_FAQ_IDS = ["best-model", "plans", "where-run", "training-data", "eu-residency"] as const;

// FAQs the page already asks as section headings, and the rest.
export function splitFaqs<T extends { id: string }>(faqs: readonly T[], asked: readonly string[] = SECTION_FAQ_IDS): { asked: T[]; more: T[] } {
  return { asked: faqs.filter((faq) => asked.includes(faq.id)), more: faqs.filter((faq) => !asked.includes(faq.id)) };
}

// ── Copy helpers ──────────────────────────────────────────────────────────

// Percent change from an earlier price, rounded; 0 when unchanged.
export function priceDelta(now: number, before: number): number {
  if (before <= 0) return 0;
  return Math.round(((now - before) / before) * 100);
}

// The first n sentences of a paragraph. A sentence ends at ".", "!" or "?"
// followed by a space and a capital, so "$0.10" or "v3.4" never split.
export function firstSentences(text: string, count = 1): string {
  const parts = text.split(/(?<=[.!?])\s+(?=[A-Z])/);
  return parts.slice(0, count).join(" ");
}

// Monthly list prices of plain "$N" or "$N/mo" plans in the given segments.
export function planPriceRange(plans: readonly Pick<VendorOverview["plans"][number], "price" | "segment">[], segments: readonly string[]) {
  const prices = plans.filter((plan) => segments.includes(plan.segment)).flatMap((plan) => {
    const monthly = monthlyPrice(plan.price);
    return monthly === undefined ? [] : [monthly];
  });
  return prices.length > 0 ? { min: Math.min(...prices), max: Math.max(...prices) } : undefined;
}

// A section's lead line from the FAQ that belongs to it: its question, the
// first sentence of the answer and the answer's first source.
export function faqLead(faqs: readonly VendorOverview["faqs"][number][], id: string) {
  const faq = faqs.find((item) => item.id === id);
  return faq ? { question: faq.question, lead: firstSentences(faq.answer, 1), sourceUrl: faq.sourceUrls[0] } : undefined;
}

// ── Plans staircase and roadmap buckets ───────────────────────────────────

// Monthly list price of a plain "$N" or "$N/mo" plan, else undefined.
export function monthlyPrice(price: string): number | undefined {
  const match = /^\$(\d+(?:\.\d+)?)(?:\/mo)?$/.exec(price.trim());
  return match ? Number(match[1]) : undefined;
}

// Plans in the given segments that have a plain monthly price, cheapest first,
// each with a step height: a floor (so a free plan still reads as a step) plus
// the rest of the height in proportion to price, so every step stays ordered.
export function planSteps<T extends Pick<VendorOverview["plans"][number], "price" | "segment">>(plans: readonly T[], segments: readonly string[], floor = 10) {
  const priced = plans
    .filter((plan) => segments.includes(plan.segment))
    .flatMap((plan) => {
      const monthly = monthlyPrice(plan.price);
      return monthly === undefined ? [] : [{ plan, monthly }];
    })
    .sort((a, b) => a.monthly - b.monthly);
  const max = Math.max(1, ...priced.map((step) => step.monthly));
  return priced.map((step) => ({ ...step, heightPct: round(floor + (100 - floor) * (step.monthly / max)) }));
}

// Roadmap items grouped by the year of expectedAt (oldest first, each sorted
// by date), with undated items last under `undated`.
export function roadmapByYear<T extends Pick<VendorOverview["roadmap"][number], "expectedAt">>(items: readonly T[]) {
  const dated = items.filter((item) => item.expectedAt).sort((a, b) => (a.expectedAt ?? "").localeCompare(b.expectedAt ?? ""));
  const years = [...new Set(dated.map((item) => (item.expectedAt ?? "").slice(0, 4)))];
  return {
    years: years.map((year) => ({ year, items: dated.filter((item) => (item.expectedAt ?? "").startsWith(year)) })),
    undated: items.filter((item) => !item.expectedAt),
  };
}

// The `count` roadmap items expected soonest; undated items never lead.
export function soonestRoadmap<T extends Pick<VendorOverview["roadmap"][number], "expectedAt">>(items: readonly T[], count: number): T[] {
  return roadmapByYear(items)
    .years.flatMap((group) => group.items)
    .slice(0, Math.max(0, count));
}
