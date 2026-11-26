import { ArrowRight, Check, ChevronDown } from "lucide-react";
import type { CSSProperties } from "react";
import type {
  GovernanceStatus,
  VendorAvailability,
  VendorDomain,
  VendorEntry,
  VendorGovernanceRow,
  VendorOverview,
  VendorPlan,
  VendorPlanSegment,
  VendorRoadmapItem,
  VendorSafetyLevel,
  VendorTimelineEvent,
} from "@/lib/types";
import { TIMELINE_TYPE_LABELS, formatPartialDate, headlineEntries } from "@/lib/vendor-overview";
import {
  TIMELINE_FAMILIES,
  availabilityByChannel,
  governanceSummary,
  isoPrism,
  orbitAngles,
  orbitPoint,
  prismsViewBox,
  timelineDensity,
  timelineFamily,
  timelineMilestones,
  type Box,
} from "@/lib/vendor-viz";
import { getPlatformFragmentId } from "@/lib/platform-fragments";
import { withBasePath } from "@/lib/site";
import { SourceLink } from "./primitives";

const year = (date: string | undefined) => (date ? date.slice(0, 4) : null);

// ── Where to run: a tree from Claude to every channel ─────────────────────

export function ChannelTree({ availability, hub }: { availability: VendorAvailability[]; hub: string }) {
  const groups = availabilityByChannel(availability);
  return (
    <div className="flex flex-col items-stretch">
      <div className="flex justify-center">
        <span className="vo-orbit-core inline-flex items-center gap-2 rounded-full px-6 py-3 text-lg font-semibold text-[var(--color-text-inverse)]">
          {hub}
          <span className="rounded-full bg-[color-mix(in_srgb,var(--color-text-inverse)_18%,transparent)] px-2 py-0.5 text-xs tabular-nums">
            {availability.length} ways in
          </span>
        </span>
      </div>
      <span aria-hidden="true" className="mx-auto hidden h-8 w-0.5 bg-[var(--color-accent)] lg:block" />
      <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr_1fr] lg:gap-0">
        <span aria-hidden="true" className="absolute left-[12.5%] right-[12.5%] top-0 hidden h-0.5 bg-[var(--color-accent)] lg:block" />
        {groups.map((group) => (
          <div key={group.id} className="relative flex min-w-0 flex-col gap-3 lg:px-2 lg:pt-8">
            <span aria-hidden="true" className="absolute left-1/2 top-0 hidden h-8 w-0.5 bg-[var(--color-accent)] lg:block" />
            <h3 className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-accent)] bg-[var(--color-accent-soft)] px-3.5 py-1.5 text-sm font-semibold text-[var(--color-accent)] lg:mt-0">
              {group.label}
              <span className="tabular-nums opacity-70">{group.items.length}</span>
            </h3>
            <ul className={`grid grid-cols-1 gap-3 ${group.id === "cloud" ? "sm:grid-cols-2" : ""}`}>
              {group.items.map((item, index) => (
                <li key={item.id} id={`channel-${item.id}`} className="vo-entry vo-reveal scroll-mt-40" style={{ "--i": index } as CSSProperties}>
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="vo-entry-name">{item.name}</h4>
                    {item.since ? <span className="shrink-0 text-caption text-[var(--color-text-tertiary)]">since {year(item.since)}</span> : null}
                  </div>
                  <ul className="vo-entry-kids" aria-label={`Available on ${item.name}`}>
                    {item.offers.map((offer) => (
                      <li key={offer}>{offer}</li>
                    ))}
                  </ul>
                  <p className="vo-entry-desc">{item.note}</p>
                  <div className="mt-auto flex flex-wrap gap-x-3 pt-1">
                    <SourceLink href={item.sourceUrl} />
                    {item.platformId ? (
                      <a
                        href={withBasePath(`/platforms#${getPlatformFragmentId(item.platformId)}`)}
                        className="text-xs font-medium text-[var(--color-accent)] hover:underline"
                      >
                        Compare the platform →
                      </a>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Plans as price tags ───────────────────────────────────────────────────

const SEGMENTS: { id: VendorPlanSegment[]; label: string }[] = [
  { id: ["individual"], label: "For individuals" },
  { id: ["team", "enterprise"], label: "For teams and enterprises" },
  {
    id: ["developer", "education", "public-sector"],
    label: "For developers, education and government",
  },
];

export function PlanTags({ plans }: { plans: VendorPlan[] }) {
  return (
    <div className="flex flex-col gap-6">
      {SEGMENTS.map((segment) => {
        const items = plans.filter((plan) => segment.id.includes(plan.segment));
        if (items.length === 0) return null;
        return (
          <div key={segment.label}>
            <h3 className="mb-3 text-caption uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">{segment.label}</h3>
            <ul className="vo-rail vo-fade-x sm:grid-flow-row sm:grid-cols-2 sm:overflow-visible sm:[mask-image:none] lg:grid-cols-4">
              {items.map((plan) => (
                <li key={plan.id} className="vo-entry">
                  <p className="text-sm font-semibold text-[var(--color-text-secondary)]">{plan.name}</p>
                  <p className="text-[1.75rem] font-semibold leading-tight tracking-tight text-[var(--color-text-primary)]">{plan.price}</p>
                  {plan.priceNote ? <p className="text-caption text-[var(--color-text-tertiary)]">{plan.priceNote}</p> : null}
                  <ul className="mt-1 flex flex-col gap-1">
                    {plan.includes.map((line) => (
                      <li key={line} className="flex gap-2 text-[0.8125rem] leading-5 text-[var(--color-text-secondary)]">
                        <Check size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--color-success)]" />
                        {line}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-1">
                    <SourceLink href={plan.sourceUrl} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

// ── Trust wall ────────────────────────────────────────────────────────────

const CLAIM_LABEL: Record<GovernanceStatus, string> = {
  yes: "In place",
  partial: "With limits",
  no: "Not offered",
  "not-applicable": "N/A",
  unknown: "Unknown",
};
const CLAIM_COLOR: Record<GovernanceStatus, string> = {
  yes: "var(--color-success)",
  partial: "var(--color-warning)",
  no: "var(--color-danger)",
  "not-applicable": "var(--color-text-tertiary)",
  unknown: "var(--color-text-tertiary)",
};

function StatusRing({ status }: { status: GovernanceStatus }) {
  const circumference = 2 * Math.PI * 9;
  const share = status === "yes" ? 1 : status === "partial" ? 0.5 : 0;
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" className="shrink-0 -rotate-90">
      <circle cx="12" cy="12" r="9" fill="none" stroke="var(--color-border)" strokeWidth="3" />
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke={CLAIM_COLOR[status]}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={`${share * circumference} ${circumference}`}
      />
    </svg>
  );
}

export function TrustWall({ rows }: { rows: VendorGovernanceRow[] }) {
  const { counts, ordered } = governanceSummary(rows);
  const total = rows.length || 1;
  const caveats = ordered.filter((row) => row.claim.status !== "yes");
  const passes = ordered.filter((row) => row.claim.status === "yes");
  return (
    <div className="flex flex-col gap-6">
      <div className="flex max-w-xl flex-col gap-2">
        <p className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
          <span>
            <span className="text-[2.25rem] font-semibold tabular-nums text-[var(--color-success)]">{counts.yes}</span>{" "}
            <span className="text-sm text-[var(--color-text-secondary)]">controls in place</span>
          </span>
          <span>
            <span className="text-[2.25rem] font-semibold tabular-nums text-[var(--color-warning)]">{caveats.length}</span>{" "}
            <span className="text-sm text-[var(--color-text-secondary)]">with limits worth reading</span>
          </span>
        </p>
        <div aria-hidden="true" className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--color-bg-hover)]">
          <div className="vo-bar rounded-none bg-[var(--color-success)]" style={{ width: `${(counts.yes / total) * 100}%` }} />
          <div className="vo-bar rounded-none bg-[var(--color-warning)]" style={{ width: `${(caveats.length / total) * 100}%`, "--i": 3 } as CSSProperties} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        {/* The caveats are what a buyer has to read, so they come first and in full. */}
        <div className="flex flex-col gap-3">
          <h4 className="text-caption uppercase tracking-[0.14em] text-[var(--color-warning)]">Read the limits</h4>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {caveats.map((row) => (
              <li key={row.id} className="vo-entry border-[color-mix(in_srgb,var(--color-warning)_45%,var(--color-border))]">
                <div className="flex items-center gap-3">
                  <StatusRing status={row.claim.status} />
                  <div className="min-w-0">
                    <p className="vo-entry-name">{row.label}</p>
                    <p className="text-caption" style={{ color: CLAIM_COLOR[row.claim.status] }}>
                      {CLAIM_LABEL[row.claim.status]}
                    </p>
                  </div>
                </div>
                <p className="vo-entry-desc">{row.claim.detail}</p>
                {row.claim.sourceUrl ? (
                  <div className="mt-auto pt-1">
                    <SourceLink href={row.claim.sourceUrl} label={row.claim.sourceTitle ?? "Source"} />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <h4 className="text-caption uppercase tracking-[0.14em] text-[var(--color-success)]">In place</h4>
          <ul className="flex flex-col divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)]">
            {passes.map((row) => (
              <li key={row.id}>
                <details className="group/claim">
                  <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-2.5 hover:bg-[var(--color-bg-hover)] [&::-webkit-details-marker]:hidden">
                    <StatusRing status={row.claim.status} />
                    <span className="min-w-0 flex-1 text-sm font-medium text-[var(--color-text-primary)]">{row.label}</span>
                    <ChevronDown size={14} aria-hidden="true" className="shrink-0 text-[var(--color-text-tertiary)] transition group-open/claim:rotate-180" />
                  </summary>
                  <div className="flex flex-col gap-1.5 px-3 pb-3 pl-[3.25rem]">
                    <p className="vo-entry-desc">{row.claim.detail}</p>
                    {row.claim.sourceUrl ? <SourceLink href={row.claim.sourceUrl} label={row.claim.sourceTitle ?? "Source"} /> : null}
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ── AI Safety Levels as rising isometric steps ────────────────────────────

const SAFETY_STATE: Record<VendorSafetyLevel["state"], string> = {
  "in-force": "In force",
  defined: "Defined in policy",
  "not-yet-defined": "Not yet defined",
};

// Each level is a block drawn on its own card, one step taller than the last.
export function AslSteps({ levels }: { levels: VendorSafetyLevel[] }) {
  const maxH = 30 + (levels.length - 1) * 26;
  const boxes: Box[] = levels.map((_, index) => ({ x: 0, y: 0, z: 0, w: 46, d: 46, h: 30 + index * 26 }));
  const vb = prismsViewBox([{ x: 0, y: 0, z: 0, w: 46, d: 46, h: maxH }], 4);
  return (
    <ol id="safety-levels" className="grid scroll-mt-40 grid-cols-1 items-stretch gap-3 sm:grid-cols-3" aria-label="AI Safety Levels">
      {levels.map((level, index) => {
        const lit = level.state === "in-force";
        const faces = isoPrism(boxes[index]);
        return (
          <li key={level.id} className={`vo-entry ${lit ? "" : "border-dashed"}`} data-prominence={lit ? "headline" : undefined}>
            <div className="flex items-end gap-4">
              <svg viewBox={`${vb.x} ${vb.y} ${vb.width} ${vb.height}`} aria-hidden="true" className="h-24 w-auto shrink-0 overflow-visible">
                <g className="vo-drop" style={{ "--i": index } as CSSProperties}>
                  <g className="vo-slab" data-slot={lit ? index + 1 : 6} style={lit ? undefined : { opacity: 0.5 }}>
                    <polygon className="vo-face-left" points={faces.left} />
                    <polygon className="vo-face-right" points={faces.right} />
                    <polygon className="vo-face-top" points={faces.top} />
                  </g>
                </g>
              </svg>
              <div className="flex min-w-0 flex-col pb-1">
                <span className="text-xl font-semibold text-[var(--color-text-primary)]">{level.label}</span>
                <span className={`text-caption ${lit ? "text-[var(--color-accent)]" : "text-[var(--color-text-tertiary)]"}`}>{SAFETY_STATE[level.state]}</span>
              </div>
            </div>
            <p className="vo-entry-desc">{level.summary}</p>
            <div className="mt-auto pt-1">
              <SourceLink href={level.sourceUrl} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ── Ecosystem orbit ───────────────────────────────────────────────────────

// Four ecosystem families as clusters in the corners of a wide figure, each
// tied by a connector to its arc on a ring around the company core.
const ORBIT = { width: 880, height: 460, r: 168 };
const CORNERS = [
  { side: "right", vertical: "top", anchor: [676, 58] },
  { side: "right", vertical: "bottom", anchor: [676, 402] },
  { side: "left", vertical: "bottom", anchor: [204, 402] },
  { side: "left", vertical: "top", anchor: [204, 58] },
] as const;

export function EcosystemOrbit({ overview, counts, flagship }: { overview: VendorOverview; counts: Record<string, number>; flagship: string }) {
  const domains = overview.domains.filter((domain) => domain.cluster === "ecosystem");
  const chips = domains.map((domain) => headlineEntries(overview.entries, domain.id, 3));
  const cx = ORBIT.width / 2;
  const cy = ORBIT.height / 2;
  const circumference = 2 * Math.PI * ORBIT.r;
  const span = 360 / Math.max(domains.length, 1);
  const gapDeg = 12;
  const arc = (circumference * (span - gapDeg)) / 360;
  const angles = orbitAngles(domains.length, []);
  const showFigure = domains.length > 0 && domains.length <= CORNERS.length;

  return (
    <div className="flex flex-col gap-8">
      {showFigure ? (
        <div className="vo-orbit relative mx-auto hidden lg:block" style={{ width: ORBIT.width, height: ORBIT.height }}>
          <svg viewBox={`0 0 ${ORBIT.width} ${ORBIT.height}`} aria-hidden="true" className="absolute inset-0 h-full w-full">
            <circle cx={cx} cy={cy} r={ORBIT.r * 0.62} fill="none" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="2 6" />
            {domains.map((domain, index) => {
              const at = orbitPoint(angles[index].center, 50);
              const dot = [cx + (ORBIT.r * (at.left - 50)) / 50, cy + (ORBIT.r * (at.top - 50)) / 50];
              const anchor = CORNERS[index].anchor;
              return (
                <g key={domain.id}>
                  <circle
                    className="vo-orbit-arc"
                    data-q={index}
                    cx={cx}
                    cy={cy}
                    r={ORBIT.r}
                    strokeWidth={5}
                    strokeDasharray={`${arc} ${circumference}`}
                    transform={`rotate(${index * span - 90 + gapDeg / 2} ${cx} ${cy})`}
                  />
                  <path
                    d={`M${dot[0]},${dot[1]} L${anchor[0]},${anchor[1]}`}
                    stroke="color-mix(in srgb, var(--viz-eco) 55%, transparent)"
                    strokeWidth="1.5"
                    strokeDasharray="3 4"
                    fill="none"
                  />
                  <circle cx={dot[0]} cy={dot[1]} r="7" fill="var(--color-bg-card)" stroke="var(--viz-eco)" strokeWidth="3" />
                </g>
              );
            })}
          </svg>
          <div className="vo-orbit-core absolute left-1/2 top-1/2 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full text-center text-[var(--color-text-inverse)]">
            <span className="text-xl font-semibold">{overview.name}</span>
            <span className="text-xs opacity-80">and {flagship}</span>
          </div>
          {domains.map((domain, index) => {
            const corner = CORNERS[index];
            const right = corner.side === "right";
            return (
              <div
                key={domain.id}
                data-q={index}
                className={`absolute flex w-[196px] flex-col gap-1.5 ${right ? "items-start text-left" : "items-end text-right"}`}
                style={{
                  [right ? "left" : "right"]: right ? corner.anchor[0] + 6 : ORBIT.width - corner.anchor[0] + 6,
                  [corner.vertical]: 12,
                }}
              >
                <a href={`#${domain.id}`} className="rounded-lg px-1 hover:bg-[var(--color-bg-hover)]">
                  <span className="block text-sm font-semibold text-[var(--viz-eco)]">{domain.label}</span>
                  <span className="block text-caption tabular-nums text-[var(--color-text-tertiary)]">{counts[domain.id]} offerings</span>
                </a>
                {chips[index].map((entry) => (
                  <a
                    key={entry.id}
                    href={`#entry-${entry.id}`}
                    className="max-w-full rounded-2xl border border-[color-mix(in_srgb,var(--viz-eco)_40%,var(--color-border))] bg-[var(--color-bg-card)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-primary)] shadow-[var(--shadow-1)] transition hover:border-[var(--viz-eco)]"
                  >
                    {entry.name}
                  </a>
                ))}
              </div>
            );
          })}
        </div>
      ) : null}

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {domains.map((domain, index) => (
          <EcosystemCard key={domain.id} domain={domain} entries={chips[index]} count={counts[domain.id]} />
        ))}
      </ul>
    </div>
  );
}

function EcosystemCard({ domain, entries, count }: { domain: VendorDomain; entries: VendorEntry[]; count: number }) {
  return (
    <li id={domain.id} className="vo-entry scroll-mt-40">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="vo-entry-name">{domain.label}</h3>
        <span className="text-caption tabular-nums text-[var(--viz-eco)]">{count}</span>
      </div>
      <p className="vo-entry-desc">{domain.tagline}</p>
      <ul className="vo-entry-kids lg:hidden">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a href={`#entry-${entry.id}`} className="hover:text-[var(--color-accent)]">
              {entry.name}
            </a>
          </li>
        ))}
      </ul>
      <a href={`#catalog-${domain.id}`} className="mt-auto inline-flex items-center gap-1 pt-1 text-xs font-medium text-[var(--color-accent)] hover:underline">
        View all {count}
        <ArrowRight size={12} aria-hidden="true" />
      </a>
    </li>
  );
}

// ── Industry tiles ────────────────────────────────────────────────────────

export function DomainTiles({ domain, entries, count }: { domain: VendorDomain; entries: VendorEntry[]; count: number }) {
  const highlights = headlineEntries(entries, domain.id, 6);
  return (
    <div className="flex flex-col gap-4">
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {highlights.map((entry, index) => (
          <li key={entry.id} className="vo-entry vo-reveal" style={{ "--i": index } as CSSProperties}>
            <a href={`#entry-${entry.id}`} className="vo-entry-name hover:text-[var(--color-accent)]">
              {entry.name}
            </a>
            <p className="vo-entry-desc">{entry.description}</p>
            <div className="mt-auto pt-1">
              <SourceLink href={entry.sourceUrl} />
            </div>
          </li>
        ))}
      </ul>
      <a href={`#catalog-${domain.id}`} className="inline-flex items-center gap-1 self-start text-sm font-medium text-[var(--color-accent)] hover:underline">
        See all {count} in the catalog
        <ArrowRight size={14} aria-hidden="true" />
      </a>
    </div>
  );
}

// ── Company band ──────────────────────────────────────────────────────────

const PARTNER_TYPE_LABEL: Record<string, string> = {
  cloud: "Cloud and compute",
  investment: "Investment",
  distribution: "Distribution",
  government: "Government",
  research: "Research",
  consulting: "Consulting and services",
  technology: "Technology",
};

export function CompanyBand({ company }: { company: VendorOverview["company"] }) {
  const [lead, ...rest] = company.facts;
  return (
    <div className="flex flex-col gap-6">
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[lead, ...rest].filter(Boolean).map((fact, index) => (
          <div key={fact.id} className="vo-entry vo-reveal" style={{ "--i": index % 6 } as CSSProperties} data-prominence={index < 2 ? "headline" : undefined}>
            <dt className="text-caption uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">{fact.label}</dt>
            <dd
              className={
                index < 2 ? "text-lg font-semibold leading-snug text-[var(--color-text-primary)]" : "text-sm leading-6 text-[var(--color-text-primary)]"
              }
            >
              {fact.value}
            </dd>
            <dd className="mt-auto">
              <SourceLink href={fact.sourceUrl} />
            </dd>
          </div>
        ))}
      </dl>
      <div>
        <h3 className="mb-3 text-h3 text-[var(--color-text-primary)]">Partners</h3>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {company.partnerships.map((partnership) => (
            <li key={partnership.id} className="vo-entry">
              <div className="flex items-baseline justify-between gap-2">
                <p className="vo-entry-name">{partnership.partner}</p>
                {partnership.date ? (
                  <span className="shrink-0 text-caption tabular-nums text-[var(--color-text-tertiary)]">{year(partnership.date)}</span>
                ) : null}
              </div>
              <p className="text-caption text-[var(--color-text-tertiary)]">{PARTNER_TYPE_LABEL[partnership.type] ?? partnership.type}</p>
              <p className="vo-entry-desc">{partnership.summary}</p>
              <SourceLink href={partnership.sourceUrl} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── Timeline river ────────────────────────────────────────────────────────

export function TimelineRiver({ events }: { events: VendorTimelineEvent[] }) {
  const density = timelineDensity(events);
  const milestones = timelineMilestones(events);
  const maxStack = Math.max(1, ...density.flatMap((item) => item.quarters.map((quarter) => quarter.events.length)));
  const familyCounts = TIMELINE_FAMILIES.map((family) => ({
    ...family,
    count: events.filter((event) => timelineFamily(event.type) === family.id).length,
  }));
  const first = milestones[0];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-caption text-[var(--color-text-secondary)]" aria-label="Event families">
          {familyCounts.map((family) => (
            <li key={family.id} className={`vo-family-${family.id} inline-flex items-center gap-2`}>
              <span className="vo-tdot" aria-hidden="true" />
              {family.label} <span className="tabular-nums text-[var(--color-text-tertiary)]">{family.count}</span>
            </li>
          ))}
          <li className="vo-family-neutral inline-flex items-center gap-2">
            <span className="vo-tdot" data-high="true" aria-hidden="true" />
            Key milestone
          </li>
        </ul>
        <div role="region" aria-label="Events per quarter, scrolls horizontally" tabIndex={0} className="vo-fade-x vo-scroll-end -mx-2 overflow-x-auto px-2 md:[mask-image:none]">
          <ol className="flex min-w-[640px] items-end gap-3">
            {density.map((item) => (
              <li key={item.year} className="flex flex-col gap-2" style={{ flex: `${Math.max(1.2, Math.sqrt(item.count))} 1 0%` }}>
                <div
                  className="flex items-end justify-around gap-1 border-b border-[var(--color-border)] pb-1.5"
                  style={{ minHeight: `${maxStack * 15 + 8}px` }}
                >
                  {item.quarters.map((quarter) => (
                    <ol
                      key={quarter.quarter}
                      className="flex flex-col-reverse items-center gap-[5px]"
                      aria-label={`Q${quarter.quarter} ${item.year}: ${quarter.events.length} events`}
                    >
                      {quarter.events.map((event) => (
                        <li key={event.id} className={`vo-family-${event.family} flex`}>
                          <a href={`#${event.id}`} title={event.title} className="flex">
                            <span className="vo-tdot" data-high={String(event.high)} />
                            <span className="sr-only">{event.title}</span>
                          </a>
                        </li>
                      ))}
                    </ol>
                  ))}
                </div>
                <p className="flex items-baseline justify-between px-1">
                  <span className="text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">{item.year}</span>
                  <span className="text-caption tabular-nums text-[var(--color-text-tertiary)]">{item.count}</span>
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-h3 text-[var(--color-text-primary)]">{milestones.length} moments that shaped it</h3>
          {first ? (
            <a href={`#m-${first.id}`} className="text-sm font-medium text-[var(--color-accent)] hover:underline">
              ← Back to the start
            </a>
          ) : null}
        </div>
        <div
          role="region"
          aria-label="Key milestones, newest on the right"
          tabIndex={0}
          className="vo-fade-x vo-scroll-end overflow-x-auto overscroll-x-contain [scroll-snap-type:x_mandatory]"
        >
          <ol className="vo-track">
            {milestones.map((event) => (
              <li
                key={event.id}
                id={`m-${event.id}`}
                className={`vo-family-${timelineFamily(event.type)} vo-entry scroll-mt-40`}
                style={{ borderTop: "3px solid var(--fam)" }}
              >
                <time dateTime={event.date} className="text-lg font-semibold tabular-nums text-[var(--color-text-primary)]">
                  {formatPartialDate(event.date)}
                </time>
                <span className="text-caption" style={{ color: "var(--fam)" }}>
                  {TIMELINE_TYPE_LABELS[event.type]}
                </span>
                <p className="vo-entry-name">{event.title}</p>
                <p className="vo-entry-desc line-clamp-3">{event.summary}</p>
                <div className="mt-auto pt-1">
                  <SourceLink href={event.sourceUrl} label={event.sourceTitle ?? "Source"} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

// ── Roadmap horizon ───────────────────────────────────────────────────────

const STAGE_LABEL: Record<VendorRoadmapItem["stage"], string> = {
  announced: "Announced",
  preview: "In preview",
  "rolling-out": "Rolling out",
};

export function RoadmapHorizon({ items }: { items: VendorRoadmapItem[] }) {
  return (
    <div className="flex flex-col gap-3">
      <div aria-hidden="true" className="flex items-center gap-3 text-caption font-semibold text-[var(--color-text-tertiary)]">
        <span className="rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-[var(--color-text-inverse)]">Now</span>
        <span
          className="h-0.5 flex-1"
          style={{
            background: "linear-gradient(90deg, var(--color-accent), var(--viz-cat-2), transparent)",
          }}
        />
        <span>Ahead</span>
      </div>
      <ol className="vo-rail vo-fade-x">
        {items.map((item) => (
          <li key={item.id} className="vo-entry" data-prominence={item.stage === "announced" ? undefined : "headline"}>
            <p className="text-lg font-semibold leading-tight text-[var(--color-text-primary)]">{item.expected ?? "Timing not stated"}</p>
            <span className="text-caption text-[var(--color-accent)]">{STAGE_LABEL[item.stage]}</span>
            <p className="vo-entry-name">{item.title}</p>
            <p className="vo-entry-desc">{item.summary}</p>
            <div className="mt-auto flex flex-wrap items-center gap-x-3 pt-1">
              <span className="text-caption text-[var(--color-text-tertiary)]">Stated {formatPartialDate(item.announcedAt)}</span>
              <SourceLink href={item.sourceUrl} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
