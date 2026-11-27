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
import { formatPartialDate, headlineEntries } from "@/lib/vendor-overview";
import {
  availabilityByChannel,
  governanceSummary,
  isoPrism,
  planSteps,
  prismsViewBox,
  roadmapByYear,
  soonestRoadmap,
  timelineDensity,
  type Box,
} from "@/lib/vendor-viz";
import { getPlatformFragmentId } from "@/lib/platform-fragments";
import { withBasePath } from "@/lib/site";
import { SourceLink } from "./primitives";

const year = (date: string | undefined) => (date ? date.slice(0, 4) : null);

// ── Where to run: a tree from Claude to every channel ─────────────────────

export function ChannelTree({ availability, hub, hubVendor }: { availability: VendorAvailability[]; hub: string; hubVendor: string }) {
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
      <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-0">
        <span aria-hidden="true" className="absolute left-[16.667%] right-[16.667%] top-0 hidden h-0.5 bg-[var(--color-accent)] lg:block" />
        {groups.map((group) => (
          <div key={group.id} className="relative flex min-w-0 flex-col gap-3 lg:px-2 lg:pt-8">
            <span aria-hidden="true" className="absolute left-1/2 top-0 hidden h-8 w-0.5 bg-[var(--color-accent)] lg:block" />
            <h3 className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-accent)] bg-[var(--color-accent-soft)] px-3.5 py-1.5 text-sm font-semibold text-[var(--color-accent)] lg:mt-0">
              {group.label}
              <span className="tabular-nums opacity-70">{group.items.length}</span>
            </h3>
            <ul className="flex flex-col divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]">
              {group.items.map((item) => (
                <li key={item.id} id={`channel-${item.id}`} className="scroll-mt-40">
                  <details className="group/channel">
                    <summary className="flex cursor-pointer list-none items-center gap-3 px-3.5 py-2.5 hover:bg-[var(--color-bg-hover)] [&::-webkit-details-marker]:hidden">
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-[var(--color-text-primary)]">{item.name}</span>
                        <span className="block text-caption text-[var(--color-text-tertiary)]">
                          {item.operatedBy ? (
                            <span className={item.operatedBy === hubVendor ? "font-semibold text-[var(--color-accent)]" : undefined}>Run by {item.operatedBy}</span>
                          ) : null}
                          {item.operatedBy && item.since ? " · " : null}
                          {item.since ? `since ${year(item.since)}` : null}
                        </span>
                      </span>
                      <ChevronDown size={14} aria-hidden="true" className="shrink-0 text-[var(--color-text-tertiary)] transition group-open/channel:rotate-180" />
                    </summary>
                    <div className="flex flex-col gap-2 px-3.5 pb-3">
                      <ul className="vo-entry-kids" aria-label={`Available on ${item.name}`}>
                        {item.offers.map((offer) => (
                          <li key={offer}>{offer}</li>
                        ))}
                      </ul>
                      <p className="vo-entry-desc">
                        {item.note} <SourceLink href={item.sourceUrl} />
                      </p>
                      {item.platformId ? (
                        <a href={withBasePath(`/platforms#${getPlatformFragmentId(item.platformId)}`)} className="text-xs font-medium text-[var(--color-accent)] hover:underline">
                          Compare the platform →
                        </a>
                      ) : null}
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-4 text-caption text-[var(--color-text-tertiary)]">Open a channel for the models it offers, its limits and its source.</p>
    </div>
  );
}

// ── Plans as price tags ───────────────────────────────────────────────────

const SEGMENTS: { id: VendorPlanSegment[]; label: string }[] = [
  { id: ["team", "enterprise"], label: "For teams and enterprises" },
  { id: ["developer", "education", "public-sector"], label: "For developers, education and government" },
];

function PlanIncludes({ plan }: { plan: VendorPlan }) {
  return (
    <ul className="flex flex-col gap-1">
      {plan.includes.map((line) => (
        <li key={line} className="flex gap-2 text-[0.8125rem] leading-5 text-[var(--color-text-secondary)]">
          <Check size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--color-success)]" />
          {line}
        </li>
      ))}
    </ul>
  );
}

// One plan as a single row: name, price, what it adds, source.
function PlanRow({ plan }: { plan: VendorPlan }) {
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 px-4 py-3 sm:grid-cols-[11rem_12rem_minmax(0,1fr)] sm:items-baseline">
      <p className="text-sm font-semibold text-[var(--color-text-primary)]">{plan.name}</p>
      <p className="text-right sm:text-left">
        <span className="text-base font-semibold tabular-nums text-[var(--color-text-primary)]">{plan.price}</span>
        {plan.priceNote ? <span className="block text-caption text-[var(--color-text-tertiary)]">{plan.priceNote}</span> : null}
      </p>
      <p className="col-span-2 text-[0.8125rem] leading-5 text-[var(--color-text-secondary)] sm:col-span-1">
        {plan.includes.join(" · ")} <SourceLink href={plan.sourceUrl} />
      </p>
    </li>
  );
}

