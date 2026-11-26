import { ArrowRight, Check, ChevronDown } from "lucide-react";
import type {
  GovernanceStatus,
  UpdateEntry,
  VendorAvailability,
  VendorDomain,
  VendorEntry,
  VendorGovernanceRow,
  VendorOverview,
  VendorPlan,
  VendorPlanSegment,
  VendorRoadmapItem,
  VendorSafetyLevel,
} from "@/lib/types";
import { ENTRY_KIND_LABELS, formatPartialDate, headlineEntries, type SourceLink as SourceLinkData } from "@/lib/vendor-overview";
import { getPlatformFragmentId } from "@/lib/platform-fragments";
import { withBasePath } from "@/lib/site";
import { Chip, SourceLink, StatusBadge } from "./primitives";

// ── Plans ─────────────────────────────────────────────────────────────────

const SEGMENTS: { id: VendorPlanSegment[]; label: string }[] = [
  { id: ["individual"], label: "Individuals" },
  { id: ["team", "enterprise"], label: "Teams and enterprise" },
  { id: ["developer"], label: "Developers" },
  { id: ["education", "public-sector"], label: "Education and public sector" },
];

function PlanCard({ plan }: { plan: VendorPlan }) {
  return (
    <li className="card flex min-w-0 flex-col gap-3 p-4">
      <div>
        <h4 className="text-h3 text-[var(--color-text-primary)]">{plan.name}</h4>
        <p className="mt-1 text-xl font-semibold tabular-nums text-[var(--color-text-primary)]">{plan.price}</p>
        {plan.priceNote ? <p className="text-caption text-[var(--color-text-secondary)]">{plan.priceNote}</p> : null}
      </div>
      <ul className="flex flex-col gap-1.5">
        {plan.includes.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-5 text-[var(--color-text-secondary)]">
            <Check size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--color-success)]" />
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-auto">
        <SourceLink href={plan.sourceUrl} label={`Source, checked ${formatPartialDate(plan.verifiedAt)}`} />
      </div>
    </li>
  );
}

