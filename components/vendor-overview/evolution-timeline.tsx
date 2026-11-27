import { ChevronDown } from "lucide-react";
import type { VendorOverview } from "@/lib/types";
import { TIMELINE_TYPES, TIMELINE_TYPE_LABELS, formatPartialDate, timelineByYear } from "@/lib/vendor-overview";
import { withBasePath } from "@/lib/site";
import { Chip, SourceLink } from "./primitives";
import { TimelineControls } from "./timeline-controls";

export function EvolutionTimeline({ overview }: { overview: VendorOverview }) {
  const years = timelineByYear(overview.timeline);
  const typeCounts = TIMELINE_TYPES.map((type) => ({
    id: type,
    label: TIMELINE_TYPE_LABELS[type],
    count: overview.timeline.filter((event) => event.type === type).length,
  })).filter((option) => option.count > 0);

  return (
    <div className="flex flex-col gap-6">
      <TimelineControls targetId="timeline-events" types={typeCounts} total={overview.timeline.length} />
      <div id="timeline-events" className="flex flex-col gap-6">
        {years.map(({ year, events }, index) => (
          <section key={year} data-year="" aria-labelledby={`timeline-${year}`}>
            {/* The two most recent years start open; earlier years collapse to keep the page scannable. */}
            <details data-year-details="" open={index < 2} className="group/year">
              <summary className="flex cursor-pointer list-none items-baseline gap-3 rounded-lg py-1 [&::-webkit-details-marker]:hidden">
                <h3 id={`timeline-${year}`} className="text-h2 tabular-nums text-[var(--color-text-primary)]">
                  {year}
                </h3>
                <span className="text-caption text-[var(--color-text-tertiary)]">
                  {events.length} {events.length === 1 ? "event" : "events"}
                </span>
                <ChevronDown size={16} aria-hidden="true" className="self-center text-[var(--color-text-secondary)] transition group-open/year:rotate-180" />
              </summary>
              <ol className="relative mt-3 ml-1 flex flex-col gap-5 border-l border-[var(--color-border)] pl-5">
                {events.map((event) => (
                  <li key={event.id} id={event.id} data-event="" data-type={event.type} data-impact={event.impact ?? ""} className="relative scroll-mt-40">
                    <span
                      aria-hidden="true"
                      className={`absolute -left-[1.6875rem] top-1.5 h-3 w-3 rounded-full border-2 border-[var(--color-bg-card)] ${
                        event.impact === "high" ? "bg-[var(--color-accent)]" : "bg-[var(--color-border-strong)]"
                      }`}
                    />
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <time dateTime={event.date} className="text-caption tabular-nums text-[var(--color-text-tertiary)]">
                        {formatPartialDate(event.date)}
                      </time>
                      <Chip tone={event.impact === "high" ? "accent" : "default"}>{TIMELINE_TYPE_LABELS[event.type]}</Chip>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">{event.title}</p>
                    <p className="mt-0.5 text-sm leading-6 text-[var(--color-text-secondary)]">{event.summary}</p>
                    <div className="mt-1 flex flex-wrap gap-x-3">
                      <SourceLink href={event.sourceUrl} label={event.sourceTitle} />
                      {event.updateId ? (
                        <a href={withBasePath(`/updates#${event.updateId}`)} className="text-xs font-medium text-[var(--color-accent)] hover:underline">
                          In the change feed →
                        </a>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </details>
          </section>
        ))}
      </div>
    </div>
  );
}