// Individual plans as a staircase: each step's height is its monthly price,
// so "how much more do I pay for the next tier" reads at a glance.
export function PlanTags({ plans }: { plans: VendorPlan[] }) {
  const steps = planSteps(plans, ["individual"]);
  const unstepped = plans.filter((plan) => plan.segment === "individual" && !steps.some((step) => step.plan.id === plan.id));
  return (
    <div className="flex flex-col gap-8">
      {steps.length > 0 ? (
        <div>
          <h3 className="mb-3 text-caption uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">For individuals, per month</h3>
          <ol className="grid gap-2 sm:gap-3" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
            {steps.map(({ plan, heightPct }, index) => {
              const seq = steps.length > 1 ? 5 - Math.round((index * 4) / (steps.length - 1)) : 1;
              return (
                <li key={plan.id} className="flex min-w-0 flex-col">
                  <div className="flex h-40 flex-col justify-end sm:h-48">
                    <p className="mb-1.5 text-lg font-semibold leading-tight tracking-tight text-[var(--color-text-primary)] sm:text-[1.75rem]">{plan.price}</p>
                    <div
                      aria-hidden="true"
                      className="vo-step rounded-t-xl"
                      style={{ height: `${heightPct}%`, "--slab": `var(--viz-seq-${seq})`, "--i": index } as CSSProperties}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 border-t-2 border-[var(--color-border-strong)] pt-2.5">
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {plan.name} <SourceLink href={plan.sourceUrl} />
                    </p>
                    {plan.priceNote ? <p className="text-caption text-[var(--color-text-tertiary)]">{plan.priceNote}</p> : null}
                    <div className="hidden sm:block">
                      <PlanIncludes plan={plan} />
                    </div>
                    <details className="sm:hidden">
                      <summary className="cursor-pointer text-caption font-medium text-[var(--color-accent)]">What&apos;s included</summary>
                      <div className="mt-1.5">
                        <PlanIncludes plan={plan} />
                      </div>
                    </details>
                  </div>
                </li>
              );
            })}
          </ol>
          {unstepped.length > 0 ? (
            <ul className="mt-4 divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)]">
              {unstepped.map((plan) => (
                <PlanRow key={plan.id} plan={plan} />
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      {SEGMENTS.map((segment) => {
        const items = plans.filter((plan) => segment.id.includes(plan.segment));
        if (items.length === 0) return null;
        return (
          <div key={segment.label}>
            <h3 className="mb-3 text-caption uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">{segment.label}</h3>
            <ul className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)]">
              {items.map((plan) => (
                <PlanRow key={plan.id} plan={plan} />
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
          <h3 className="text-caption uppercase tracking-[0.14em] text-[var(--color-warning)]">Read the limits</h3>
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
                    <SourceLink href={row.claim.sourceUrl} label={row.claim.sourceTitle} />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="text-caption uppercase tracking-[0.14em] text-[var(--color-success)]">In place</h3>
          <ul className="flex flex-wrap gap-2">
            {passes.map((row) => (
              <li
                key={row.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--color-success)_40%,var(--color-border))] px-3 py-1.5 text-sm font-medium text-[var(--color-text-primary)]"
              >
                <Check size={14} aria-hidden="true" className="shrink-0 text-[var(--color-success)]" />
                {row.label}
              </li>
            ))}
          </ul>
          <details className="group/pass">
            <summary className="inline-flex min-h-9 cursor-pointer list-none items-center gap-1 text-sm font-medium text-[var(--color-accent)] hover:underline [&::-webkit-details-marker]:hidden">
              <ChevronDown size={14} aria-hidden="true" className="transition group-open/pass:rotate-180" />
              What each covers, with sources
            </summary>
            <dl className="mt-2 flex flex-col gap-3">
              {passes.map((row) => (
                <div key={row.id}>
                  <dt className="text-sm font-medium text-[var(--color-text-primary)]">{row.label}</dt>
                  <dd className="vo-entry-desc">
                    {row.claim.detail} {row.claim.sourceUrl ? <SourceLink href={row.claim.sourceUrl} /> : null}
                  </dd>
                </div>
              ))}
            </dl>
          </details>
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
    <div id="safety-levels" className="flex scroll-mt-40 flex-col gap-3">
      <ol className="grid grid-cols-3 gap-2 sm:gap-3" aria-label="AI Safety Levels">
        {levels.map((level, index) => {
          const lit = level.state === "in-force";
          const faces = isoPrism(boxes[index]);
          return (
            <li
              key={level.id}
              className={`flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-end sm:gap-3 ${lit ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]" : "border-dashed border-[var(--color-border-strong)]"}`}
            >
              <svg viewBox={`${vb.x} ${vb.y} ${vb.width} ${vb.height}`} aria-hidden="true" className="h-12 w-auto shrink-0 self-start overflow-visible sm:h-16 sm:self-auto">
                <g className="vo-drop" style={{ "--i": index } as CSSProperties}>
                  <g className="vo-slab" data-slot={lit ? index + 1 : 6} style={lit ? undefined : { opacity: 0.5 }}>
                    <polygon className="vo-face-left" points={faces.left} />
                    <polygon className="vo-face-right" points={faces.right} />
                    <polygon className="vo-face-top" points={faces.top} />
                  </g>
                </g>
              </svg>
              <span className="flex min-w-0 flex-col">
                <span className="text-base font-semibold text-[var(--color-text-primary)] sm:text-lg">{level.label}</span>
                <span className={`text-caption ${lit ? "text-[var(--color-accent)]" : "text-[var(--color-text-tertiary)]"}`}>{SAFETY_STATE[level.state]}</span>
              </span>
            </li>
          );
        })}
      </ol>
      <details className="group/asl">
        <summary className="inline-flex min-h-9 cursor-pointer list-none items-center gap-1 text-sm font-medium text-[var(--color-accent)] hover:underline [&::-webkit-details-marker]:hidden">
          <ChevronDown size={14} aria-hidden="true" className="transition group-open/asl:rotate-180" />
          What each level means
        </summary>
        <dl className="mt-2 flex flex-col gap-3">
          {levels.map((level) => (
            <div key={level.id}>
              <dt className="text-sm font-medium text-[var(--color-text-primary)]">
                {level.label} · {SAFETY_STATE[level.state]}
              </dt>
              <dd className="vo-entry-desc">
                {level.summary} <SourceLink href={level.sourceUrl} />
              </dd>
            </div>
          ))}
        </dl>
      </details>
    </div>
  );
}

// ── Beyond the flagship ────────────────────────────────────────────────────

// The ecosystem families as tiles, then the sector editions as one chip row.
// Each name links into the catalog, where every entry carries its source.
export function BeyondFlagship({
  overview,
  counts,
  industries,
  flagship,
}: {
  overview: VendorOverview;
  counts: Record<string, number>;
  industries?: VendorDomain;
  flagship: string;
}) {
  const domains = overview.domains.filter((domain) => domain.cluster === "ecosystem");
  const sectors = industries ? headlineEntries(overview.entries, industries.id, 8) : [];
  return (
    <div className="flex flex-col gap-8">
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {domains.map((domain) => (
          <EcosystemCard key={domain.id} domain={domain} entries={headlineEntries(overview.entries, domain.id, 3)} count={counts[domain.id]} />
        ))}
      </ul>
      {industries ? (
        <div id={industries.id} className="flex scroll-mt-40 flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-h3 text-[var(--color-text-primary)]">
              {flagship} for your sector <span className="text-caption tabular-nums text-[var(--color-text-tertiary)]">{counts[industries.id]}</span>
            </h3>
            <a href={`#catalog-${industries.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-accent)] hover:underline">
              See all in the catalog
              <ArrowRight size={14} aria-hidden="true" />
            </a>
          </div>
          <ul className="flex flex-wrap gap-2">
            {sectors.map((entry) => (
              <li key={entry.id}>
                <a
                  href={`#entry-${entry.id}`}
                  className="inline-flex rounded-full border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-primary)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  {entry.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function EcosystemCard({ domain, entries, count }: { domain: VendorDomain; entries: VendorEntry[]; count: number }) {
  return (
    <li id={domain.id} className="vo-entry scroll-mt-40">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="vo-entry-name">{domain.label}</h3>
        <span className="text-caption tabular-nums text-[var(--color-text-tertiary)]">{count}</span>
      </div>
      <p className="vo-entry-desc">{domain.tagline}</p>
      <ul className="vo-entry-kids">
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

// ── Timeline river ────────────────────────────────────────────────────────

export function TimelineRiver({ events }: { events: VendorTimelineEvent[] }) {
  const density = timelineDensity(events);
  const maxStack = Math.max(1, ...density.flatMap((item) => item.quarters.map((quarter) => quarter.events.length)));
  const keyCount = events.filter((event) => event.impact === "high").length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-caption text-[var(--color-text-secondary)]" aria-label="Legend">
          <li className="inline-flex items-center gap-2">
            <span className="vo-tdot" aria-hidden="true" />
            Event <span className="tabular-nums text-[var(--color-text-tertiary)]">{events.length - keyCount}</span>
          </li>
          <li className="inline-flex items-center gap-2">
            <span className="vo-tdot" data-high="true" aria-hidden="true" />
            Key milestone <span className="tabular-nums text-[var(--color-text-tertiary)]">{keyCount}</span>
          </li>
        </ul>
        <div
          role="region"
          aria-label="Events per quarter, scrolls horizontally"
          tabIndex={0}
          className="vo-fade-x vo-scroll-end -mx-2 overflow-x-auto px-2 md:[mask-image:none]"
        >
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
                        <li key={event.id} className="flex">
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
    </div>
  );
}

// ── Roadmap horizon ───────────────────────────────────────────────────────

const STAGE_LABEL: Record<VendorRoadmapItem["stage"], string> = {
  announced: "Announced",
  preview: "In preview",
  "rolling-out": "Rolling out",
};

function RoadmapCard({ item }: { item: VendorRoadmapItem }) {
  return (
    <li className="vo-entry" data-prominence={item.stage === "announced" ? undefined : "headline"}>
      <p className="text-base font-semibold leading-tight text-[var(--color-text-primary)]">{item.expected ?? "Timing not stated"}</p>
      {item.stage !== "announced" ? <span className="text-caption text-[var(--color-accent)]">{STAGE_LABEL[item.stage]}</span> : null}
      <p className="vo-entry-name">{item.title}</p>
      <p className="vo-entry-desc">{item.summary}</p>
      <p className="mt-auto pt-1 text-caption text-[var(--color-text-tertiary)]">
        Stated {formatPartialDate(item.announcedAt)} <SourceLink href={item.sourceUrl} />
      </p>
    </li>
  );
}

// The few statements expected soonest, then every other one on the horizon.
export function RoadmapStrip({ items, count = 3 }: { items: VendorRoadmapItem[]; count?: number }) {
  const soonest = soonestRoadmap(items, count);
  const rest = items.filter((item) => !soonest.includes(item));
  return (
    <div className="flex flex-col gap-3">
      <ol className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {soonest.map((item) => (
          <RoadmapCard key={item.id} item={item} />
        ))}
      </ol>
      {rest.length > 0 ? (
        <details className="group/roadmap">
          <summary className="inline-flex min-h-9 cursor-pointer list-none items-center gap-1 text-sm font-medium text-[var(--color-accent)] hover:underline [&::-webkit-details-marker]:hidden">
            <ChevronDown size={14} aria-hidden="true" className="transition group-open/roadmap:rotate-180" />
            <span className="group-open/roadmap:hidden">{rest.length} more statements</span>
            <span className="hidden group-open/roadmap:inline">Fewer statements</span>
          </summary>
          <div className="mt-3">
            <RoadmapHorizon items={rest} />
          </div>
        </details>
      ) : null}
    </div>
  );
}

// Vendor-stated plans laid out on a horizon: one column per year the vendor
// names, soonest first, then whatever was announced without a date.
function RoadmapHorizon({ items }: { items: VendorRoadmapItem[] }) {
  const { years, undated } = roadmapByYear(items);
  const columns = [
    ...years.map((group) => ({ key: group.year, label: group.year, items: group.items })),
    ...(undated.length > 0 ? [{ key: "undated", label: "No date given", items: undated }] : []),
  ];
  return (
    <div className="flex flex-col gap-3">
      <div aria-hidden="true" className="hidden items-center gap-3 text-caption font-semibold text-[var(--color-text-tertiary)] md:flex">
        <span className="rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-[var(--color-text-inverse)]">Now</span>
        <span className="h-0.5 flex-1" style={{ background: "linear-gradient(90deg, var(--color-accent), transparent)" }} />
        <span>Ahead</span>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[repeat(var(--cols),minmax(0,1fr))] md:gap-4" style={{ "--cols": columns.length } as CSSProperties}>
        {columns.map((column) => (
          <section key={column.key} aria-label={column.label} className="flex flex-col gap-3">
            <h3 className="flex items-baseline justify-between border-b-2 border-[var(--color-border-strong)] pb-1.5">
              <span className={`text-lg font-semibold ${column.key === "undated" ? "text-[var(--color-text-tertiary)]" : "text-[var(--color-text-primary)]"}`}>
                {column.label}
              </span>
              <span className="text-caption tabular-nums text-[var(--color-text-tertiary)]">{column.items.length}</span>
            </h3>
            <ol className="flex flex-col gap-3">
              {column.items.map((item) => (
                <RoadmapCard key={item.id} item={item} />
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