export function PlanGrid({ plans }: { plans: VendorPlan[] }) {
  return (
    <div className="flex flex-col gap-6">
      {SEGMENTS.map((segment) => {
        const items = plans.filter((plan) => segment.id.includes(plan.segment));
        if (items.length === 0) return null;
        return (
          <div key={segment.label}>
            <h3 className="mb-2 text-caption uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">{segment.label}</h3>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {items.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

// ── Availability ──────────────────────────────────────────────────────────

const CHANNEL_LABEL: Record<VendorAvailability["channel"], string> = {
  direct: "Direct",
  cloud: "Cloud platform",
  partner: "Inside partner products",
};

export function AvailabilityGrid({ availability }: { availability: VendorAvailability[] }) {
  return (
    <div className="flex flex-col gap-6">
      {(["direct", "cloud", "partner"] as const).map((channel) => {
        const items = availability.filter((item) => item.channel === channel);
        if (items.length === 0) return null;
        return (
          <div key={channel}>
            <h3 className="mb-2 text-caption uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">{CHANNEL_LABEL[channel]}</h3>
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <li key={item.id} id={`channel-${item.id}`} className="card flex min-w-0 scroll-mt-40 flex-col gap-2 p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="text-h3 text-[var(--color-text-primary)]">{item.name}</h4>
                    {item.since ? <span className="shrink-0 text-caption text-[var(--color-text-tertiary)]">Since {formatPartialDate(item.since)}</span> : null}
                  </div>
                  <ul className="flex flex-wrap gap-1.5" aria-label={`Available on ${item.name}`}>
                    {item.offers.map((offer) => (
                      <li key={offer}>
                        <Chip>{offer}</Chip>
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm leading-6 text-[var(--color-text-secondary)]">{item.note}</p>
                  <div className="mt-auto flex flex-wrap gap-x-3">
                    <SourceLink href={item.sourceUrl} />
                    {item.platformId ? (
                      <a href={withBasePath(`/platforms#${getPlatformFragmentId(item.platformId)}`)} className="text-xs font-medium text-[var(--color-accent)] hover:underline">
                        Compare the platform →
                      </a>
                    ) : null}
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

// ── Governance ────────────────────────────────────────────────────────────

const CLAIM_LABEL: Record<GovernanceStatus, string> = { yes: "Yes", partial: "Partial", no: "No", "not-applicable": "N/A", unknown: "Unknown" };
const CLAIM_STYLE: Record<GovernanceStatus, string> = {
  yes: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
  partial: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
  no: "bg-[var(--color-danger-soft)] text-[var(--color-danger)]",
  "not-applicable": "bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)]",
  unknown: "bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)]",
};

export function GovernancePanel({ rows }: { rows: VendorGovernanceRow[] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-8 lg:grid-cols-2">
      {rows.map((row) => (
        <div key={row.id} className="flex flex-col gap-1 border-b border-[var(--color-border)] py-3 sm:flex-row sm:gap-4">
          <dt className="flex items-start gap-2 sm:w-52 sm:shrink-0">
            <span className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${CLAIM_STYLE[row.claim.status]}`}>{CLAIM_LABEL[row.claim.status]}</span>
            <span className="text-sm font-medium text-[var(--color-text-primary)]">{row.label}</span>
          </dt>
          <dd className="text-sm leading-6 text-[var(--color-text-secondary)]">
            {row.claim.detail}{" "}
            {row.claim.sourceUrl ? <SourceLink href={row.claim.sourceUrl} label={row.claim.sourceTitle ?? "Source"} /> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

// ── Safety levels ─────────────────────────────────────────────────────────

const SAFETY_STATE: Record<VendorSafetyLevel["state"], string> = {
  "in-force": "In force",
  defined: "Defined in policy",
  "not-yet-defined": "Not yet defined",
};

// Stepped scale of AI Safety Levels: each step rises, the active steps are
// filled. An ordered list so the order is explicit for assistive tech.
export function SafetyScale({ levels }: { levels: VendorSafetyLevel[] }) {
  return (
    <ol className="grid grid-cols-1 items-end gap-3 sm:grid-cols-3" aria-label="AI Safety Levels">
      {levels.map((level, index) => (
        <li
          key={level.id}
          className={`flex flex-col gap-2 rounded-xl border p-4 ${
            level.state === "in-force" ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]" : "border-dashed border-[var(--color-border-strong)]"
          }`}
          style={{ minHeight: `${7 + index * 1.5}rem` }}
        >
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-h3 text-[var(--color-text-primary)]">{level.label}</span>
            <span className="text-caption text-[var(--color-text-secondary)]">{SAFETY_STATE[level.state]}</span>
          </div>
          <p className="text-sm leading-6 text-[var(--color-text-secondary)]">{level.summary}</p>
          <SourceLink href={level.sourceUrl} className="mt-auto" />
        </li>
      ))}
    </ol>
  );
}

// ── Roadmap ───────────────────────────────────────────────────────────────

const STAGE_LABEL: Record<VendorRoadmapItem["stage"], string> = { announced: "Announced", preview: "In preview", "rolling-out": "Rolling out" };

export function RoadmapPanel({ items }: { items: VendorRoadmapItem[] }) {
  return (
    <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <li key={item.id} className="card flex min-w-0 flex-col gap-2 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone={item.stage === "announced" ? "default" : "accent"}>{STAGE_LABEL[item.stage]}</Chip>
            {item.expected ? <span className="text-caption font-semibold text-[var(--color-text-primary)]">{item.expected}</span> : null}
          </div>
          <h3 className="text-h3 text-[var(--color-text-primary)]">{item.title}</h3>
          <p className="text-sm leading-6 text-[var(--color-text-secondary)]">{item.summary}</p>
          <div className="mt-auto flex flex-wrap items-center gap-x-3 pt-1">
            <span className="text-caption text-[var(--color-text-tertiary)]">Stated {formatPartialDate(item.announcedAt)}</span>
            <SourceLink href={item.sourceUrl} />
          </div>
        </li>
      ))}
    </ul>
  );
}

// ── Company ───────────────────────────────────────────────────────────────

const PARTNER_TYPE_LABEL: Record<string, string> = {
  cloud: "Cloud and compute",
  investment: "Investment",
  technology: "Infrastructure",
  distribution: "Distribution",
  consulting: "Consulting and services",
  government: "Government",
  research: "Research and philanthropy",
};

export function CompanyPanel({ company }: { company: VendorOverview["company"] }) {
  const types = [...new Set(company.partnerships.map((partnership) => partnership.type))];
  return (
    <div className="flex flex-col gap-6">
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {company.facts.map((fact) => (
          <div key={fact.id} className="card flex flex-col gap-1 p-4">
            <dt className="text-caption uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">{fact.label}</dt>
            <dd className="text-sm leading-6 text-[var(--color-text-primary)]">
              {fact.value} <SourceLink href={fact.sourceUrl} />
            </dd>
          </div>
        ))}
      </dl>
      <div>
        <h3 className="text-h3 text-[var(--color-text-primary)]">Partnerships</h3>
        <div className="mt-3 grid grid-cols-1 gap-x-8 gap-y-5 lg:grid-cols-2">
          {types.map((type) => (
            <div key={type}>
              <p className="mb-1 text-caption uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">{PARTNER_TYPE_LABEL[type] ?? type}</p>
              <ul className="divide-y divide-[var(--color-border)]">
                {company.partnerships
                  .filter((partnership) => partnership.type === type)
                  .map((partnership) => (
                    <li key={partnership.id} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:gap-4">
                      <div className="sm:w-44 sm:shrink-0">
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">{partnership.partner}</p>
                        {partnership.date ? <p className="text-caption text-[var(--color-text-tertiary)]">Since {formatPartialDate(partnership.date)}</p> : null}
                      </div>
                      <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                        {partnership.summary} <SourceLink href={partnership.sourceUrl} />
                      </p>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Domain highlight panel ────────────────────────────────────────────────

export function DomainHighlights({ domain, entries, count }: { domain: VendorDomain; entries: VendorEntry[]; count: number }) {
  const highlights = headlineEntries(entries, domain.id, 6);
  return (
    <div className="flex flex-col gap-4">
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {highlights.map((entry) => (
          <li key={entry.id} className="card flex min-w-0 flex-col gap-2 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Chip>{ENTRY_KIND_LABELS[entry.kind]}</Chip>
              <StatusBadge status={entry.status} />
            </div>
            <a href={`#entry-${entry.id}`} className="text-h3 text-[var(--color-text-primary)] hover:text-[var(--color-accent)]">
              {entry.name}
            </a>
            <p className="text-sm leading-6 text-[var(--color-text-secondary)]">{entry.description}</p>
            <SourceLink href={entry.sourceUrl} className="mt-auto" />
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

// ── Sources and related updates ──────────────────────────────────────────

export function SourceList({ sources }: { sources: SourceLinkData[] }) {
  return (
    <details className="group/sources">
      <summary className="inline-flex min-h-9 cursor-pointer list-none items-center gap-1 rounded-full text-sm font-medium text-[var(--color-accent)] hover:underline [&::-webkit-details-marker]:hidden">
        <ChevronDown size={14} aria-hidden="true" className="transition group-open/sources:rotate-180" />
        <span className="group-open/sources:hidden">Show all {sources.length} sources</span>
        <span className="hidden group-open/sources:inline">Hide sources</span>
      </summary>
    <ol className="mt-3 grid list-decimal grid-cols-1 gap-x-8 gap-y-1.5 pl-6 text-sm marker:text-[var(--color-text-tertiary)] md:grid-cols-2 xl:grid-cols-3">
      {sources.map((source) => (
        <li key={source.url} className="min-w-0 pl-1">
          <a href={source.url} target="_blank" rel="noreferrer" className="break-words text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:underline">
            {source.title === source.url ? source.url.replace(/^https:\/\//, "") : source.title}
          </a>
        </li>
      ))}
    </ol>
    </details>
  );
}

export function RelatedUpdates({ updates }: { updates: UpdateEntry[] }) {
  if (updates.length === 0) return null;
  return (
    <ul className="divide-y divide-[var(--color-border)]">
      {updates.map((update) => (
        <li key={update.id} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:gap-4">
          <time dateTime={update.date} className="shrink-0 text-caption tabular-nums text-[var(--color-text-tertiary)] sm:w-24">
            {formatPartialDate(update.date)}
          </time>
          <a href={withBasePath(`/updates#${update.id}`)} className="text-sm text-[var(--color-text-primary)] hover:text-[var(--color-accent)] hover:underline">
            {update.title ?? update.summary}
          </a>
        </li>
      ))}
    </ul>
  );
}
